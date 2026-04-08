from datetime import date

import pytest

from mavis.test.constants import ConsentOption, ConsentRefusalReason, Programme
from mavis.test.data_models import Child
from mavis.test.pages import (
    OnlineConsentWizardPage,
    SessionsOverviewPage,
    StartPage,
)
from mavis.test.utils import assert_questions_in_pdf, read_pdf_as_normalized_text


@pytest.fixture
def url_with_mmr_session_scheduled(schedule_mmrv_session_and_get_consent_url, schools):
    """Get consent URL for MMRV-eligible children using the MMRV link."""
    yield from schedule_mmrv_session_and_get_consent_url(
        schools[Programme.MMR_MMRV.group][0],
        Programme.MMR_MMRV,
    )


@pytest.fixture
def start_consent_with_session_scheduled(
    url_with_mmr_session_scheduled,
    page,
):
    page.goto(url_with_mmr_session_scheduled)
    StartPage(page).start()


@pytest.fixture
def setup_logged_in_session_with_file_upload(
    url_with_mmr_session_scheduled,
    setup_logged_in_session_with_file_upload_for_programme,
):
    """Sets up an MMRV session with class list and navigates to the session."""
    return setup_logged_in_session_with_file_upload_for_programme(Programme.MMR_MMRV)


@pytest.fixture
def mmrv_children(year_groups) -> dict[str, list[Child]]:
    """Generate MMRV-eligible children with manually set DOBs."""

    # Generate children using default year groups
    children_dict = Child.generate_children_in_year_group_for_each_programme_group(
        2, year_groups
    )

    # Override DOBs to ensure MMRV eligibility (Year group after 1/1/2020 = 1/9/2020)
    for programme_group in children_dict:
        for child in children_dict[programme_group]:
            child.date_of_birth = date(2020, 9, 1)

    return children_dict


def test_consent_refused_for_mmrv_vaccination(
    start_consent_with_session_scheduled, page, schools, mmrv_children
):
    """
    Test: Submit an online consent form refusing MMRV vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page.
    2. Select 'do not agree' to vaccination.
    3. Choose refusal reason and provide details.
    4. Submit the consent form.
    Verification:
    - Confirmation text indicates consent was refused for MMRV vaccination.
    """
    child = mmrv_children[Programme.MMR_MMRV][0]
    schools = schools[Programme.MMR_MMRV]

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).dont_agree_to_vaccination()
    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    OnlineConsentWizardPage(page).click_confirm()
    # Check confirmation message for MMRV-specific text
    OnlineConsentWizardPage(page).expect_confirmation_text("Consent refused")
    OnlineConsentWizardPage(page).expect_confirmation_text(
        "to get the MMRV vaccination at school"
    )


@pytest.mark.parametrize(
    "yes_to_health_questions",
    [False, True],
    ids=lambda v: f"yes_to_health_questions: {v}",
)
@pytest.mark.parametrize(
    "consent_option",
    [ConsentOption.MMR_WITHOUT_GELATINE, ConsentOption.MMR_EITHER],
    ids=lambda v: f"consent_option: {v}",
)
def test_consent_given_for_mmrv_vaccination(
    start_consent_with_session_scheduled,
    page,
    schools,
    yes_to_health_questions,
    consent_option,
    mmrv_children,
):
    """
    Test: Submit an online consent form giving consent for MMRV vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page, optionally changing school.
    2. Agree to MMRV vaccination.
    3. Fill in address details.
    4. Answer the required number of health questions (includes
       MMRV-specific questions), optionally marking one as 'yes'.
    5. Submit the consent form.
    Verification:
    - Confirmation message is shown for the correct child, vaccine, and
      health question status.
    - MMRV-specific health questions are presented (allergic reaction to MMRV vaccine).
    """
    child = mmrv_children[Programme.MMR_MMRV][0]
    schools = schools[Programme.MMR_MMRV]

    number_of_health_questions = len(
        Programme.health_questions(
            Programme.MMR_MMRV, consent_option, mmrv_eligibility=True
        )
    )

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_mmr_vaccination(consent_option)
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=yes_to_health_questions,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.MMR_MMRV],
        yes_to_health_questions=yes_to_health_questions,
    )


@pytest.mark.parametrize(
    "consent_option",
    [ConsentOption.MMR_WITHOUT_GELATINE, ConsentOption.MMR_EITHER],
    ids=lambda v: f"consent_option: {v}",
)
def test_pdf_consent_form_contains_health_questions(
    setup_logged_in_session_with_file_upload,
    page,
    consent_option,
):
    """Test that PDF consent form contains all MMRV health questions for consent option.

    Verifies that the downloadable PDF consent form includes all health questions
    that parents need to answer when giving consent for their child to receive MMRV.
    Uses mmrv_eligibility=True to ensure MMRV-specific questions are included.
    """
    programme = Programme.MMR_MMRV

    pdf_text_normalized = read_pdf_as_normalized_text(
        SessionsOverviewPage(page).download_consent_form(programme, prefer_mmrv=True)
    )

    expected_questions = programme.health_questions(
        consent_option, mmrv_eligibility=True
    )

    assert_questions_in_pdf(
        pdf_text_normalized,
        expected_questions,
        context=f"MMRV {consent_option} consent PDF",
    )

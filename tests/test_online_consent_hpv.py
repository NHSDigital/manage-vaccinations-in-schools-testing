import pytest

from mavis.test.constants import ConsentOption, ConsentRefusalReason, Programme
from mavis.test.pages import (
    OnlineConsentWizardPage,
    SessionsOverviewPage,
    StartPage,
)
from mavis.test.utils import assert_questions_in_pdf, read_pdf_as_normalized_text

pytestmark = pytest.mark.consent


@pytest.fixture
def url_with_session_scheduled(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.HPV.group][0],
        Programme.HPV,
    )


@pytest.fixture
def start_consent_with_session_scheduled(url_with_session_scheduled, page):
    page.goto(url_with_session_scheduled)
    StartPage(page).start()


@pytest.fixture
def setup_logged_in_session_with_file_upload(
    url_with_session_scheduled,
    setup_logged_in_session_with_file_upload_for_programme,
):
    """Sets up an HPV session with class list and navigates to the session."""
    return setup_logged_in_session_with_file_upload_for_programme(Programme.HPV)


def test_consent_refused_for_hpv_vaccination(
    start_consent_with_session_scheduled, page, schools, children
):
    """
    Test: Submit an online consent form refusing HPV vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page.
    2. Select 'do not agree' to vaccination.
    3. Choose refusal reason and provide details.
    4. Submit the consent form.
    Verification:
    - Confirmation text indicates consent was refused for HPV vaccination.
    """
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).dont_agree_to_vaccination()
    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).expect_confirmation_text(
        f"Consent refusedYou’ve told us that you do not want"
        f" {child.first_name} {child.last_name} to get the HPV vaccination at school"
    )


@pytest.mark.parametrize(
    "yes_to_health_questions",
    [False, True],
    ids=lambda v: f"yes_to_health_questions: {v}",
)
def test_consent_given_for_hpv_vaccination(
    start_consent_with_session_scheduled,
    page,
    schools,
    yes_to_health_questions,
    children,
):
    """
    Test: Submit an online consent form giving consent for HPV vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page, optionally changing school.
    2. Agree to HPV vaccination.
    3. Fill in address details.
    4. Answer the required number of health questions, optionally marking one as 'yes'.
    5. Submit the consent form.
    Verification:
    - Confirmation message is shown for the correct child, vaccine, and
      health question status.
    """
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]
    number_of_health_questions = len(Programme.health_questions(Programme.HPV))

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_hpv_vaccination()
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=yes_to_health_questions,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.HPV],
        yes_to_health_questions=yes_to_health_questions,
    )


def test_pdf_consent_form_contains_health_questions(
    setup_logged_in_session_with_file_upload,
    page,
):
    """Test that PDF consent form contains all health questions for HPV.

    Verifies that the downloadable PDF consent form includes all health questions
    that parents need to answer when giving consent for their child to be vaccinated.
    """
    programme = Programme.HPV
    consent_option = ConsentOption.INJECTION

    pdf_text_normalized = read_pdf_as_normalized_text(
        SessionsOverviewPage(page).download_consent_form(programme)
    )

    expected_questions = programme.health_questions(consent_option)

    assert_questions_in_pdf(
        pdf_text_normalized,
        expected_questions,
        context=f"{programme} {consent_option} consent PDF",
    )

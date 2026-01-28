import pytest

from mavis.test.annotations import issue
from mavis.test.constants import (
    ConsentOption,
    Programme,
    Vaccine,
)
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages.utils import (
    prepare_child_for_vaccination,
    record_nurse_consent_and_vaccination,
)


@pytest.fixture
def setup_session_for_flu(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.FLU)


@issue("MAV-955")
@pytest.mark.rav
@pytest.mark.bug
@pytest.mark.parametrize(
    "consent_option",
    [
        ConsentOption.NASAL_SPRAY_OR_INJECTION,
        ConsentOption.NASAL_SPRAY,
        ConsentOption.INJECTION,
    ],
    ids=lambda v: f"consent_option: {v}",
)
def test_e2e_nurse_consent_flu(
    log_in_as_nurse,
    setup_session_for_flu,
    schools,
    page,
    children,
    consent_option,
):
    """
    Test: Verify a vaccination can be recorded after providing nurse consent for flu
    Steps:
    1. Setup: Schedule sessions for doubles at a school and
       import a fixed child class list.
    2. Navigate to the session and register the child as attending.
    3. Record verbal consent for the child.
    4. Record both vaccinations for the child with a long notes field.
    Verification:
    - Vaccinations can be recorded
    - Providing long notes gives an error
    """
    batch_names = setup_session_for_flu
    programme_group = Programme.FLU
    vaccine = (
        Vaccine.SEQUIRUS
        if consent_option is ConsentOption.INJECTION
        else Vaccine.FLUENZ
    )

    child = children[programme_group][0]
    school = schools[programme_group][0]

    flu_vaccination_record = VaccinationRecord(
        child,
        Programme.FLU,
        batch_names[vaccine],
        consent_option,
    )

    prepare_child_for_vaccination(
        page,
        school,
        programme_group,
        child,
    )

    record_nurse_consent_and_vaccination(
        page,
        flu_vaccination_record,
    )

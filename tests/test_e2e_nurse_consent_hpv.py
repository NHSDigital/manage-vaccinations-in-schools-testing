import pytest

from mavis.test.annotations import issue
from mavis.test.constants import (
    Programme,
    Vaccine,
)
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages.utils import (
    prepare_child_for_vaccination,
    record_nurse_consent_and_vaccination,
)


@pytest.fixture
def setup_session_for_hpv(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.HPV)


@issue("MAV-955")
@pytest.mark.rav
@pytest.mark.bug
def test_e2e_nurse_consent_hpv(
    setup_session_for_hpv,
    schools,
    page,
    children,
):
    """
    Test: Verify a vaccination can be recorded after providing nurse consent for HPV
    Steps:
    1. Setup: Schedule sessions for HPV at a school and
       import a fixed child class list.
    2. Navigate to the session and register the child as attending.
    3. Record verbal consent for the child.
    4. Record a vaccination for the child with a long notes field.
    Verification:
    - Vaccination can be recorded
    - Providing long notes gives an error
    """
    batch_names = setup_session_for_hpv
    programme_group = Programme.HPV
    child = children[programme_group][0]
    school = schools[programme_group][0]

    hpv_vaccination_record = VaccinationRecord(
        child,
        Programme.HPV,
        batch_names[Vaccine.GARDASIL_9],
    )

    prepare_child_for_vaccination(
        page,
        school,
        programme_group,
        child,
    )

    record_nurse_consent_and_vaccination(
        page,
        hpv_vaccination_record,
    )

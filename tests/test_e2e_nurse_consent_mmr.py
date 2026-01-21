import pytest

from mavis.test.annotations import issue
from mavis.test.constants import (
    MMRV_ELIGIBILITY_CUTOFF_DOB,
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
def setup_session_for_mmr(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.MMR)


@issue("MAV-955")
@pytest.mark.rav
@pytest.mark.bug
@pytest.mark.parametrize(
    "consent_option",
    [
        ConsentOption.MMR_WITHOUT_GELATINE,
        ConsentOption.MMR_EITHER,
    ],
    ids=lambda v: f"consent_option: {v}",
)
def test_e2e_nurse_consent_mmr(
    setup_session_for_mmr,
    schools,
    page,
    children,
    consent_option,
):
    """
    Test: Verify a vaccination can be recorded after providing nurse consent for MMR
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
    batch_names = setup_session_for_mmr
    programme_group = Programme.MMR

    child = children[programme_group][0]
    school = schools[programme_group][0]

    mmrv_eligibility = child.date_of_birth > MMRV_ELIGIBILITY_CUTOFF_DOB
    if mmrv_eligibility:
        vaccine = (
            Vaccine.PRIORIX_TETRA
            if consent_option is ConsentOption.MMR_WITHOUT_GELATINE
            else Vaccine.PROQUAD
        )
    else:
        vaccine = (
            Vaccine.PRIORIX
            if consent_option is ConsentOption.MMR_WITHOUT_GELATINE
            else Vaccine.MMR_VAXPRO
        )

    child = children[programme_group][0]
    school = schools[programme_group][0]

    mmr_vaccination_record = VaccinationRecord(
        child,
        Programme.MMR,
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
        mmr_vaccination_record,
        mmrv_eligibility=mmrv_eligibility,
    )

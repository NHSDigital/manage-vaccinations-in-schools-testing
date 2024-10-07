import pytest

from pages import pg_parental_consent
from tests.helpers import parental_consent_helper


class Test_Regression_Consent:
    pc = pg_parental_consent.pg_parental_consent()
    helper = parental_consent_helper.parental_consent_helper()

    @pytest.mark.regression
    @pytest.mark.order(301)
    @pytest.mark.parametrize("row", helper.df.iterrows())
    def test_reg_parental_consent_workflow(self, start_consent_workflow, row):
        self.helper.read_data_for_scenario(row_data=row)
        self.helper.enter_details()

import pytest

from libs.mavis_constants import test_data_values

from .helpers.parental_consent_helper_doubles import ParentalConsentHelper


helper = ParentalConsentHelper()
organisation = test_data_values.ORG_CODE


@pytest.fixture
def get_session_link(nurse, dashboard_page, log_in_page, sessions_page):
    try:
        log_in_page.navigate()
        log_in_page.log_in_and_select_role(**nurse, organisation=organisation)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1()
        link = sessions_page.get_doubles_consent_url()
        log_in_page.log_out()
        yield link
    finally:
        log_in_page.navigate()
        log_in_page.log_in_and_select_role(**nurse, organisation=organisation)
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        log_in_page.log_out()


@pytest.mark.consent
@pytest.mark.mobile
@pytest.mark.order(801)
@pytest.mark.parametrize(
    "scenario_data",
    helper.df.iterrows(),
    ids=[tc[0] for tc in helper.df.iterrows()],
)
def test_workflow(get_session_link, scenario_data, page, consent_page, start_page):
    helper.read_data_for_scenario(scenario_data=scenario_data)
    page.goto(get_session_link)
    start_page.start()
    helper.enter_details_on_mavis(consent_page)

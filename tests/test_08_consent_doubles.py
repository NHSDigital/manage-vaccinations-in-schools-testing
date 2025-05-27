import pytest

from .helpers.parental_consent_helper_doubles import ParentalConsentHelper


helper = ParentalConsentHelper()


@pytest.fixture(scope="function")
def get_session_link(nurse, dashboard_page, login_page, sessions_page):
    try:
        login_page.log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1()
        link = sessions_page.get_doubles_consent_url()
        login_page.log_out()
        yield link
    finally:
        login_page.go_to_login_page()
        login_page.log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.mark.consent
@pytest.mark.mobile
@pytest.mark.order(801)
@pytest.mark.parametrize(
    "scenario_data",
    helper.df.iterrows(),
    ids=[tc[0] for tc in helper.df.iterrows()],
)
def test_workflow(get_session_link, scenario_data, page, consent_page):
    helper.read_data_for_scenario(scenario_data=scenario_data)
    page.goto(get_session_link)
    helper.enter_details_on_mavis(consent_page)

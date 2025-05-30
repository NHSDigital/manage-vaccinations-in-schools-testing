import pytest

from mavis.test.mavis_constants import Programme

from .helpers.parental_consent_helper_doubles import ParentalConsentHelper


helper = ParentalConsentHelper()


@pytest.fixture
def url(get_online_consent_url):
    yield from get_online_consent_url(Programme.MENACWY, Programme.TD_IPV)


@pytest.mark.consent
@pytest.mark.mobile
@pytest.mark.order(801)
@pytest.mark.parametrize(
    "scenario_data",
    helper.df.iterrows(),
    ids=[tc[0] for tc in helper.df.iterrows()],
)
def test_workflow(url, scenario_data, page, consent_page, start_page):
    page.goto(url)

    helper.read_data_for_scenario(scenario_data=scenario_data)
    start_page.start()
    helper.enter_details_on_mavis(consent_page)

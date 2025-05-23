import pytest

from libs.mavis_constants import vaccines
from pages import DashboardPage, LoginPage, VaccinesPage


login_page = LoginPage()
dashboard_page = DashboardPage()
vaccines_page = VaccinesPage()

doubles_vaccines = [
    vaccines.MENQUADFI,
    vaccines.MENVEO,
    vaccines.NIMENRIX,
    vaccines.REVAXIS,
]


@pytest.fixture(scope="function", autouse=True)
def setup_tests(start_mavis, nurse):
    login_page.log_in(**nurse)
    dashboard_page.click_vaccines()
    yield
    login_page.log_out()


@pytest.mark.vaccsbatch
@pytest.mark.order(601)
def test_batch_add_change_archive_hpv():
    vaccines_page.add_batch(vaccine_name=vaccines.GARDASIL9)
    vaccines_page.change_batch(vaccine_name=vaccines.GARDASIL9)
    vaccines_page.archive_batch(vaccine_name=vaccines.GARDASIL9)


@pytest.mark.vaccsbatch
@pytest.mark.order(602)
@pytest.mark.parametrize(
    "vaccine",
    doubles_vaccines,
    ids=[id[0] for id in doubles_vaccines],
)
def test_batch_add_change_archive_doubles(vaccine):
    vaccines_page.add_batch(vaccine_name=vaccine)
    vaccines_page.change_batch(vaccine_name=vaccine)
    vaccines_page.archive_batch(vaccine_name=vaccine)

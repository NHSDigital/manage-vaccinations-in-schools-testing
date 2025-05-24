import pytest

from libs.mavis_constants import Vaccine


@pytest.fixture(scope="function", autouse=True)
def setup_tests(start_mavis, nurse, login_page, dashboard_page):
    login_page.log_in(**nurse)
    dashboard_page.click_vaccines()
    yield
    login_page.log_out()


@pytest.mark.vaccsbatch
@pytest.mark.order(601)
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_add_change_archive(vaccine, vaccines_page):
    vaccines_page.add_batch(vaccine=vaccine)
    vaccines_page.change_batch(vaccine=vaccine)
    vaccines_page.archive_batch(vaccine=vaccine)

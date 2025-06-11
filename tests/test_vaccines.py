import allure
import pytest

from mavis.test.models import Vaccine

pytestmark = pytest.mark.vaccines


@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_add_change_archive(
    log_in_as_nurse, vaccine, dashboard_page, vaccines_page
):
    dashboard_page.click_vaccines()
    vaccines_page.add_batch(vaccine)
    vaccines_page.change_batch(vaccine)
    vaccines_page.archive_batch(vaccine)


@allure.issue("MAV-955")
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_add_long_batch_name(
    log_in_as_nurse, vaccine, dashboard_page, vaccines_page
):
    batch_name = "a" * 101
    dashboard_page.click_vaccines()
    vaccines_page.add_batch(vaccine, batch_name=batch_name)

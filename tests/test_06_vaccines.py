import pytest

from libs.mavis_constants import Vaccine


@pytest.mark.vaccines
@pytest.mark.order(601)
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_add_change_archive(
    log_in_as_nurse, vaccine, dashboard_page, vaccines_page
):
    dashboard_page.click_vaccines()
    vaccines_page.add_batch(vaccine=vaccine)
    vaccines_page.change_batch(vaccine=vaccine)
    vaccines_page.archive_batch(vaccine=vaccine)

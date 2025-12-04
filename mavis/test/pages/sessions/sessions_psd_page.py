from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.models import (
    Child,
)
from mavis.test.pages.header import HeaderComponent
from mavis.test.pages.sessions.search_component import SearchComponent
from mavis.test.pages.sessions.sessions_tabs import SessionsTabs
from mavis.test.utils import (
    reload_until_element_is_visible,
)


class SessionsPsdPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search = SearchComponent(page)
        self.tabs = SessionsTabs(page)
        self.header = HeaderComponent(page)

        self.add_new_psds_link = self.page.get_by_role(
            "link",
            name="Add new PSDs",
        )
        self.yes_add_psds_button = self.page.get_by_role(
            "button",
            name="Yes, add PSDs",
        )

    @step("Check {1} has PSD")
    def check_child_has_psd(self, child: Child) -> None:
        child_with_psd_locator = self.search.get_patient_card_locator(
            child
        ).get_by_text("PSD added")
        reload_until_element_is_visible(self.page, child_with_psd_locator)

    @step("Check {1} does not have PSD")
    def check_child_does_not_have_psd(self, child: Child) -> None:
        child_without_psd_locator = self.search.get_patient_card_locator(
            child
        ).get_by_text("PSD not added")
        reload_until_element_is_visible(self.page, child_without_psd_locator)

    @step("Click Add new PSDs")
    def click_add_new_psds(self) -> None:
        self.add_new_psds_link.click()

    @step("Click Yes, add PSDs")
    def click_yes_add_psds(self) -> None:
        self.yes_add_psds_button.click()

    @step("Check PSD banner")
    def verify_psd_banner_has_patients(self, number_of_patients: int) -> None:
        psd_banner = self.page.get_by_text(
            f"There are {number_of_patients} children with consent"
        )
        reload_until_element_is_visible(self.page, psd_banner)

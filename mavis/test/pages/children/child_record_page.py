import datetime

from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import get_todays_date


class ChildRecordPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.secondary_menu = page.get_by_label("Secondary menu")
        self.child_record_link = self.secondary_menu.get_by_role(
            "link", name="Child record"
        )

        self.edit_child_record_button = self.page.get_by_role(
            "link",
            name="Edit child record",
        )

        self.archive_child_record_link = self.page.get_by_role(
            "link", name="Archive child record"
        )

        self.vaccinations_card = page.locator("section").filter(
            has=page.get_by_role("heading", name="Vaccinations"),
        )

    @step("Click on Child record")
    def click_child_record(self) -> None:
        self._click_tab(self.child_record_link)

    @step("Click on {1}")
    def click_programme(self, programme: Programme) -> None:
        link = self.secondary_menu.get_by_role("link", name=str(programme))
        self._click_tab(link)

    def _click_tab(self, link: Locator) -> None:
        link.click()
        link.get_by_role("strong").wait_for()
        self.page.wait_for_load_state()

    @step("Click on Edit child record")
    def click_edit_child_record(self) -> None:
        self.edit_child_record_button.click()

    @step("Click on Archive child record")
    def click_archive_child_record(self) -> None:
        self.archive_child_record_link.click()

    def check_child_is_unarchived(self) -> None:
        expect(self.archive_child_record_link).to_be_visible()

    def _link_for_vaccination_record(self, date: datetime.date) -> Locator:
        return self.vaccinations_card.filter(
            has_text=str(date.strftime("%-d %B %Y"))
        ).get_by_role(
            "link",
        )

    def click_vaccination_record(self, date: datetime.date | None = None) -> None:
        self._click_vaccination_record(date or get_todays_date())

    @step("Click on {1} vaccination record")
    def _click_vaccination_record(self, date: datetime.date) -> None:
        self.page.wait_for_load_state()

        with self.page.expect_navigation(url="**/vaccination-records/**"):
            self._link_for_vaccination_record(date).click()

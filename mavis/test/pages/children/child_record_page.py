import datetime

from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import (
    click_secondary_navigation_item,
    format_nhs_number,
    get_todays_date,
    reload_until_element_is_visible,
)


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
        click_secondary_navigation_item(self.child_record_link)

    @step("Click on {1}")
    def click_programme(self, programme: Programme) -> None:
        link = self.secondary_menu.get_by_role("link", name=str(programme))
        click_secondary_navigation_item(link)

    @step("Click on Edit child record")
    def click_edit_child_record(self) -> None:
        self.edit_child_record_button.click()

    @step("Click on Archive child record")
    def click_archive_child_record(self) -> None:
        self.archive_child_record_link.click()

    def check_child_is_unarchived(self) -> None:
        expect(self.archive_child_record_link).to_be_visible()

    def expect_nhs_number(self, nhs_number: str) -> None:
        """Wait for the NHS number to appear, reloading if necessary.

        The NHS number may be populated by a background PDS lookup after
        record creation, so the page may initially show "Not provided".
        """
        formatted = format_nhs_number(nhs_number)
        reload_until_element_is_visible(self.page, self.page.get_by_text(formatted))

    def _link_for_vaccination_record(self, date: datetime.date) -> Locator:
        return self.vaccinations_card.filter(
            has_text=str(date.strftime("%-d %B %Y"))
        ).get_by_role(
            "link",
        )

    def click_vaccination_record(self, date: datetime.date | None = None) -> None:
        self._click_vaccination_record(date or get_todays_date())

    @step("Checking for '{1}' in the activity log")
    def expect_activity_log_entry(
        self, heading_name: str, *, unique: bool = False
    ) -> None:
        heading = self.page.get_by_role("heading", name=heading_name)

        if unique:
            expect(heading).to_be_visible()
        else:
            expect(heading.first).to_be_visible()

    @step("Check no '{1}' entry in the activity log")
    def expect_no_activity_log_entry(self, heading_name: str) -> None:
        expect(self.page.get_by_role("heading", name=heading_name)).not_to_be_visible()

    def _activity_log_entry_section(self, heading_name: str) -> "Locator":
        return (
            self.page.locator("li")
            .filter(has=self.page.get_by_role("heading", name=heading_name))
            .first
        )

    @step("Check activity log entry '{1}' shows {2} field(s) updated")
    def expect_activity_log_n_fields_updated(
        self, heading_name: str, n_fields: int
    ) -> None:
        entry = self._activity_log_entry_section(heading_name)
        field_text = (
            "1 field updated" if n_fields == 1 else f"{n_fields} fields updated"
        )
        expect(entry.get_by_text(field_text)).to_be_visible()

    @step("Open activity log entry details for '{1}'")
    def open_activity_log_entry_details(self, heading_name: str) -> None:
        details = self._activity_log_entry_section(heading_name).locator("details")
        if not details.evaluate("el => el.hasAttribute('open')"):
            details.locator("summary").click()

    @step("Check activity log entry '{1}' shows {2} changed from '{3}' to '{4}'")
    def expect_activity_log_field_change(
        self, heading_name: str, field_label: str, old_value: str, new_value: str
    ) -> None:
        entry = self._activity_log_entry_section(heading_name)
        row = entry.locator(".nhsuk-summary-list__row").filter(
            has=self.page.locator("dt", has_text=field_label)
        )
        expect(row).to_contain_text(old_value)
        expect(row).to_contain_text(new_value)

    @step("Click on {1} vaccination record")
    def _click_vaccination_record(self, date: datetime.date) -> None:
        self.page.wait_for_load_state()

        with self.page.expect_navigation(url="**/vaccination-records/**"):
            self._link_for_vaccination_record(date).click()

import time
from datetime import timedelta

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.data_models import Location, School
from mavis.test.pages.children.child_record_tabs import ChildRecordTabs
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import get_current_datetime


class ChildRecordPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = ChildRecordTabs(page)
        self.header = HeaderComponent(page)

        vaccinations_card = page.locator("section").filter(
            has=page.get_by_role("heading", name="Vaccinations"),
        )
        self.vaccinations_card_row = vaccinations_card.get_by_role("row")
        self.child_record_link = self.page.get_by_role("link", name="Child record")
        self.invite_to_community_clinic_button = self.page.get_by_role(
            "button",
            name="Invite to community clinic",
        )
        self.edit_child_record_button = self.page.get_by_role(
            "link",
            name="Edit child record",
        )
        self.archive_child_record_link = self.page.get_by_role(
            "link", name="Archive child record"
        )
        self.vaccination_record_link = self.page.get_by_role(
            "link",
            name=(get_current_datetime() - timedelta(days=1)).strftime("%-d %B %Y"),
        )
        self.activity_log_tab = self.page.get_by_role("link", name="Activity log")

    @step("Click Activity log tab")
    def click_activity_log_tab(self) -> None:
        self.activity_log_tab.click()

    @step("Click on {2} session for programme")
    def click_session_for_programme(
        self,
        location: Location,
        programme: Programme,
        *,
        check_date: bool = False,
    ) -> None:
        locator = self.page.get_by_role("row", name=str(location)).filter(
            has_text=str(programme),
        )
        if check_date:
            today_str = get_current_datetime().strftime("%-d %B %Y")
            locator = locator.filter(has_text=today_str)
        locator.get_by_role("link").click()

        ten_seconds_ms = 10000
        expect(self.page.get_by_role("link", name=str(programme))).to_be_visible(
            timeout=ten_seconds_ms,
        )

    @step("Click on {1} vaccination details")
    def click_vaccination_details(self, school: School) -> None:
        vaccination_details_locator = self.vaccinations_card_row.filter(
            has_text=str(school)
        ).get_by_role(
            "link",
        )

        self.page.wait_for_load_state()
        time.sleep(1)
        with self.page.expect_navigation(url="**/vaccination-records/**"):
            vaccination_details_locator.click()

    @step("Verify one vaccination appears for {1} + {2}")
    def verify_one_vaccination_appears(
        self, school: School, programme: Programme
    ) -> None:
        self.page.wait_for_load_state()
        vaccination_details_locator = (
            self.vaccinations_card_row.filter(has_text=str(school))
            .filter(has_text=str(programme))
            .get_by_role(
                "link",
            )
        )
        if vaccination_details_locator.count() != 1:
            msg = (
                f"Expected one vaccination record for {school} and {programme}, "
                f"but found {vaccination_details_locator.count()}"
            )
            raise AssertionError(msg)

    @step("Click on Child record")
    def click_child_record(self) -> None:
        self.child_record_link.click()
        self.child_record_link.get_by_role("strong").wait_for()
        self.page.wait_for_load_state()

    @step("Click Invite to community clinic")
    def click_invite_to_community_clinic(self) -> None:
        self.invite_to_community_clinic_button.click()

    @step("Click on Edit child record")
    def click_edit_child_record(self) -> None:
        self.edit_child_record_button.click()

    @step("Click on Archive child record")
    def click_archive_child_record(self) -> None:
        self.archive_child_record_link.click()

    def check_child_is_unarchived(self) -> None:
        expect(self.archive_child_record_link).to_be_visible()

    @step("Click on Vaccination record link")
    def click_vaccination_record_link(self) -> None:
        self.vaccination_record_link.click()

import datetime

from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.data_models import Location
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import get_todays_date, reload_until_element_is_visible


class ChildProgrammePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.vaccination_record_card = page.locator("section").filter(
            has=page.get_by_role("heading", name="Vaccination record"),
        )

        self.sessions_card = page.locator("section").filter(
            has=page.get_by_role("heading", name="Sessions"),
        )

        self.invite_to_community_clinic_button = self.page.get_by_role(
            "button",
            name="Invite to community clinic",
        )

        self.manually_matched_card = self.page.get_by_text(
            "Consent response manually matched with child record",
        )

    def _link_for_vaccination_record(self, date: datetime.date) -> Locator:
        return self.vaccination_record_card.filter(
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

    def verify_one_vaccination_appears(self, date: datetime.date | None = None) -> None:
        self._verify_one_vaccination_appears(date or get_todays_date())

    @step("Verify one vaccination appears for {1}")
    def _verify_one_vaccination_appears(self, date: datetime.date) -> None:
        self.page.wait_for_load_state()

        link = self._link_for_vaccination_record(date)

        if (count := link.count()) != 1:
            message = f"Expected one vaccination record for {date}, but found {count}"
            raise AssertionError(message)

    def _link_for_session(self, location: Location, date: datetime.date) -> Locator:
        return self.sessions_card.filter(
            has_text=str(date.strftime("%-d %B %Y"))
        ).get_by_role("link", name=str(location))

    def click_session(
        self, location: Location, date: datetime.date | None = None
    ) -> None:
        self._click_session(location, date or get_todays_date())

    @step("Click on {2} session at {1}")
    def _click_session(self, location: Location, date: datetime.date) -> None:
        self.page.wait_for_load_state()
        self._link_for_session(location, date).click()

    @step("Click Invite to community clinic")
    def click_invite_to_community_clinic(self) -> None:
        self.invite_to_community_clinic_button.click()

    def check_log_updates_with_match(self) -> None:
        self.page.wait_for_load_state()
        reload_until_element_is_visible(
            self.page,
            self.manually_matched_card,
            seconds=30,
        )

    def verify_activity_log_for_created_or_matched_child(
        self,
    ) -> None:
        self.expect_activity_log_header("Consent given")

        self.check_log_updates_with_match()

    def expect_activity_log_header(self, header: str, *, unique: bool = False) -> None:
        if unique:
            expect(self.page.get_by_role("heading", name=header)).to_be_visible()
        else:
            expect(self.page.get_by_role("heading", name=header).first).to_be_visible()

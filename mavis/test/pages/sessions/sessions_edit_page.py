import re
from datetime import date

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import (
    Programme,
)
from mavis.test.pages.header import HeaderComponent
from mavis.test.utils import (
    expect_alert_text,
    expect_details,
    get_day_month_year_from_compact_date,
    get_offset_date,
    get_offset_date_compact_format,
)


class SessionsEditPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.add_another_date_button = self.page.get_by_role(
            "button",
            name="Add another date",
        )
        self.change_psd_link = self.page.get_by_role(
            "link", name="Change   use patient specific direction"
        )
        self.change_programmes_link = self.page.get_by_role(
            "link", name="Change   programmes"
        )
        self.change_session_dates_link = self.page.get_by_role(
            "link",
            name="Change   session dates",
        )
        self.add_session_dates_link = self.page.get_by_role(
            "link",
            name="Add session dates",
        )
        self.save_changes_link = self.page.get_by_role("button", name="Save changes")
        self.day_textbox = self.page.get_by_role("textbox", name="Day")
        self.month_textbox = self.page.get_by_role("textbox", name="Month")
        self.year_textbox = self.page.get_by_role("textbox", name="Year")
        self.delete_button = self.page.get_by_role("button", name="Delete")
        self.keep_session_dates_button = self.page.get_by_role(
            "button", name="Keep session dates"
        )
        self.back_link = self.page.get_by_role("link", name="Back", exact=True).first
        self.continue_button = self.page.get_by_role("button", name="Continue")

    @step("Click on Continue")
    def click_continue_button(self) -> None:
        self.continue_button.click()

    def __schedule_session(self, date: date) -> None:
        compact_date = date.strftime("%Y%m%d")
        self.add_or_change_session_dates()
        if not self.session_date_already_scheduled(compact_date):
            self.fill_date_fields(compact_date)
        self.click_continue_button()

    @step("Go to Change session dates page")
    def add_or_change_session_dates(self) -> None:
        locator = self.add_session_dates_link.or_(self.change_session_dates_link).first
        locator.click()

    def edit_a_session_to_today(self) -> None:
        _future_date = get_offset_date_compact_format(offset_days=0)
        self.__edit_session(date=_future_date)

    def __edit_session(self, date: str) -> None:
        self.click_change_session_dates()
        if not self.session_date_already_scheduled(date):
            self.fill_date_fields(date, edit_existing_date=True)
        self.click_continue_button()
        self.click_save_changes()
        expect(
            self.page.locator("div")
            .filter(has_text=re.compile(r"^Session datesNot provided$"))
            .get_by_role("definition"),
        ).not_to_be_visible()

    def create_invalid_session(self) -> None:
        _invalid_date = "20251332"
        self.add_or_change_session_dates()
        self.fill_date_fields(_invalid_date)
        self.click_continue_button()
        expect_alert_text(self.page, "Enter a date")
        self.click_back()

    def create_session_in_previous_academic_year(self) -> None:
        _previous_year_date = get_offset_date_compact_format(offset_days=-365)
        self.add_or_change_session_dates()
        self.fill_date_fields(_previous_year_date)
        self.click_continue_button()
        expect_alert_text(
            self.page, "Enter a date on or after the start of the school year"
        )
        self.click_back()

    def create_session_in_next_academic_year(self) -> None:
        _next_year_date = get_offset_date_compact_format(offset_days=365)
        self.add_or_change_session_dates()
        self.fill_date_fields(_next_year_date)
        self.click_continue_button()
        expect_alert_text(
            self.page, "Enter a date on or before the end of the current school year"
        )
        self.click_back()

    @step("Click Back")
    def click_back(self) -> None:
        self.back_link.click()

    @step("Click on Change patient specific direction")
    def click_change_psd(self) -> None:
        self.change_psd_link.click()

    @step("Click on Add session dates")
    def click_add_session_dates(self) -> None:
        self.add_session_dates_link.click()

    @step("Click on Change programmes")
    def click_change_programmes(self) -> None:
        self.change_programmes_link.click()

    def add_programme(self, programme: Programme) -> None:
        self.page.get_by_role("checkbox", name=programme).check()

    def expect_session_to_have_programmes(self, programmes: list[Programme]) -> None:
        for programme in programmes:
            expect(self.page.get_by_role("heading", name=programme)).to_be_visible()

    @step("Click on Change session dates")
    def click_change_session_dates(self) -> None:
        self.change_session_dates_link.click()

    @step("Click Save changes")
    def click_save_changes(self) -> None:
        self.save_changes_link.click()

    @step("Fill date fields with {1}")
    def fill_date_fields(self, date: str, *, edit_existing_date: bool = False) -> None:
        day, month, year = get_day_month_year_from_compact_date(date)

        if (
            not self.day_textbox.first.is_visible()
            or self.day_textbox.first.input_value() != ""
        ):
            self.click_add_another_date()

        if edit_existing_date:
            self.day_textbox.first.fill(str(day))
            self.month_textbox.first.fill(str(month))
            self.year_textbox.first.fill(str(year))
        else:
            self.day_textbox.last.fill(str(day))
            self.month_textbox.last.fill(str(month))
            self.year_textbox.last.fill(str(year))

    def session_date_already_scheduled(self, date: str) -> bool:
        day, month, year = get_day_month_year_from_compact_date(date)

        for i in range(len(self.day_textbox.all())):
            if (
                self.day_textbox.nth(i).input_value() == str(day)
                and self.month_textbox.nth(i).input_value() == str(month)
                and self.year_textbox.nth(i).input_value() == str(year)
            ):
                return True

        return False

    @step("Add another date")
    def click_add_another_date(self) -> None:
        self.add_another_date_button.click()

    def _get_day_month_year_with_day_of_week(self, date_to_format: date) -> str:
        return date_to_format.strftime("%A, %d %B %Y").replace(" 0", " ")

    def schedule_a_valid_session(
        self,
        offset_days: int = 7,
        *,
        skip_weekends: bool = True,
    ) -> None:
        _future_date = get_offset_date(
            offset_days=offset_days, skip_weekends=skip_weekends
        )
        self.__schedule_session(date=_future_date)
        self.page.wait_for_load_state()

        if self.keep_session_dates_button.is_visible():
            self.click_keep_session_dates()  # MAV-2066

        expect_details(
            self.page,
            "Session dates",
            self._get_day_month_year_with_day_of_week(date_to_format=_future_date),
        )
        self.click_save_changes()

    def schedule_a_valid_mmr_session(
        self,
        offset_days: int = 7,
        *,
        skip_weekends: bool = True,
    ) -> None:
        _future_date = get_offset_date(
            offset_days=offset_days, skip_weekends=skip_weekends
        )
        self.click_change_programmes()
        self.add_programme(Programme.MMR)
        self.click_continue_button()
        self.add_or_change_session_dates()
        if not self.session_date_already_scheduled(_future_date.strftime("%Y%m%d")):
            self.fill_date_fields(_future_date.strftime("%Y%m%d"))
        self.click_continue_button()

        if self.keep_session_dates_button.is_visible():
            self.click_keep_session_dates()  # MAV-2066

        expect_details(
            self.page,
            "Session dates",
            self._get_day_month_year_with_day_of_week(date_to_format=_future_date),
        )
        self.click_save_changes()

    @step("Click Keep session dates")
    def click_keep_session_dates(self) -> None:
        self.keep_session_dates_button.click()

    @step("Answer whether PSD should be enabled with {1}")
    def answer_whether_psd_should_be_enabled(self, answer: str) -> None:
        self.page.get_by_role(
            "group",
            name=(
                "Can healthcare assistants administer the flu nasal spray vaccine"
                " using a patient specific direction (PSD)?"
            ),
        ).get_by_label(answer).check()

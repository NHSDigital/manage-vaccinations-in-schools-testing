from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.data_models import School
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import (
    get_day_month_year_from_compact_date,
    get_offset_date_compact_format,
)


class AddSessionWizardPage:
    def __init__(
        self,
        page: Page,
    ) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.day_textbox = self.page.get_by_role("textbox", name="Day")
        self.month_textbox = self.page.get_by_role("textbox", name="Month")
        self.year_textbox = self.page.get_by_role("textbox", name="Year")
        self.add_another_date_button = self.page.get_by_role(
            "button",
            name="Add another date",
        )
        self.school_session_radio = self.page.get_by_role(
            "radio",
            name="School session",
        )
        self.community_clinic_radio = self.page.get_by_role(
            "radio",
            name="Community clinic",
        )
        self.select_a_school_combobox = self.page.get_by_role(
            "combobox",
            name="Start typing to see schools",
        )
        self.keep_session_dates_button = self.page.get_by_role(
            "button", name="Keep session dates"
        )
        self.session_type_heading = self.page.get_by_role(
            "heading", name="What type of session is this?"
        )

    @step("Select School session")
    def select_school_session(self) -> None:
        expect(self.session_type_heading).to_be_visible()

        self.school_session_radio.check()
        self.page.wait_for_load_state()

        self.click_continue()

    @step("Select Community clinic")
    def select_community_clinic(self) -> None:
        expect(self.session_type_heading).to_be_visible()

        self.community_clinic_radio.check()
        self.page.wait_for_load_state()

        self.click_continue()

    def select_school(self, school: School) -> None:
        self.fill_school_name(school)
        self.click_continue()

    @step("Fill school name")
    def fill_school_name(self, school: School) -> None:
        self.page.wait_for_load_state()
        self.page.reload()  # to allow combobox to be interactable

        school_name = str(school)
        self.select_a_school_combobox.fill(school_name)

        options = self.page.locator('[class*="app-autocomplete__option"]')
        count = options.count()

        for i in range(count):
            option = options.nth(i)
            text = option.inner_text().strip()
            first_line = text.split("\n", 1)[0].strip()
            if first_line == school_name:
                option.click()
                break
        else:
            msg = f"No autocomplete option found for school: {school_name}"
            raise AssertionError(msg)

    @step("Click Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Select year groups {1}")
    def select_year_groups(self, year_groups: list[int]) -> None:
        for year_group in year_groups:
            self.page.locator(f'input[type="checkbox"][value="{year_group}"]').check()

        self.click_continue()

    @step("Choose programmes {1}")
    def choose_programmes(self, programmes: list[Programme]) -> None:
        for programme in programmes:
            self.page.get_by_role("checkbox", name=programme).check()
        self.click_continue()

    @step("Click on Add another date")
    def click_add_another_date(self) -> None:
        self.add_another_date_button.click()

    @step("Fill date fields with {1}")
    def fill_date_fields(self, date: str) -> None:
        day, month, year = get_day_month_year_from_compact_date(date)

        self.day_textbox.last.fill(str(day))
        self.month_textbox.last.fill(str(month))
        self.year_textbox.last.fill(str(year))

    @step("Click Keep session dates")
    def click_keep_session_dates(self) -> None:
        self.keep_session_dates_button.click()

    def schedule_school_session(
        self,
        school: School | None,
        programmes: list[Programme],
        year_groups: list[int],
        date_offset: int | None,
    ) -> None:
        if school is not None:
            self.select_school_session()
            self.select_school(school)

        self.choose_programmes(programmes)
        self.select_year_groups(year_groups)

        if date_offset is not None:
            self.fill_date_fields(get_offset_date_compact_format(date_offset))
        self.click_continue()

        self.keep_session_dates_if_necessary()

        self.click_continue()

    def schedule_clinic_session(
        self,
        programmes: list[Programme],
        date_offset: int,
    ) -> None:
        self.select_community_clinic()
        self.choose_programmes(programmes)

        self.fill_date_fields(get_offset_date_compact_format(date_offset))
        self.click_continue()

        self.click_continue()

    @step("Keep session dates if necessary")
    def keep_session_dates_if_necessary(self) -> None:
        self.page.wait_for_load_state()
        if self.keep_session_dates_button.is_visible():
            self.click_keep_session_dates()

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.data_models import School
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.team.team_links_component import TeamLinksComponent


class TeamSchoolsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.links = TeamLinksComponent(page)
        self.add_new_school_site_link = self.page.get_by_role(
            "link",
            name="Add a new school site",
        )
        self.select_a_school_combobox = self.page.get_by_role(
            "combobox",
            name="Select a school",
        )
        self.name_textbox = self.page.get_by_role("textbox", name="Name")
        self.address_line_1_textbox = self.page.get_by_role(
            "textbox", name="Address line 1"
        )
        self.address_line_2_textbox = self.page.get_by_role(
            "textbox", name="Address line 2"
        )
        self.address_town_textbox = self.page.get_by_role(
            "textbox", name="Town or city"
        )
        self.address_postcode_textbox = self.page.get_by_role(
            "textbox", name="Postcode"
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.confirm_site_button = self.page.get_by_role("button", name="Add site")
        self.name_error_summary = self.page.locator("#draft-school-site-name-error")
        self.confirm_school_name = self.page.locator("#confirm-school-site-name")

    @step("Check only schools associated with the team are visible")
    def check_only_expected_schools_visible(
        self, schools: dict[str, list[School]]
    ) -> None:
        expected_school_names = {
            school.name for school_list in schools.values() for school in school_list
        }

        tbody = self.page.locator("tbody.nhsuk-table__body").first
        rows = tbody.locator("tr.nhsuk-table__row")

        actual_school_names = {
            row.locator("td.nhsuk-table__cell")
            .first.inner_text()
            .split("\n", 1)[0]
            .strip()
            for row in rows.all()
        }

        assert actual_school_names == expected_school_names

    @step("Click on Add a new school site")
    def click_add_new_school_site(self) -> None:
        self.add_new_school_site_link.click()

    @step("Check only schools associated with the team are visible in the dropdown")
    def check_only_expected_schools_visible_in_dropdown(
        self, schools: dict[str, list[School]]
    ) -> None:
        expected_school_names = {
            school.name for school_list in schools.values() for school in school_list
        }

        self.page.wait_for_load_state()
        hidden_select = self.page.locator("#draft-school-site-urn-field-select")
        options = hidden_select.locator("option[value]").all()

        actual_school_names = {
            option.inner_text().strip().rsplit(" (URN:", 1)[0]
            for option in options
            if option.get_attribute("value")
        }

        assert actual_school_names == expected_school_names

    @step("Select a school")
    def select_school(self, school: School) -> None:
        self.page.wait_for_load_state()
        self.page.reload()  # to allow combobox to be interactable

        self.select_a_school_combobox.fill(str(school))
        self.page.get_by_role("option", name=str(school)).click()

        self.click_continue()

    @step("Check site details form")
    def check_site_details_form(self, school: School) -> None:
        self._check_address_is_pre_filled(school)
        self._check_name_is_blank()
        self._check_validation_error_if_same_name_used(school)
        self._check_validation_error_if_empty_string_used()

    @step("Add new site details")
    def add_new_site_details(self) -> None:
        self.address_line_1_textbox.fill("New Address Line 1")
        self.address_line_2_textbox.fill("New Address Line 2")
        self.address_town_textbox.fill("New Town")
        self.address_postcode_textbox.fill("SW1A 1AA")
        self.click_continue()

    @step("Fill site name {1}")
    def fill_site_name(self, site_name: str) -> None:
        self.name_textbox.fill(site_name)

    @step("Check confirm screen shows correct details")
    def check_confirm_screen_shows_right_details(
        self, site_urn: str, site_name: str, site_address_line_1: str
    ) -> None:
        expect(self.page.get_by_text(site_urn)).to_be_visible()
        expect(self.page.get_by_text(site_name)).to_be_visible()
        expect(self.page.get_by_text(site_address_line_1)).to_be_visible()

    @step("Confirm site")
    def confirm_site(self) -> None:
        self.confirm_site_button.click()

    @step("Check new site success flash and site is listed in the table")
    def check_new_site_is_listed(
        self, new_site_name: str, new_site_urn: str, old_school_urn: str
    ) -> None:
        flash = self.page.locator(".nhsuk-notification-banner")
        expect(flash).to_contain_text(f"{new_site_name} has been added to your team")

        table = self.page.locator("table.nhsuk-table")
        expect(table).to_contain_text(new_site_name)
        expect(table).to_contain_text(new_site_urn)
        expect(table).to_contain_text(old_school_urn)

    @step("Click continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Check address is pre-filled")
    def _check_address_is_pre_filled(self, school: School) -> None:
        expect(self.address_line_1_textbox).to_have_value(school.address_line_1)
        expect(self.address_line_2_textbox).to_have_value(school.address_line_2 or "")
        expect(self.address_town_textbox).to_have_value(school.address_town)
        expect(self.address_postcode_textbox).to_have_value(school.address_postcode)

    @step("Check name is blank")
    def _check_name_is_blank(self) -> None:
        expect(self.name_textbox).to_have_value("")

    @step("Check validation error if same name used")
    def _check_validation_error_if_same_name_used(self, school: School) -> None:
        self.name_textbox.fill(str(school))
        self.click_continue()

        expect(self.name_error_summary).to_be_visible()
        expect(self.name_error_summary).to_contain_text(
            "This site name is already in use. Enter a different name."
        )

    @step("Check validation error if empty string used")
    def _check_validation_error_if_empty_string_used(self) -> None:
        self.name_textbox.fill("")
        self.click_continue()

        expect(self.name_error_summary).to_be_visible()
        expect(self.name_error_summary).to_contain_text("can't be blank")

        self.name_textbox.fill(" ")
        self.click_continue()

        expect(self.name_error_summary).to_be_visible()
        expect(self.name_error_summary).to_contain_text("can't be blank")

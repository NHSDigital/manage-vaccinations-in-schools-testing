from datetime import date
from io import StringIO

import pandas as pd
from pandas import DataFrame, Series
from playwright.sync_api import Locator, Page

from mavis.test.annotations import step
from mavis.test.models import SCHOOL_MOVE_HEADERS, Child, School


def get_child_full_name(first_name: str, last_name: str) -> str:
    return f"{last_name.upper()}, {first_name}"


class SchoolMovesPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.rows = page.get_by_role("row")
        self.download_button = page.get_by_role("button", name="Download records")
        self.confirmed_alert = page.get_by_role("alert", name="Success").filter(
            has_text="updated",
        )
        self.ignored_alert = page.get_by_role("region", name="Information").filter(
            has_text="ignored",
        )

    @step("Click on school move for {1} {2}")
    def click_child(self, first_name: str, last_name: str) -> None:
        row = self.get_row_for_child(first_name, last_name)
        row.get_by_role("link", name="Review").click()

    @step("Click on Download records")
    def click_download(self) -> None:
        self.download_button.click()

    def get_row_for_child(self, first_name: str, last_name: str) -> Locator:
        full_name = get_child_full_name(first_name, last_name)
        return self.rows.filter(has=self.page.get_by_text(full_name))


class DownloadSchoolMovesPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        from_group = page.get_by_role("group", name="From")
        self.from_day = from_group.get_by_role("textbox", name="Day")
        self.from_month = from_group.get_by_role("textbox", name="Month")
        self.from_year = from_group.get_by_role("textbox", name="Year")

        to_group = page.get_by_role("group", name="To")
        self.to_day = to_group.get_by_role("textbox", name="Day")
        self.to_month = to_group.get_by_role("textbox", name="Month")
        self.to_year = to_group.get_by_role("textbox", name="Year")

        self.continue_button = page.get_by_role("button", name="Continue")
        self.confirm_button = page.get_by_role("button", name="Download CSV")

    def enter_date_range(
        self,
        from_date: date | None = None,
        to_date: date | None = None,
    ) -> None:
        if from_date:
            self.from_day.fill(str(from_date.day))
            self.from_month.fill(str(from_date.month))
            self.from_year.fill(str(from_date.year))

        if to_date:
            self.to_day.fill(str(to_date.day))
            self.to_month.fill(str(to_date.month))
            self.to_year.fill(str(to_date.year))

        self.continue_button.click()

    def confirm_and_get_school_moves_csv(self) -> DataFrame:
        browser = getattr(self.page.context, "browser", None)
        browser_type_name = getattr(
            getattr(browser, "browser_type", None),
            "name",
            None,
        )

        # Playwright's webkit browser always opens CSVs in the browser
        # unlike Chromium and Firefox
        if browser_type_name == "webkit":
            self.confirm_button.click()
            csv_content = self.page.locator("pre").inner_text()
            self.page.go_back()
            return pd.read_csv(StringIO(csv_content))

        with self.page.expect_download() as download_info:
            self.confirm_button.click()
        return pd.read_csv(download_info.value.path())

    def verify_school_moves_csv_contents(
        self, school_moves_csv: DataFrame, children: list[Child], school: School
    ) -> None:
        actual_headers = set(school_moves_csv.columns)
        expected_headers = SCHOOL_MOVE_HEADERS

        if actual_headers != expected_headers:
            msg = f"Expected CSV headers: {expected_headers}, Actual: {actual_headers}"
            raise AssertionError(msg)

        for child in children:
            row = school_moves_csv.loc[
                school_moves_csv["NHS_REF"].astype(str) == str(child.nhs_number)
            ]
            if row.empty:
                msg = f"No row found for child NHS number: {child.nhs_number}"
                raise AssertionError(msg)

            row_data = row.iloc[0]

            self._verify_row_for_child(row_data, child, school)

    def _verify_row_for_child(
        self, row_data: Series, child: Child, school: School
    ) -> None:
        fields_to_check = [
            ("FORENAME", child.first_name),
            ("SURNAME", child.last_name),
            ("DOB", child.date_of_birth.strftime("%Y-%m-%d")),
            ("ADDRESS1", child.address[0]),
            ("ADDRESS2", child.address[1]),
            ("TOWN", child.address[2]),
            ("POSTCODE", child.address[3]),
            ("NATIONAL_URN_NO", school.urn),
            ("BASE_NAME", school.name),
        ]

        for col, expected in fields_to_check:
            actual = str(row_data[col])
            assert actual == expected, f"{col}: expected '{expected}', got '{actual}'"


class ReviewSchoolMovePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.confirm_radio = page.get_by_role(
            "radio",
            name="Update record with new school",
        )
        self.ignore_radio = page.get_by_role("radio", name="Ignore new information")
        self.update_button = page.get_by_role("button", name="Update")

    @step("Confirm school move")
    def confirm(self) -> None:
        self.confirm_radio.check()
        self.update_button.click()

    @step("Ignore school move")
    def ignore(self) -> None:
        self.ignore_radio.check()
        self.update_button.click()

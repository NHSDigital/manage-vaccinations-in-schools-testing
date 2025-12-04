from datetime import date
from io import StringIO

import pandas as pd
from pandas import DataFrame, Series
from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.data_models import Child, School
from mavis.test.mavis_constants import SCHOOL_MOVE_HEADERS
from mavis.test.pages.header_component import HeaderComponent


class DownloadSchoolMovesPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        from_group = page.get_by_role("group", name="From")
        self.from_day = from_group.get_by_role("textbox", name="Day")
        self.from_month = from_group.get_by_role("textbox", name="Month")
        self.from_year = from_group.get_by_role("textbox", name="Year")

        to_group = page.get_by_role("group", name="To")
        self.to_day = to_group.get_by_role("textbox", name="Day")
        self.to_month = to_group.get_by_role("textbox", name="Month")
        self.to_year = to_group.get_by_role("textbox", name="Year")

        self.continue_button = page.get_by_role("button", name="Continue")
        self.download_csv_button = page.get_by_role("button", name="Download CSV")

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

        self.click_continue()

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
            self.click_download_csv()
            csv_content = self.page.locator("pre").inner_text()
            self.page.go_back()
            return pd.read_csv(StringIO(csv_content), dtype={"NHS_REF": str})

        with self.page.expect_download() as download_info:
            self.click_download_csv()
        return pd.read_csv(download_info.value.path(), dtype={"NHS_REF": str})

    def verify_school_moves_csv_contents(
        self, school_moves_csv: DataFrame, children: list[Child], school: School
    ) -> None:
        actual_headers = set(school_moves_csv.columns)
        expected_headers = SCHOOL_MOVE_HEADERS

        if actual_headers != expected_headers:
            msg = f"Expected CSV headers: {expected_headers}, Actual: {actual_headers}"
            raise AssertionError(msg)

        for child in children:
            row = school_moves_csv.loc[school_moves_csv["NHS_REF"] == child.nhs_number]
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

    @step("Click Download CSV")
    def click_download_csv(self) -> None:
        self.download_csv_button.click()

    @step("Click Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

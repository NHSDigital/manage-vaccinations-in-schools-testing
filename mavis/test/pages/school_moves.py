from datetime import date
from typing import Optional
import pandas as pd
from pandas import DataFrame
from io import StringIO

from mavis.test.annotations import step


def get_child_full_name(first_name: str, last_name: str) -> str:
    return f"{last_name.upper()}, {first_name}"


class SchoolMovesPage:
    def __init__(self, page):
        self.page = page
        self.rows = page.get_by_role("row")
        self.download_button = page.get_by_role("button", name="Download records")
        self.confirmed_alert = page.get_by_role("alert", name="Success").filter(
            has_text="updated"
        )
        self.ignored_alert = page.get_by_role("region", name="Information").filter(
            has_text="ignored"
        )

    @step("Click on school move for {1} {2}")
    def click_child(self, first_name: str, last_name: str):
        row = self.get_row_for_child(first_name, last_name)
        row.get_by_role("link", name="Review").click()

    @step("Click on Download records")
    def click_download(self):
        self.download_button.click()

    def get_row_for_child(self, first_name: str, last_name: str):
        full_name = get_child_full_name(first_name, last_name)
        return self.rows.filter(has=self.page.get_by_text(full_name))


class DownloadSchoolMovesPage:
    def __init__(self, page):
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
        self, from_date: Optional[date] = None, to_date: Optional[date] = None
    ):
        if from_date:
            self.from_day.fill(str(from_date.day))
            self.from_month.fill(str(from_date.month))
            self.from_year.fill(str(from_date.year))

        if to_date:
            self.to_day.fill(str(to_date.day))
            self.to_month.fill(str(to_date.month))
            self.to_year.fill(str(to_date.year))

        self.continue_button.click()

    def confirm(self) -> DataFrame:
        browser = getattr(self.page.context, "browser", None)
        browser_type_name = getattr(
            getattr(browser, "browser_type", None), "name", None
        )

        # Playwrights webkit browser always opens CSVs in the browser, unlike Chromium and Firefox
        if browser_type_name == "webkit":
            self.confirm_button.click()
            csv_content = self.page.locator("pre").inner_text()
            self.page.go_back()
            return pd.read_csv(StringIO(csv_content))
        else:
            with self.page.expect_download() as download_info:
                self.confirm_button.click()
            return pd.read_csv(download_info.value.path())


class ReviewSchoolMovePage:
    def __init__(self, page):
        self.page = page
        self.confirm_radio = page.get_by_role(
            "radio", name="Update record with new school"
        )
        self.ignore_radio = page.get_by_role("radio", name="Ignore new information")
        self.update_button = page.get_by_role("button", name="Update")

    @step("Confirm school move")
    def confirm(self):
        self.confirm_radio.check()
        self.update_button.click()

    @step("Ignore school move")
    def ignore(self):
        self.ignore_radio.check()
        self.update_button.click()

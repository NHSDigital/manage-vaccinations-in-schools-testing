from datetime import date

from playwright.sync_api import Page

from mavis.test.annotations import step


class BatchExpiryDate:
    def __init__(self, page: Page) -> None:
        self.expiry_day_textbox = page.get_by_role("textbox", name="Day")
        self.expiry_month_textbox = page.get_by_role("textbox", name="Month")
        self.expiry_year_textbox = page.get_by_role("textbox", name="Year")

    @step("Fill in expiry date with {1}")
    def fill_expiry_date(self, value: date) -> None:
        self.expiry_day_textbox.fill(str(value.day))
        self.expiry_month_textbox.fill(str(value.month))
        self.expiry_year_textbox.fill(str(value.year))

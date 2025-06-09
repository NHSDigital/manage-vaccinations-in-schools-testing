from playwright.sync_api import Page, expect
from ..step import step
from ..mavis_constants import Vaccine
from ..wrappers import get_current_datetime, get_offset_date


class VaccinesPage:
    def __init__(self, page: Page):
        self.page = page

        self.batch_textbox = self.page.get_by_role("textbox", name="Batch")
        self.day_textbox = self.page.get_by_role("textbox", name="Day")
        self.month_textbox = self.page.get_by_role("textbox", name="Month")
        self.year_textbox = self.page.get_by_role("textbox", name="Year")
        self.add_batch_button = self.page.get_by_role("button", name="Add batch")
        self.save_changes_button = self.page.get_by_role("button", name="Save changes")
        self.confirm_archive_button = self.page.get_by_role(
            "button", name="Yes, archive this batch"
        )

    def _calculate_batch_details(self, vaccine: Vaccine):
        self.batch_name = f"{vaccine.replace(' ', '')}{get_current_datetime()}"
        self.future_expiry_date = get_offset_date(offset_days=365)
        self.day = self.future_expiry_date[-2:]
        self.month = self.future_expiry_date[4:6]
        self.year = self.future_expiry_date[:4]

    @step("Add a new batch for {1}")
    def add_batch(self, vaccine: Vaccine):
        self._calculate_batch_details(vaccine)
        expect(self.page.get_by_role("main")).to_contain_text(vaccine)

        self.page.get_by_role("link", name=f"Add a new {vaccine} batch").click()

        expect(self.page.get_by_role("main")).to_contain_text(vaccine)

        self.fill_batch_details()
        self.click_add_batch_button()
        _success_message = f"Batch {self.batch_name} added"
        expect(self.page.get_by_role("main")).to_contain_text(_success_message)

    @step("Fill the batch details")
    def fill_batch_details(self):
        self.batch_textbox.fill(value=self.batch_name)
        self.day_textbox.fill(value=self.day)
        self.month_textbox.fill(value=self.month)
        self.year_textbox.fill(value=self.year)

    @step("Click on Add batch")
    def click_add_batch_button(self):
        self.add_batch_button.click()

    @step("Click on Save changes")
    def click_save_changes(self):
        self.save_changes_button.click()

    @step("Click on Archive this batch")
    def click_archive_this_batch(self):
        self.confirm_archive_button.click()

    @step("Change the batch for {1}")
    def change_batch(self, vaccine: Vaccine):
        batch_name = self.batch_name or str(vaccine)
        self.__click_batch_option(batch_name, "Change")
        self.year_textbox.fill(value=get_offset_date(offset_days=730)[:4])
        self.click_save_changes()
        _success_message = f"Batch {self.batch_name} updated"
        expect(self.page.get_by_role("alert")).to_contain_text(_success_message)

    @step("Archive the batch for {1}")
    def archive_batch(self, vaccine: Vaccine):
        batch_name = self.batch_name or str(vaccine)
        self.__click_batch_option(batch_name, "Archive")
        self.click_archive_this_batch()
        expect(self.page.get_by_role("alert")).to_contain_text("Batch archived.")

    def __click_batch_option(self, batch_name: str, link_text: str):
        row = self.page.locator("tr").filter(
            has=self.page.locator("td:first-child", has_text=batch_name)
        )
        row.locator("td:last-child").get_by_role("link", name=link_text).click()

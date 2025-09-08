from datetime import date

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import Vaccine


class BatchExpiryDateMixin:
    def __init__(self, page: Page):
        self.expiry_day_textbox = page.get_by_role("textbox", name="Day")
        self.expiry_month_textbox = page.get_by_role("textbox", name="Month")
        self.expiry_year_textbox = page.get_by_role("textbox", name="Year")

    @step("Fill in expiry date with {1}")
    def fill_expiry_date(self, value: date):
        self.expiry_day_textbox.fill(str(value.day))
        self.expiry_month_textbox.fill(str(value.month))
        self.expiry_year_textbox.fill(str(value.year))


class AddBatchPage(BatchExpiryDateMixin):
    def __init__(self, page: Page):
        super().__init__(page)

        self.page = page

        self.name_textbox = page.get_by_role("textbox", name="Batch")
        self.confirm_button = page.get_by_role("button", name="Add batch")
        self.success_alert = page.get_by_role("alert", name="Success").filter(
            has_text="added"
        )

        error_alert = page.get_by_role("alert").filter(has_text="There is a problem")
        self.error_listitem = error_alert.get_by_role("listitem")

    @step("Fill in name with {1}")
    def fill_name(self, value: str):
        self.name_textbox.fill(value)

    @step("Confirm add batch")
    def confirm(self):
        self.confirm_button.click()


class EditBatchPage(BatchExpiryDateMixin):
    def __init__(self, page: Page):
        super().__init__(page)

        self.page = page

        self.confirm_button = page.get_by_role("button", name="Save changes")
        self.success_alert = page.get_by_role("alert", name="Success").filter(
            has_text="updated"
        )

    @step("Confirm edit batch")
    def confirm(self):
        self.confirm_button.click()


class ArchiveBatchPage:
    def __init__(self, page: Page):
        self.page = page
        self.confirm_button = page.get_by_role("button", name="Yes, archive this batch")
        self.success_alert = page.get_by_role("alert", name="Success").filter(
            has_text="archived"
        )

    @step("Click on Archive this batch")
    def confirm(self):
        self.confirm_button.click()


class VaccinesPage:
    def __init__(self, page: Page):
        self.page = page

    @step("Go to vaccines page")
    def navigate(self):
        self.page.goto("/vaccines")

    @step("Add batch for {1}")
    def click_add_batch(self, vaccine: Vaccine):
        self.page.get_by_role("link", name=f"Add a new {vaccine} batch").click()

    @step("Change {2} batch for {1}")
    def click_change_batch(self, vaccine: Vaccine, batch_name: str):
        name = f"Change {batch_name} batch of {vaccine}"
        self.page.get_by_role("link", name=name).click()

    @step("Archive {2} batch for {1}")
    def click_archive_batch(self, vaccine: Vaccine, batch_name: str):
        name = f"Archive {batch_name} batch of {vaccine}"
        self.page.get_by_role("link", name=name).click(force=True)

    def verify_flu_not_available(self, programmes: list[str]):
        if "flu" not in programmes:
            expect(
                self.page.get_by_role(
                    "link", name="Adjuvanted Quadrivalent - aQIV (Flu)"
                )
            ).not_to_be_visible()
            expect(
                self.page.get_by_role(
                    "link", name="Cell-based Quadrivalent - QIVc (Flu)"
                )
            ).not_to_be_visible()
            expect(
                self.page.get_by_role("link", name="Fluenz Tetra - LAIV (Flu)")
            ).not_to_be_visible()
            expect(
                self.page.get_by_role(
                    "link", name="Quadrivalent Influenza vaccine - QIVe (Flu)"
                )
            ).not_to_be_visible()
            expect(
                self.page.get_by_role(
                    "link", name="Quadrivalent Influvac sub-unit Tetra - QIVe (Flu)"
                )
            ).not_to_be_visible()
            expect(
                self.page.get_by_role("link", name="Supemtek - QIVr (Flu)")
            ).not_to_be_visible()
        else:
            pass

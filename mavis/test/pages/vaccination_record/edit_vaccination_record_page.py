from datetime import datetime

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.mavis_constants import DeliverySite
from mavis.test.pages.header_component import HeaderComponent


class EditVaccinationRecordPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.edit_vaccination_record_button = page.get_by_role(
            "button", name="Edit vaccination record"
        )
        self.change_outcome_link = page.get_by_role("link", name="Change   outcome")
        self.change_site_link = page.get_by_role("link", name="Change   site")
        self.change_time_link = page.get_by_role("link", name="Change   time")
        self.hour_textbox = page.get_by_role("textbox", name="Hour")
        self.minute_textbox = page.get_by_role("textbox", name="Minute")
        self.save_changes_button = page.get_by_role("button", name="Save changes")
        self.they_refused_it_radio_button = page.get_by_role(
            "radio",
            name="They refused it",
        )
        self.continue_button = page.get_by_role("button", name="Continue")

    @step("Click on Edit vaccination record")
    def click_edit_vaccination_record(self) -> None:
        self.edit_vaccination_record_button.click()

    @step("Click on Change site")
    def click_change_site(self) -> None:
        self.change_site_link.click()

    @step("Click on Change time")
    def click_change_time(self) -> None:
        self.change_time_link.click()

    @step("Change time of delivery")
    def change_time_of_delivery(self, new_vaccination_time: datetime) -> None:
        self.hour_textbox.fill(str(new_vaccination_time.hour))
        self.minute_textbox.fill(str(new_vaccination_time.minute))

    @step("Click delivery site {1}")
    def click_delivery_site(self, delivery_site: DeliverySite) -> None:
        self.page.get_by_role("radio", name=str(delivery_site)).click()

    @step("Click on Save changes")
    def click_save_changes(self) -> None:
        self.save_changes_button.click()

    @step("Click on They refused it")
    def click_they_refused_it(self) -> None:
        self.they_refused_it_radio_button.click()

    @step("Click on Change outcome")
    def click_change_outcome(self) -> None:
        self.change_outcome_link.click()

    @step("Click on Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    def expect_text_to_not_be_visible(self, text: str) -> None:
        expect(self.page.get_by_text(text)).not_to_be_visible()

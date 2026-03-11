from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.pages.header_component import HeaderComponent


class SchoolInviteToClinicPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.send_clinic_invitations_button = self.page.get_by_role(
            "button", name="Send clinic invitations"
        )

    @step("Click on Send clinic invitations")
    def click_send_clinic_invitations(self) -> None:
        self.send_clinic_invitations_button.click()

    @step("Check {1} programme")
    def check_programme(self, programme: Programme) -> None:
        checkbox = self.page.get_by_role("checkbox", name=str(programme))
        checkbox.check()

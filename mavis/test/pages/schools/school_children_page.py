from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.schools.school_tabs import SchoolTabs
from mavis.test.pages.search_components import PatientStatusSearchComponent


class SchoolChildrenPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search = PatientStatusSearchComponent(page)
        self.header = HeaderComponent(page)
        self.tabs = SchoolTabs(page)

        self.import_class_lists_link = page.get_by_role(
            "link", name="Import class lists"
        )

        self.send_clinic_invitations_link = page.get_by_role(
            "link", name="Send clinic invitations"
        )

    @step("Click Import class lists")
    def click_import_class_lists(self) -> None:
        self.import_class_lists_link.click()

    @step("Click Send clinic invitations")
    def click_send_clinic_invitations(self) -> None:
        self.send_clinic_invitations_link.click()

from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.schools.schools_tabs import SchoolsTabs
from mavis.test.pages.search_components import PatientStatusSearchComponent


class SchoolsChildrenPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search = PatientStatusSearchComponent(page)
        self.header = HeaderComponent(page)
        self.tabs = SchoolsTabs(page)

        self.import_class_lists_link = page.get_by_role(
            "link", name="Import class lists"
        )

    @step("Click Import class lists")
    def click_import_class_lists(self) -> None:
        self.import_class_lists_link.click()

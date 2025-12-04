from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.models import Child
from mavis.test.pages.header import HeaderComponent
from mavis.test.pages.programmes.programme_tabs import ProgrammeTabs


class ProgrammeChildrenPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = ProgrammeTabs(page)
        self.header = HeaderComponent(page)

        self.import_child_records_link = page.get_by_text("Import child records")
        self.search_textbox = page.get_by_role("searchbox", name="Search")
        self.search_button = page.get_by_role("button", name="Search")
        self.continue_button = page.get_by_role("button", name="Continue")
        self.use_duplicate_radio_button = page.get_by_role(
            "radio",
            name="Use duplicate record",
        )
        self.resolve_duplicate_button = page.get_by_role(
            "button",
            name="Resolve duplicate",
        )
        self.import_processing_started_alert = page.get_by_role(
            "alert",
            name="Import processing started",
        )

    @step("Click on Import child records")
    def click_import_child_records(self) -> None:
        self.page.wait_for_load_state()
        self.import_child_records_link.click()

    @step("Click on Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Click on {1}")
    def click_child(self, child: Child) -> None:
        self.page.get_by_role("link", name=str(child)).click()

    @step("Click on {1}")
    def search_for_child(self, child: Child) -> None:
        self.search_textbox.fill(str(child))
        self.search_button.click()

    @step("Click on Use duplicate record")
    def click_use_duplicate(self) -> None:
        self.use_duplicate_radio_button.click()

    @step("Click on Resolve duplicate")
    def click_resolve_duplicate(self) -> None:
        self.resolve_duplicate_button.click()

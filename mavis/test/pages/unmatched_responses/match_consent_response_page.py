from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.data_models import Child
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.search_components import PatientSearchComponent


class MatchConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.search = PatientSearchComponent(page)

        self.link_button = page.get_by_role("button", name="Link response with record")

    @step("Match consent response with {1}")
    def match(self, child: Child) -> None:
        self.search.search_for_child_name_with_all_filters(str(child))
        self.search.click_child(child)
        self.click_link_response_with_record()

    @step("Click Link response with record")
    def click_link_response_with_record(self) -> None:
        self.link_button.click()

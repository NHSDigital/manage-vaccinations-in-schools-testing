from pathlib import Path

from playwright.sync_api import Page

from mavis.test.data import create_child_list_from_file
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.search_components import PatientStatusSearchComponent


class ChildrenSearchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search = PatientStatusSearchComponent(page)
        self.header = HeaderComponent(page)

    def verify_list_has_been_uploaded(
        self,
        file_path: Path,
        *,
        is_vaccinations: bool,
    ) -> None:
        child_names = create_child_list_from_file(
            file_path,
            is_vaccinations=is_vaccinations,
        )
        for child_name in child_names:
            self.search.search_for_child_name_with_all_filters(child_name)

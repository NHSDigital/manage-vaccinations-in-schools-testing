from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.pages.header_component import HeaderComponent


class ProgrammesListPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.current_year_programmes_card = (
            page.get_by_role("heading")
            .filter(has_text="2025 to 2026")
            .locator("xpath=following-sibling::table[1]")
        )

    @step("Click on {1}")
    def click_programme_for_current_year(self, programme: Programme) -> None:
        self.current_year_programmes_card.get_by_role("link", name=programme).click()

    def verify_programme_is_visible(self, programme: Programme) -> None:
        assert self.current_year_programmes_card.get_by_role(
            "link", name=programme
        ).is_visible(), f"{programme} is not visible on the programmes list page"

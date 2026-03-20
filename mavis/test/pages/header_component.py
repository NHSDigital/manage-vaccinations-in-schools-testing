from playwright.sync_api import Page

from mavis.test.annotations import step


class HeaderComponent:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.mavis_link = page.get_by_role(
            "link",
            name="Manage vaccinations in schools",
        )

        links = page.get_by_label("Menu", exact=True)

        self.children_link = links.get_by_role("link", name="Children")
        self.imports_link = links.get_by_role("link", name="Imports")
        self.programmes_link = links.get_by_role("link", name="Programmes")
        self.school_moves_link = links.get_by_role("link", name="School Moves")
        self.schools_link = links.get_by_role("link", name="Schools")
        self.sessions_link = links.get_by_role("link", name="Sessions")
        self.unmatched_responses_link = links.get_by_role(
            "link", name="Unmatched Responses"
        )
        self.vaccines_link = links.get_by_role("link", name="Vaccines")
        self.your_team_link = links.get_by_role("link", name="Your Team")

    def _ensure_menu_visible(self) -> None:
        """Expand mobile menu if needed (e.g., 'More' button on smaller viewports)."""
        # Check if there's a "More" button and the menu is not visible
        more_button = self.page.get_by_role("button", name="More")
        if more_button.count() > 0 and not self.children_link.is_visible():
            more_button.click()

    @step("Click on Manage vaccinations in schools")
    def click_mavis(self) -> None:
        self.mavis_link.click()

    @step("Click on Children")
    def click_children(self) -> None:
        self._ensure_menu_visible()
        self.children_link.click()

    @step("Click on Imports")
    def click_imports(self) -> None:
        self._ensure_menu_visible()
        self.imports_link.click()

    @step("Click on Programmes")
    def click_programmes(self) -> None:
        self._ensure_menu_visible()
        self.programmes_link.click()

    @step("Click on School Moves")
    def click_school_moves(self) -> None:
        self._ensure_menu_visible()
        self.school_moves_link.click()

    @step("Click on Schools")
    def click_schools(self) -> None:
        self._ensure_menu_visible()
        self.schools_link.click()

    @step("Click on Sessions")
    def click_sessions(self) -> None:
        self._ensure_menu_visible()
        self.sessions_link.click()

    @step("Click on Unmatched Responses")
    def click_unmatched_responses(self) -> None:
        self._ensure_menu_visible()
        self.unmatched_responses_link.click()

    @step("Click on Vaccines")
    def click_vaccines(self) -> None:
        self._ensure_menu_visible()
        self.vaccines_link.click()

    @step("Click on Your Team")
    def click_your_team(self) -> None:
        self._ensure_menu_visible()
        self.your_team_link.click()

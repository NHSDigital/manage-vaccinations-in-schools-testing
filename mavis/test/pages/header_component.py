import re

from playwright.sync_api import Page

from mavis.test.annotations import step


class HeaderComponent:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.mavis_link = page.get_by_role(
            "link",
            name="Manage vaccinations in schools",
        )

        # Header navigation links are within the element labeled "Menu"
        # On mobile, some links may be hidden until "More" button is clicked
        menu = page.get_by_label("Menu")

        self.children_link = menu.get_by_role("link", name="Children", exact=True)
        # In header nav, "Imports" might be labeled as "Import Records"
        self.imports_link = menu.get_by_role("link", name="Import")
        self.programmes_link = menu.get_by_role("link", name="Programmes", exact=True)
        self.school_moves_link = menu.get_by_role(
            "link", name="School Moves", exact=True
        )
        self.schools_link = menu.get_by_role("link", name="Schools", exact=True)
        self.sessions_link = menu.get_by_role("link", name="Sessions", exact=True)
        self.unmatched_responses_link = menu.get_by_role(
            "link", name="Unmatched Responses", exact=True
        )
        self.vaccines_link = menu.get_by_role("link", name="Vaccines", exact=True)
        self.your_team_link = menu.get_by_role("link", name="Your Team", exact=True)

    def ensure_menu_visible(self) -> None:
        browse_button = self.page.get_by_role(
            "button", name=re.compile(r"browse\s*more", re.IGNORECASE)
        )
        if (
            browse_button.count() > 0
            and browse_button.get_attribute("aria-expanded") != "true"
        ):
            browse_button.click()

    @step("Click on Manage vaccinations in schools")
    def click_mavis(self) -> None:
        self.mavis_link.click()

    @step("Click on Children")
    def click_children(self) -> None:
        self.ensure_menu_visible()
        self.children_link.click()

    @step("Click on Imports")
    def click_imports(self) -> None:
        self.ensure_menu_visible()
        self.imports_link.click()

    @step("Click on Programmes")
    def click_programmes(self) -> None:
        self.ensure_menu_visible()
        self.programmes_link.click()

    @step("Click on School Moves")
    def click_school_moves(self) -> None:
        self.ensure_menu_visible()
        self.school_moves_link.click()

    @step("Click on Schools")
    def click_schools(self) -> None:
        self.ensure_menu_visible()
        self.schools_link.click()

    @step("Click on Sessions")
    def click_sessions(self) -> None:
        self.ensure_menu_visible()
        self.sessions_link.click()

    @step("Click on Unmatched Responses")
    def click_unmatched_responses(self) -> None:
        self.ensure_menu_visible()
        self.unmatched_responses_link.click()

    @step("Click on Vaccines")
    def click_vaccines(self) -> None:
        self.ensure_menu_visible()
        self.vaccines_link.click()

    @step("Click on Your Team")
    def click_your_team(self) -> None:
        self.ensure_menu_visible()
        self.your_team_link.click()

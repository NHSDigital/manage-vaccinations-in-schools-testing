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
        """Expand mobile menu if needed (e.g., 'Browse More' button)."""
        # Look for "Browse More" button
        # (has newline between words on mobile)
        try:
            # Find button containing both Browse and More
            buttons = self.page.get_by_role("button")
            for i in range(buttons.count()):
                try:
                    btn_text = buttons.nth(i).inner_text(timeout=100)
                    # Check if button contains both Browse and More
                    if "browse" in btn_text.lower() and "more" in btn_text.lower():
                        button = buttons.nth(i)
                        if button.is_visible(timeout=100):
                            # Check if button is expanded already
                            aria_expanded = button.get_attribute("aria-expanded")
                            if aria_expanded != "true":
                                button.click()
                                # Wait for the menu to become visible
                                self.page.wait_for_selector(
                                    '[aria-label="Menu"] [role="link"]',
                                    state="visible",
                                    timeout=2000,
                                )
                            return
                except (TimeoutError, Exception):  # noqa: BLE001, S112
                    # Playwright may raise TimeoutError or generic Error if element is
                    # detached or not interactable
                    continue  # Button check failed, try next
        except (TimeoutError, Exception):  # noqa: BLE001, S110
            pass  # Browse More button not found or menu already expanded

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

from playwright.sync_api import Page, expect

from mavis.test.annotations import step


class StartPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.heading = page.get_by_role(
            "heading",
            name="Manage vaccinations in schools (Mavis)",
        )
        self.start_link = page.get_by_role("link", name="Start now")
        self.accessibility_statement_link = page.get_by_role(
            "link",
            name="Accessibility statement",
        )
        self.service_guidance_link = page.get_by_role(
            "link",
            name="Service guidance (opens in a new tab)",
        )
        self.accessibility_statement_heading = page.get_by_role(
            "heading",
            name="Accessibility statement",
        )

    @step("Go to start page")
    def navigate(self) -> None:
        self.page.goto("/")

    @step("Click on start button")
    def start(self) -> None:
        self.start_link.click()

    @step("Click Accessibility statement")
    def click_accessibility_statement(self) -> None:
        self.accessibility_statement_link.click()

    @step("Click Service guidance (opens in a new tab)")
    def click_service_guidance(self) -> None:
        self.service_guidance_link.click()

    def navigate_and_start(self) -> None:
        self.navigate()
        self.start()

    def check_all_start_page_elements_visible(self) -> None:
        expect(self.heading).to_be_visible()
        expect(self.start_link).to_be_visible()
        expect(self.accessibility_statement_link).to_be_visible()
        expect(self.service_guidance_link).to_be_visible()

    def check_accessibility_statement_shown(self) -> None:
        expect(self.accessibility_statement_heading.first).to_be_visible()

    def check_service_guidance_tab_opens(self) -> None:
        with self.page.expect_popup() as popup_info:
            self.click_service_guidance()
        new_page = popup_info.value

        expect(new_page.get_by_role("heading", name="Service Guidance")).to_be_visible()

from playwright.sync_api import Page

from mavis.test.annotations import step


class TeamLinksComponent:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.team_links_section = page.get_by_role("navigation", name="Secondary menu")
        self.contact_details_link = self.team_links_section.get_by_role(
            "link", name="Contact details"
        )
        self.schools_link = self.team_links_section.get_by_role("link", name="Schools")
        self.clinics_link = self.team_links_section.get_by_role("link", name="Clinics")
        self.sessions_link = self.team_links_section.get_by_role(
            "link", name="Sessions"
        )

    @step("Click on Contact details")
    def click_contact_details(self) -> None:
        self.contact_details_link.click()
        self.contact_details_link.get_by_role("strong").wait_for()

    @step("Click on Schools")
    def click_schools(self) -> None:
        self.schools_link.click()
        self.schools_link.get_by_role("strong").wait_for()

    @step("Click on Clinics")
    def click_clinics(self) -> None:
        self.clinics_link.click()
        self.clinics_link.get_by_role("strong").wait_for()

    @step("Click on Sessions")
    def click_sessions(self) -> None:
        self.sessions_link.click()
        self.sessions_link.get_by_role("strong").wait_for()

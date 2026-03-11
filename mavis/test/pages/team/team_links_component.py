from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.utils import click_secondary_navigation_item


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
        click_secondary_navigation_item(self.contact_details_link)

    @step("Click on Schools")
    def click_schools(self) -> None:
        click_secondary_navigation_item(self.schools_link)

    @step("Click on Clinics")
    def click_clinics(self) -> None:
        click_secondary_navigation_item(self.clinics_link)

    @step("Click on Sessions")
    def click_sessions(self) -> None:
        click_secondary_navigation_item(self.sessions_link)

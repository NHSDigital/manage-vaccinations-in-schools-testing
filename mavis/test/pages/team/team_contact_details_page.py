from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.data_models import Team
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.team.team_links_component import TeamLinksComponent


class TeamContactDetailsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.links = TeamLinksComponent(page)

    @step("Check team name is visible")
    def check_team_name_is_visible(self, team: Team) -> None:
        self.page.get_by_role("heading", name=team.name).is_visible()

    @step("Check team email is visible")
    def check_team_email_is_visible(self, team: Team) -> None:
        self.page.get_by_text(team.email).is_visible()

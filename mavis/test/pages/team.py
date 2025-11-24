from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.models import Team
from mavis.test.pages.header import HeaderComponent


class TeamPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

    @step("Check team name is visible")
    def check_team_name_is_visible(self, team: Team) -> None:
        self.page.get_by_role("heading", name=team.name).is_visible()

    @step("Check team email is visible")
    def check_team_email_is_visible(self, team: Team) -> None:
        self.page.get_by_text(team.email).is_visible()

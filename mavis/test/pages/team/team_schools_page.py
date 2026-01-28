from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.data_models import School
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.team.team_links_component import TeamLinksComponent


class TeamSchoolsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.links = TeamLinksComponent(page)

    @step("Check only schools associated with the team are visible")
    def check_only_expected_schools_visible(
        self, schools: dict[str, list[School]]
    ) -> None:
        expected_school_names = {
            school.name for school_list in schools.values() for school in school_list
        }

        tbody = self.page.locator("tbody.nhsuk-table__body").first
        rows = tbody.locator("tr.nhsuk-table__row")

        actual_school_names = {
            row.locator("td.nhsuk-table__cell")
            .first.inner_text()
            .split("\n", 1)[0]
            .strip()
            for row in rows.all()
        }

        assert actual_school_names == expected_school_names

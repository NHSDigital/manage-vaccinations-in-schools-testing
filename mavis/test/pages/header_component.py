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

        self.programmes_link = links.get_by_role("link", name="Programmes")
        self.sessions_link = links.get_by_role("link", name="Sessions")
        self.children_link = links.get_by_role("link", name="Children")
        self.vaccines_link = links.get_by_role("link", name="Vaccines")
        self.unmatched_consent_responses_link = links.get_by_role(
            "link",
            name="Unmatched Responses",
        )
        self.school_moves_link = links.get_by_role("link", name="School Moves")
        self.import_records_link = links.get_by_role("link", name="Imports")
        self.your_team_link = links.get_by_role("link", name="Your Team")

    @step("Click on Manage vaccinations in schools")
    def click_mavis_header(self) -> None:
        self.mavis_link.click()

    @step("Click on Programmes")
    def click_programmes_header(self) -> None:
        self.programmes_link.click()

    @step("Click on Sessions")
    def click_sessions_header(self) -> None:
        self.sessions_link.click()

    @step("Click on Children")
    def click_children_header(self) -> None:
        self.children_link.click()

    @step("Click on Vaccines")
    def click_vaccines_header(self) -> None:
        self.vaccines_link.click()

    @step("Click on Consent Responses")
    def click_consent_responses_header(self) -> None:
        self.unmatched_consent_responses_link.click()

    @step("Click on School Moves")
    def click_school_moves_header(self) -> None:
        self.school_moves_link.click()

    @step("Click on Imports")
    def click_imports_header(self) -> None:
        self.import_records_link.click()

    @step("Click on Your Team")
    def click_your_team_header(self) -> None:
        self.your_team_link.click()

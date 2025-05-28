from playwright.sync_api import Page

from ..step import step


class DashboardPage:
    def __init__(self, page: Page):
        self.page = page

        self.mavis_link = page.get_by_role(
            "link", name="Manage vaccinations in schools"
        )

        links = page.get_by_role("main").get_by_role("listitem").get_by_role("link")

        self.programmes_link = links.get_by_text("Programmes")
        self.sessions_link = links.get_by_text("Sessions")
        self.children_link = links.get_by_text("Children")
        self.vaccines_link = links.get_by_text("Vaccines")
        self.unmatched_consent_responses_link = links.get_by_text(
            "Unmatched Consent Responses"
        )
        self.school_moves_link = links.get_by_text("School Moves")
        self.import_records_link = links.get_by_text("Import Records")
        self.your_organisation_link = links.get_by_text("Your Organisation")
        self.service_guidance_link = links.get_by_text("Service Guidance")

    @step("Click on Manage vaccinations in schools")
    def click_mavis(self):
        self.mavis_link.click()

    @step("Click on Programmes")
    def click_programmes(self):
        self.programmes_link.click()

    @step("Click on Sessions")
    def click_sessions(self):
        self.sessions_link.click()

    @step("Click on Children")
    def click_children(self):
        self.children_link.click()

    @step("Click on Vaccines")
    def click_vaccines(self):
        self.vaccines_link.click()

    @step("Click on Unmatched Consent Responses")
    def click_unmatched_consent_responses(self):
        self.unmatched_consent_responses_link.click()

    @step("Click on School Moves")
    def click_school_moves(self):
        self.school_moves_link.click()

    @step("Click on Import Records")
    def click_import_records(self):
        self.import_records_link.click()

    @step("Click on Your Organisation")
    def click_your_organisation(self):
        self.your_organisation_link.click()

    @step("Click on Service Guidance")
    def click_service_guidance(self):
        self.service_guidance_link.click()

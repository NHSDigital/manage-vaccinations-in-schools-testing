from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class DashboardPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        links = page.get_by_role("main").get_by_role("listitem").get_by_role("link")

        self.reports_link = links.get_by_text("Reports")
        self.sessions_link = links.get_by_text("Sessions")
        self.children_link = links.get_by_text("Children")
        self.vaccines_link = links.get_by_text("Vaccines")
        self.unmatched_consent_responses_link = links.get_by_text(
            "Unmatched Consent Responses",
        )
        self.school_moves_link = links.get_by_text("School Moves")
        self.imports_link = links.get_by_text("Imports")
        self.your_team_link = links.get_by_text("Your Team")
        self.service_guidance_link = links.get_by_text("Service Guidance")
        self.schools_link = links.get_by_text("Schools")
        self.important_notices_header = page.get_by_text("Important: Important notices")
        self.important_notices_link = page.get_by_text(
            "important notices need attention", exact=False
        )

    @step("Click important notices link")
    def click_important_notices(self) -> None:
        self.important_notices_link.click()

    @step("Verify important notices are displayed")
    def verify_important_notices_displayed(self) -> None:
        expect(self.important_notices_header).to_be_visible()

    @step("Click on Schools")
    def click_schools(self) -> None:
        self.schools_link.click()

    @step("Click on Reports")
    def click_reports(self) -> None:
        self.reports_link.click()

    @step("Click on Sessions")
    def click_sessions(self) -> None:
        self.sessions_link.click()

    @step("Click on Children")
    def click_children(self) -> None:
        self.children_link.click()

    @step("Click on Vaccines")
    def click_vaccines(self) -> None:
        self.vaccines_link.click()

    @step("Click on Unmatched Consent Responses")
    def click_unmatched_consent_responses(self) -> None:
        self.unmatched_consent_responses_link.click()

    @step("Click on School Moves")
    def click_school_moves(self) -> None:
        self.school_moves_link.click()

    @step("Click on Imports")
    def click_imports(self) -> None:
        self.imports_link.click()

    @step("Click on Your Team")
    def click_your_team(self) -> None:
        self.your_team_link.click()

    @step("Go to dashboard")
    def navigate(self) -> None:
        self.page.goto("/dashboard")

    @step("Verify MAVIS link is visible")
    def verify_mavis_link_visible(self) -> None:
        expect(self.header.mavis_link).to_be_visible()

    @step("Verify Children link is visible")
    def verify_children_link_visible(self) -> None:
        expect(self.children_link).to_be_visible()

    @step("Verify Imports link is visible")
    def verify_imports_link_visible(self) -> None:
        expect(self.imports_link).to_be_visible()

    @step("Verify header Children link is visible")
    def verify_header_children_link_visible(self) -> None:
        expect(self.header.children_link).to_be_visible()

    @step("Verify header Import Records link is visible")
    def verify_header_imports_link_visible(self) -> None:
        expect(self.header.imports_link).to_be_visible()

    @step("Verify Service Guidance link for National Reporting")
    def verify_service_guidance_link_national_reporting(self) -> None:
        expect(self.service_guidance_link).to_have_attribute(
            "href",
            "https://guide.manage-vaccinations-in-schools.nhs.uk/national-reporting/",
        )

    @step("Verify Service Guidance link for Point of Care")
    def verify_service_guidance_link_point_of_care(self) -> None:
        expect(self.service_guidance_link).to_have_attribute(
            "href", "https://guide.manage-vaccinations-in-schools.nhs.uk"
        )

    @step("Verify Important Notices header is visible")
    def verify_important_notices_header_visible(self) -> None:
        expect(self.important_notices_header).to_be_visible()

    @step("Verify Important Notices link")
    def verify_important_notices_link(self) -> None:
        expect(self.important_notices_link).to_have_attribute(
            "href", "/imports/notices"
        )

    @step("Verify Important Notices header is not visible")
    def verify_important_notices_header_not_visible(self) -> None:
        expect(self.important_notices_header).not_to_be_visible()

    @step("Verify Important Notices link is not visible")
    def verify_important_notices_link_not_visible(self) -> None:
        expect(self.important_notices_link).not_to_be_visible()

    @step("Verify Reports link is visible")
    def verify_reports_link_visible(self) -> None:
        expect(self.reports_link).to_be_visible()

    @step("Verify Sessions link is visible")
    def verify_sessions_link_visible(self) -> None:
        expect(self.sessions_link).to_be_visible()

    @step("Verify Vaccines link is visible")
    def verify_vaccines_link_visible(self) -> None:
        expect(self.vaccines_link).to_be_visible()

    @step("Verify Unmatched Consent Responses link is visible")
    def verify_unmatched_consent_responses_link_visible(self) -> None:
        expect(self.unmatched_consent_responses_link).to_be_visible()

    @step("Verify School Moves link is visible")
    def verify_school_moves_link_visible(self) -> None:
        expect(self.school_moves_link).to_be_visible()

    @step("Verify Your Team link is visible")
    def verify_your_team_link_visible(self) -> None:
        expect(self.your_team_link).to_be_visible()

    @step("Verify Service Guidance link is visible")
    def verify_service_guidance_link_visible(self) -> None:
        expect(self.service_guidance_link).to_be_visible()

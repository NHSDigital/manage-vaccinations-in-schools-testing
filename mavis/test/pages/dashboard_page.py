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

        # Important notices elements
        self.important_notices_header = page.get_by_text("Important: Important notices")
        self.important_notices_banner = page.locator(".nhsuk-notification-banner")
        self.dismiss_notice_button = page.get_by_role("button", name="Dismiss")
        self.confirm_dismiss_button = page.get_by_role(
            "button", name="Confirm dismissal"
        )
        self.cancel_dismiss_button = page.get_by_role("button", name="Cancel")
        self.important_notices_link = page.get_by_text(
            "important notices need attention", exact=False
        )

    @step("Click important notices link")
    def click_important_notices(self) -> None:
        self.important_notices_link.click()

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

    @step("Verify important notices are displayed")
    def verify_important_notices_displayed(self) -> None:
        expect(self.important_notices_header).to_be_visible()

    @step("Get important notices count")
    def get_important_notices_count(self) -> int:
        return self.important_notices_banner.count()

    @step("Verify important notice contains text: {1}")
    def verify_important_notice_contains_text(self, text: str) -> None:
        expect(
            self.important_notices_banner.filter(has_text=text).first
        ).to_be_visible()

    @step("Click dismiss notice button")
    def click_dismiss_notice(self) -> None:
        self.dismiss_notice_button.first.click()

    @step("Confirm dismissal of notice")
    def confirm_dismiss_notice(self) -> None:
        self.confirm_dismiss_button.click()

    @step("Cancel dismissal of notice")
    def cancel_dismiss_notice(self) -> None:
        self.cancel_dismiss_button.click()

    @step("Verify important notices are not displayed")
    def verify_important_notices_not_displayed(self) -> None:
        expect(self.important_notices_banner).not_to_be_visible()

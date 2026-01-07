from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.schools.schools_tabs import SchoolsTabs


class SchoolsSessionsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.tabs = SchoolsTabs(page)
        self.add_a_new_session_link = page.get_by_role("link", name="Add a new session")
        self.scheduled_sessions_heading = page.get_by_role(
            "heading", name="Scheduled sessions"
        )
        self.unscheduled_sessions_heading = page.get_by_role(
            "heading", name="Unscheduled sessions"
        )

    @step("Click Add a new session")
    def click_add_a_new_session(self) -> None:
        self.add_a_new_session_link.click()

    @step("Verify session exists")
    def verify_session_exists_for_category(
        self,
        programmes: list[str],
        year_groups: list[int],
        *,
        scheduled: bool = True,
    ) -> None:
        heading_locator = (
            self.scheduled_sessions_heading
            if scheduled
            else self.unscheduled_sessions_heading
        )
        sessions_locator = heading_locator.locator("xpath=following-sibling::*[1]")
        session_card_locators = sessions_locator.locator(".nhsuk-card__content")
        for session_card_locator in session_card_locators.all():
            session_card_text = session_card_locator.inner_text()
            if all(str(programme) in session_card_text for programme in programmes) and all(
                "Reception" if year_group == 0 else str(year_group) in session_card_text
                for year_group in year_groups
            ):
                return
        msg = "Session with specified programmes and year groups not found."
        raise AssertionError(msg)

from playwright.sync_api import Page

from mavis.test.annotations import step


class ConsentRefusalFollowUpPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.page_heading = self.page.get_by_role("heading", name="Follow up refusal")
        self.decision_stands_yes_radio = self.page.get_by_role(
            "radio", name="Yes", exact=True
        ).first
        self.decision_stands_no_radio = self.page.get_by_role(
            "radio", name="No", exact=True
        ).first
        self.continue_button = self.page.get_by_role("button", name="Continue")

    @step("Select that original decision stands")
    def select_decision_stands(self, *, stands: bool = True) -> None:
        if stands:
            self.decision_stands_yes_radio.check()
        else:
            self.decision_stands_no_radio.check()

    @step("Click continue")
    def click_continue(self) -> None:
        self.continue_button.click()

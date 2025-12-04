from playwright.sync_api import Page

from mavis.test.annotations import step


class ChildRecordTabs:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.child_record_tab = page.get_by_role("link", name="Child record")
        self.activity_log_tab = page.get_by_role("link", name="Activity log")

    @step("Click on Activity log")
    def click_activity_log(self) -> None:
        self.activity_log_tab.click()
        self.activity_log_tab.get_by_role("strong").wait_for()

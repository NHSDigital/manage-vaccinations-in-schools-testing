from playwright.sync_api import Page


class BadRequestPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.page_heading = self.page.get_by_role(
            "heading",
            name="Error: page not available",
            exact=True,
        )

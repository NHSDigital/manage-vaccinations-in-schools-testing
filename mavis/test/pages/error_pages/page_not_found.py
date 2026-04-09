from playwright.sync_api import Page


class PageNotFound:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.page_heading = self.page.get_by_role(
            "heading",
            name="Page not found",
            exact=True,
        )

    def is_not_displayed(self) -> bool:
        return self.page_heading.count() == 0

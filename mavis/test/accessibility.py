from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page

axe = Axe()


class AccessibilityHelper:
    def __init__(self, page: Page) -> None:
        self.page = page

    def check_accessibility(self) -> None:
        results = axe.run(
            self.page,
            context={"exclude": ".nhsuk-back-link"},  # back link is excluded
        )
        assert results.violations_count == 0, results.generate_report()  # noqa: S101

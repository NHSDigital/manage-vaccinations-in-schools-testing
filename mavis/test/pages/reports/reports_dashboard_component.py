import re

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme


class ReportsDashboardComponent:
    def __init__(self, page: Page) -> None:
        self.page = page

    @step("Click {1}")
    def check_filter_for_programme(self, programme: Programme) -> None:
        self.page.get_by_role("radio", name=programme).check()

    @step("Check cohort has {1} children")
    def check_cohort_has_n_children(self, expected_value_string: str) -> None:
        cohort_heading = self.page.get_by_role("heading", name="Cohort", exact=True)
        cohort_value = cohort_heading.locator("xpath=following-sibling::*[1]")
        if expected_value_string == "1":
            expect(cohort_value).to_contain_text(f"{expected_value_string}child")
        else:
            expect(cohort_value).to_contain_text(f"{expected_value_string}children")

    @step("Check category {1} percentage is {2}%")
    def check_category_percentage(
        self, category: str, expected_percentage_string: str
    ) -> None:
        category_heading = self.page.get_by_role("heading", name=category, exact=True)
        category_value = category_heading.locator("xpath=following-sibling::*[1]")
        expect(category_value).to_contain_text(f"{expected_percentage_string}%")

    def get_category_count(self, category: str) -> int:
        """Get the child count for a category.

        Extracts the number from text like "100%1 child" or "50%2 children".

        Args:
            category: The category name

        Returns:
            The number of children in that category
        """
        category_heading = self.page.get_by_role("heading", name=category, exact=True)
        # Wait for heading to be visible
        expect(category_heading).to_be_visible()

        category_value = category_heading.locator("xpath=following-sibling::*[1]")
        # Wait for value to be visible
        expect(category_value).to_be_visible()

        text = category_value.text_content()

        # Extract number from text like "100%1 child", "50.0%2 children", "0%0 children"
        # The format is: "{percentage}%{count} child/children"
        # Handle both "child" and "children", with optional space after %
        match = re.search(r"%\s*(\d+)\s+child(?:ren)?", text)
        if match:
            return int(match.group(1))

        # If no match, raise error with actual text for debugging
        msg = f"Could not extract count from category '{category}'. Text was: '{text}'"
        raise ValueError(msg)

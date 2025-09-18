import pytest


@pytest.mark.smoke
def test_start_page_elements_visible(start_page):
    """
    Test: Verify that the start page heading and start link are visible.
    Steps:
    1. Navigate to the start page.
    2. Check that the heading is visible.
    3. Check that the start link is visible.
    Verification:
    - Both the heading and start link are present and visible on the page.
    """
    start_page.navigate()

    start_page.check_all_start_page_elements_visible()


def test_accessibility_statement_link(start_page):
    """
    Test: Verify that the Accessibility Statement link is present and clickable.
    Steps:
    1. Navigate to the start page.
    2. Click the Accessibility Statement link.
    3. Verify the accessibility statement page is displayed.
    Verification:
    - The Accessibility Statement page is displayed.
    """
    start_page.navigate()
    start_page.click_accessibility_statement()
    start_page.check_accessibility_statement_shown()


def test_service_guidance_link(start_page):
    """
    Test: Verify that the Service Guidance link is present and clickable.
    Steps:
    1. Navigate to the start page.
    2. Click the Service Guidance link.
    3. Verify the service guidance page is displayed in a new tab.
    Verification:
    - The Service Guidance page is displayed in a new tab.
    """
    start_page.navigate()
    start_page.check_service_guidance_tab_opens()

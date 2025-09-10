import pytest
from playwright.sync_api import expect

pytestmark = pytest.mark.smoke


def test_start_page_elements_visible(start_page):
    """Test: Verify that the start page heading and start link are visible.
    Steps:
    1. Navigate to the start page.
    2. Check that the heading is visible.
    3. Check that the start link is visible.
    Verification:
    - Both the heading and start link are present and visible on the page.
    """
    start_page.navigate()

    expect(start_page.heading).to_be_visible()
    expect(start_page.start_link).to_be_visible()

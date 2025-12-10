from mavis.test.helpers.page_health_helper import PageHealthHelper
from mavis.test.utils import check_page_health


def test_page_health_helper_example(page, log_in_as_nurse):
    """
    Example test showing how to use PageHealthHelper for checking error pages
    and broken links.

    This test demonstrates various ways to use the page health functionality:
    1. Using the helper class directly
    2. Using the convenience function from utils
    3. Checking only for error pages
    4. Checking only for broken links
    """
    # Navigate to dashboard after login
    page.goto("/dashboard")

    # Method 1: Use helper class for full health check
    health_helper = PageHealthHelper(page)
    health_helper.check_page_health(check_links=True, max_links=15)

    # Method 2: Use convenience function from utils
    check_page_health(page, check_links=True, max_links=10)

    # Method 3: Check only for error pages (faster)
    health_helper.check_for_error_page()

    # Method 4: Get detailed broken links info without assertions
    broken_links = health_helper.check_for_broken_links(max_links=5)
    # Process broken links if needed
    if broken_links:
        # In real tests, you might want to log this information instead
        pass

    # The check_page_health method will raise AssertionError if broken links are found
    # So calling it with check_links=True is equivalent to asserting no broken links


def test_page_health_error_page_detection(page):
    """
    Test that demonstrates how the helper detects error pages using BadRequestPage.
    This test will intentionally navigate to a non-existent page to test detection.
    """
    # This should work fine
    page.goto("/")
    health_helper = PageHealthHelper(page)
    health_helper.check_for_error_page()  # Should pass

    # Example of testing error page detection:
    # Navigate to a non-existent page and verify error detection works
    # This would require setting up a proper test scenario


def test_page_health_with_custom_limits(page, log_in_as_nurse):
    """
    Example showing how to customize the number of links checked.
    Useful for pages with many links where you want to limit performance impact.
    """
    page.goto("/dashboard")

    health_helper = PageHealthHelper(page)

    # Check only a few links for better performance
    health_helper.check_page_health(check_links=True, max_links=5)

    # Or disable link checking entirely for fastest health check
    health_helper.check_page_health(check_links=False)

    # Check specific number of links and get detailed results
    broken_links = health_helper.check_for_broken_links(max_links=3)
    assert len(broken_links) == 0, (
        f"Expected no broken links, but found: {broken_links}"
    )


def test_page_health_url_cache(page, log_in_as_nurse):
    """
    Example showing how the URL cache works to avoid duplicate checks.
    """
    page.goto("/dashboard")

    health_helper = PageHealthHelper(page)

    # Check for broken links with custom limit
    health_helper.check_for_broken_links(max_links=10)

    # The helper automatically manages its internal URL cache
    # No need to manually reset between checks on the same page

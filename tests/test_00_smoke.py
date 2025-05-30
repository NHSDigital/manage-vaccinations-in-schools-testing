import pytest

from playwright.sync_api import expect


@pytest.mark.smoke
@pytest.mark.order(1)
def test_start(start_page, playwright_operations):
    start_page.navigate()

    expect(start_page.heading).to_be_visible()
    expect(start_page.start_link).to_be_visible()

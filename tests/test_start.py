import pytest

from playwright.sync_api import expect

pytestmark = pytest.mark.smoke


def test_visible(start_page):
    start_page.navigate()

    expect(start_page.heading).to_be_visible()
    expect(start_page.start_link).to_be_visible()

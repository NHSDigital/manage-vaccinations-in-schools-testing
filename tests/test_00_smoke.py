import subprocess

import pytest

from playwright.sync_api import expect


@pytest.mark.smoke
@pytest.mark.order(1)
def test_verify_packages():
    packages_installed = subprocess.run(
        args=["pip", "list"], capture_output=True, text=True
    ).stdout.strip()
    packages_to_verify = ["dotenv", "playwright", "requests"]
    for package in packages_to_verify:
        if package not in packages_installed:
            assert False, f"{package} not installed"


@pytest.mark.smoke
@pytest.mark.order(2)
def test_start(start_page, playwright_operations):
    start_page.navigate()

    expect(start_page.heading).to_be_visible()
    expect(start_page.start_link).to_be_visible()

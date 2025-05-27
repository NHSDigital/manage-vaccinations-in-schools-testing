import pathlib
import subprocess

import pytest

from libs.generic_constants import properties


@pytest.mark.smoke
@pytest.mark.order(1)
def test_files_and_paths():
    folder_paths_to_verify = ["screenshots", "test_data", "working"]
    for folder_path in folder_paths_to_verify:
        if not pathlib.Path(folder_path).is_dir():
            assert False, f"{folder_path} not found on project root"


@pytest.mark.smoke
@pytest.mark.order(2)
def test_verify_packages():
    packages_installed = subprocess.run(
        args=["pip", "list"], capture_output=True, text=True
    ).stdout.strip()
    packages_to_verify = ["dotenv", "playwright", "requests"]
    for package in packages_to_verify:
        if package not in packages_installed:
            assert False, f"{package} not installed"


@pytest.mark.smoke
@pytest.mark.order(3)
def test_homepage_loads(start_mavis, playwright_operations):
    playwright_operations.verify(
        locator="heading",
        property=properties.TEXT,
        expected_value="Manage vaccinations in schools (Mavis)",
    )

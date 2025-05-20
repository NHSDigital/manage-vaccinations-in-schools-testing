import subprocess

import pytest

from libs import file_ops, playwright_ops
from libs.generic_constants import properties


class Test_Smoke:
    fo = file_ops.file_operations()
    po = playwright_ops.playwright_operations()

    # SELF TEST
    @pytest.mark.smoke
    @pytest.mark.order(1)
    def test_smoke_files_and_paths(self):
        folder_paths_to_verify = ["screenshots", "test_data", "working"]
        for folder_path in folder_paths_to_verify:
            if not self.fo.check_if_path_exists(file_or_folder_path=folder_path):
                assert False, f"{folder_path} not found on project root"

    @pytest.mark.smoke
    @pytest.mark.order(2)
    def test_smoke_verify_packages(self):
        packages_installed = subprocess.run(
            args=["pip", "list"], capture_output=True, text=True
        ).stdout.strip()
        packages_to_verify = ["dotenv", "playwright", "requests"]
        for package in packages_to_verify:
            if package not in packages_installed:
                assert False, f"{package} not installed"

    # CHECK APPLICATION ACCESS
    @pytest.mark.smoke
    @pytest.mark.order(3)
    def test_smoke_homepage_loads(self, start_mavis: None):
        self.po.verify(
            locator="heading",
            property=properties.TEXT,
            expected_value="Manage vaccinations in schools (Mavis)",
        )

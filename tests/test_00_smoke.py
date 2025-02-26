import subprocess

import pytest

from libs import file_ops, playwright_ops
from libs.constants import element_properties


class Test_Smoke:
    fo = file_ops.file_operations()
    po = playwright_ops.playwright_operations()

    # SELF TEST
    @pytest.mark.smoke
    @pytest.mark.order(1)
    def test_smoke_files_and_paths(self):
        assert self.fo.check_if_path_exists(
            file_or_folder_path="screenshots/"
        ), "screenshots folder does not exist at project root"
        assert self.fo.check_if_path_exists(
            file_or_folder_path="test_data/"
        ), "test_data folder does not exist at project root"
        assert self.fo.check_if_path_exists(
            file_or_folder_path="working/"
        ), "working folder does not exist at project root"

    @pytest.mark.smoke
    @pytest.mark.order(2)
    def test_smoke_verify_packages(self):
        packages = subprocess.run(args=["pip", "list"], capture_output=True, text=True).stdout.strip()
        assert "pytest" in packages
        assert "dotenv" in packages
        assert "playwright" in packages
        assert "requests" in packages

    # CHECK APPLICATION ACCESS
    @pytest.mark.smoke
    @pytest.mark.order(3)
    def test_smoke_homepage_loads(self, start_mavis: None):
        self.po.verify(
            locator="heading",
            property=element_properties.TEXT,
            expected_value="Manage vaccinations in schools (Mavis)",
        )

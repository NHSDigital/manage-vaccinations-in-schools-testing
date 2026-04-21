from pathlib import Path

from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.utils import (
    get_current_datetime_compact,
    reload_until_element_is_visible,
)


class DownloadsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self._school_moves_card = page.locator(
            ".nhsuk-card",
            has=page.locator(".nhsuk-card__link", has_text="School moves"),
        ).first

    @step("Wait for school moves export to be ready")
    def wait_for_ready(self) -> None:
        reload_until_element_is_visible(
            self.page, self._school_moves_card.get_by_text("Ready")
        )

    @step("Download school moves CSV")
    def download_csv(self) -> Path:
        file_path = Path(f"working/school_moves_{get_current_datetime_compact()}.csv")
        with self.page.expect_download() as download_info:
            self._school_moves_card.get_by_role("link", name="School moves").click()
        download_info.value.save_as(file_path)
        return file_path

    @step("Wait for session export to be ready")
    def wait_for_session_export_ready(self) -> None:
        session_export_card = self.page.locator(
            ".nhsuk-card",
            has=self.page.locator(".nhsuk-card__link", has_text="offline session"),
        ).first
        reload_until_element_is_visible(
            self.page, session_export_card.get_by_text("Ready")
        )

    @step("Download session export")
    def download_session_export(self, file_path: Path) -> None:
        session_export_card = self.page.locator(
            ".nhsuk-card",
            has=self.page.locator(".nhsuk-card__link", has_text="offline session"),
        ).first
        with self.page.expect_download() as download_info:
            session_export_card.locator(".nhsuk-card__link").click()
        download_info.value.save_as(file_path)

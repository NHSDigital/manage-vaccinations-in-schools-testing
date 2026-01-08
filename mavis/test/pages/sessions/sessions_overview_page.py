import re
import time
from datetime import date
from pathlib import Path

import pandas as pd
from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.data import get_session_id
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.sessions.sessions_tabs import SessionsTabs
from mavis.test.utils import (
    get_current_datetime_compact,
    get_formatted_date_for_session_dates,
)


class SessionsOverviewPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = SessionsTabs(page)
        self.header = HeaderComponent(page)

        self.schedule_sessions_link = self.page.get_by_role(
            "link",
            name="Schedule sessions",
        )
        self.edit_session_link = self.page.get_by_role("link", name="Edit session")
        self.send_reminders_link = self.page.get_by_role(
            "link",
            name="Send reminders",
        )
        self.import_class_lists_link = self.page.get_by_role(
            "link",
            name="Import class lists",
        )
        self.record_offline_link = self.page.get_by_role("link", name="Record offline")
        self.review_no_consent_response_link = self.page.get_by_role(
            "link",
            name="with no response",
        )
        self.set_session_in_progress_button = self.page.get_by_role(
            "button",
            name="Set session in progress for today",
        )
        self.consent_refused_link = self.page.get_by_role(
            "link", name="Consent refused"
        )
        self.has_a_refusal_link = self.page.get_by_role("link", name="Has a refusal")
        self.send_manual_consent_reminders_button = self.page.get_by_role(
            "button", name="Send manual consent reminders"
        )
        self.community_clinic_link = self.page.get_by_role(
            "link", name="Community clinic", exact=True
        )

    @step("Click Community clinic session for {1}")
    def click_community_clinic(self, programme: Programme) -> None:
        # Find the "Community clinic" link in the same container as the programme name
        locator = (
            self.page.locator("*")
            .filter(has_text=str(programme))
            .get_by_role("link", name="Community clinic")
            .first
        )
        locator.click()

    def get_total_for_category(self, programme: Programme, category: str) -> int:
        programme_section = self.page.locator(f'section:has(h3:text("{programme}"))')

        category_locator = programme_section.locator(
            ".nhsuk-card__heading.nhsuk-heading-xs", has_text=category
        )
        total_locator = category_locator.locator("xpath=following-sibling::*[1]")
        return int(total_locator.inner_text())

    def get_all_totals(self, programme: Programme) -> dict[str, int]:
        return {
            category: self.get_total_for_category(programme, category)
            for category in programme.tally_categories
        }

    def check_all_totals(self, programme: Programme, totals: dict[str, int]) -> None:
        self.tabs.click_overview_tab()
        for category, expected_total in totals.items():
            actual_total = self.get_total_for_category(programme, category)
            assert actual_total == expected_total, (
                f"Expected {expected_total} for {category}, but got {actual_total}"
            )

    @step("Click Has a refusal")
    def click_has_a_refusal(self) -> None:
        self.has_a_refusal_link.first.click()

    @step("Go to Edit session page")
    def schedule_or_edit_session(self) -> None:
        locator = self.schedule_sessions_link.or_(self.edit_session_link).first
        # temporary wait to prevent page not found error
        time.sleep(1)
        locator.click()

    @step("Click on Schedule sessions")
    def click_schedule_sessions(self) -> None:
        self.schedule_sessions_link.click()

    @step("Click on Edit session")
    def click_edit_session(self) -> None:
        self.edit_session_link.click()

    @step("Click Send manual consent reminders")
    def click_send_manual_consent_reminders(self) -> None:
        self.send_manual_consent_reminders_button.click()

    def get_online_consent_url(self, *programmes: Programme) -> str:
        programme_names = [str(programme) for programme in programmes]
        link_text = f"View the {' and '.join(programme_names)} online consent form"
        return str(self.page.get_by_role("link", name=link_text).get_attribute("href"))

    @step("Send consent reminders")
    def send_consent_reminders(self) -> None:
        self.send_reminders_link.click()
        expect(
            self.page.get_by_role("heading", name="Manage consent reminders")
        ).to_be_visible()
        self.click_send_manual_consent_reminders()

    @step("Review child with no response")
    def review_child_with_no_response(self) -> None:
        self.review_no_consent_response_link.click()

    @step("Click on Set session in progress for today")
    def click_set_session_in_progress_for_today(self) -> None:
        self.set_session_in_progress_button.click()

    def get_session_id_from_offline_excel(self) -> str:
        file_path = self.download_offline_recording_excel()
        return get_session_id(file_path)

    @step("Click on Record offline")
    def download_offline_recording_excel(self) -> Path:
        _file_path = Path(f"working/excel_{get_current_datetime_compact()}.xlsx")

        with self.page.expect_download() as download_info:
            self.record_offline_link.click()
        download = download_info.value
        download.save_as(_file_path)

        return _file_path

    @step("Download the offline recording excel and verify consent message pattern")
    def verify_consent_message_in_excel(self) -> None:
        _file_path = self.download_offline_recording_excel()
        _data_frame = pd.read_excel(_file_path, sheet_name="Vaccinations", dtype=str)
        _consent_details_pattern = (
            r"On \d{4}-\d{2}-\d{2} at \d{2}:\d{2} (GIVEN|REFUSED) by "
            r"[A-Z][a-z]+(?: [A-Z][a-z]+)*"
        )
        invalid_found = _data_frame["CONSENT_DETAILS"].apply(
            lambda x: pd.notna(x) and len(re.findall(_consent_details_pattern, x)) == 0
        )
        # Raise error if any invalid entry is found
        if invalid_found.any():
            msg = "CONSENT_DETAILS has entries in an invalid format."
            raise ValueError(msg)

    @step("Click on Download the {1} consent form (PDF)")
    def download_consent_form(self, programme: Programme) -> Path:
        _file_path = Path(f"working/consent_{get_current_datetime_compact()}.pdf")

        with self.page.expect_download() as download_info:
            self.page.get_by_role(
                "link", name=f"Download the {programme} consent form (PDF)"
            ).click()
        download = download_info.value
        download.save_as(_file_path)

        return _file_path

    def is_date_scheduled(self, date: date) -> bool:
        return self.page.get_by_text(
            get_formatted_date_for_session_dates(date)
        ).first.is_visible()

    @step("Click Consent refused")
    def click_consent_refused(self) -> None:
        self.consent_refused_link.click()

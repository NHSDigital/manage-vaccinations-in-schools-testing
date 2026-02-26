from enum import Enum, auto

from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class ImportIssuesPage:
    def __init__(
        self,
        page: Page,
    ) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.uploaded_child_record_radio_button = self.page.get_by_role(
            "radio", name="Use uploaded"
        )
        self.existing_child_record_radio_button = self.page.get_by_role(
            "radio", name="Keep existing"
        )
        self.both_child_records_radio_button = self.page.get_by_role(
            "radio", name="Keep both"
        )

        self.resolve_duplicate_button = self.page.get_by_role(
            "button", name="Resolve duplicate"
        )

    class RecordToKeep(Enum):
        UPLOADED = auto()
        EXISTING = auto()
        BOTH = auto()

    @step("Resolve duplicate child record")
    def resolve_duplicate(self, record_to_keep: RecordToKeep) -> None:
        match record_to_keep:
            case self.RecordToKeep.UPLOADED:
                self.uploaded_child_record_radio_button.click()
            case self.RecordToKeep.EXISTING:
                self.existing_child_record_radio_button.click()
            case self.RecordToKeep.BOTH:
                self.both_child_records_radio_button.click()
        self.resolve_duplicate_button.click()

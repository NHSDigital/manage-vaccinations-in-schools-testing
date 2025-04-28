from typing import Final

from libs import playwright_ops
from libs.generic_constants import element_properties, framework_actions
from libs.wrappers import *


class pg_vaccines:
    po = playwright_ops.playwright_operations()

    LBL_VACCINE_NAME: Final[str] = "Gardasil 9 (HPV)"
    LBL_VACCINE_MANUFACTURER: Final[str] = "Merck Sharp & Dohme"
    LBL_MAIN: Final[str] = "main"
    LBL_PARAGRAPH: Final[str] = "paragraph"
    LBL_BATCH_ARCHIVED: Final[str] = "Batch archived."
    LNK_ADD_NEW_BATCH: Final[str] = "Add a new batch"
    TXT_BATCH_NAME: Final[str] = "Batch"
    TXT_EXPIRY_DAY: Final[str] = "Day"
    TXT_EXPIRY_MONTH: Final[str] = "Month"
    TXT_EXPIRY_YEAR: Final[str] = "Year"
    BTN_ADD_BATCH: Final[str] = "Add batch"
    BTN_SAVE_CHANGES: Final[str] = "Save changes"
    BTN_CONFIRM_ARCHIVE: Final[str] = "Yes, archive this batch"

    def verify_current_vaccine(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_VACCINE_NAME, exact=False
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value=self.LBL_VACCINE_MANUFACTURER,
            exact=False,
        )

    def enter_batch_name(self):
        self.batch_name = f"Auto{get_current_datetime()}"
        self.po.act(locator=self.TXT_BATCH_NAME, action=framework_actions.FILL, value=self.batch_name)

    def enter_batch_expiry(self, expiry_date: str = ""):
        _future_expiry_date = get_offset_date(offset_days=730) if expiry_date == "" else expiry_date
        _day = _future_expiry_date[-2:]
        _month = _future_expiry_date[4:6]
        _year = _future_expiry_date[:4]
        self.po.act(locator=self.TXT_EXPIRY_DAY, action=framework_actions.FILL, value=_day)
        self.po.act(locator=self.TXT_EXPIRY_MONTH, action=framework_actions.FILL, value=_month)
        self.po.act(locator=self.TXT_EXPIRY_YEAR, action=framework_actions.FILL, value=_year)

    def add_gardasil9_batch(self):
        self.po.act(locator=self.LNK_ADD_NEW_BATCH, action=framework_actions.CLICK_LINK, index=0)
        self.enter_batch_name()
        self.enter_batch_expiry()
        self.po.act(locator=self.BTN_ADD_BATCH, action=framework_actions.CLICK_BUTTON)
        _success_message = f"Batch {self.batch_name} added"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def add_menquadfi_batch(self):
        self.po.act(locator=self.LNK_ADD_NEW_BATCH, action=framework_actions.CLICK_LINK, index=1)
        self.enter_batch_name()
        self.enter_batch_expiry()
        self.po.act(locator=self.BTN_ADD_BATCH, action=framework_actions.CLICK_BUTTON)
        _success_message = f"Batch {self.batch_name} added"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def add_revaxis_batch(self):
        self.po.act(locator=self.LNK_ADD_NEW_BATCH, action=framework_actions.CLICK_LINK, index=2)
        self.enter_batch_name()
        self.enter_batch_expiry()
        self.po.act(locator=self.BTN_ADD_BATCH, action=framework_actions.CLICK_BUTTON)
        _success_message = f"Batch {self.batch_name} added"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def change_batch(self):
        self.po.act(locator=self.batch_name, action=framework_actions.CLICK_LINK_INDEX_FOR_ROW, value=0)  # CHANGE link
        self.po.act(locator=self.TXT_EXPIRY_YEAR, action=framework_actions.FILL, value="2031")
        self.po.act(locator=self.BTN_SAVE_CHANGES, action=framework_actions.CLICK_BUTTON)
        _success_message = f"Batch {self.batch_name} updated"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def archive_batch(self):
        self.po.act(
            locator=self.batch_name, action=framework_actions.CLICK_LINK_INDEX_FOR_ROW, value=1
        )  # ARCHIVE link
        self.po.act(locator=self.BTN_CONFIRM_ARCHIVE, action=framework_actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=self.LBL_BATCH_ARCHIVED
        )

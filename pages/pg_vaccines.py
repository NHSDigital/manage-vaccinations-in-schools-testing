from typing import Final

from libs import playwright_ops
from libs.generic_constants import element_properties, framework_actions
from libs.mavis_constants import vaccine_names
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

    def _enter_batch_name(self, vaccine_name: str):
        self.batch_name = f"{vaccine_name}{get_current_datetime()}"
        self.po.act(locator=self.TXT_BATCH_NAME, action=framework_actions.FILL, value=self.batch_name)

    def _enter_batch_expiry(self, expiry_date: str = ""):
        _future_expiry_date = get_offset_date(offset_days=730) if expiry_date == "" else expiry_date
        _day = _future_expiry_date[-2:]
        _month = _future_expiry_date[4:6]
        _year = _future_expiry_date[:4]
        self.po.act(locator=self.TXT_EXPIRY_DAY, action=framework_actions.FILL, value=_day)
        self.po.act(locator=self.TXT_EXPIRY_MONTH, action=framework_actions.FILL, value=_month)
        self.po.act(locator=self.TXT_EXPIRY_YEAR, action=framework_actions.FILL, value=_year)

    def _get_batch_details(self, vacc_name: str):
        self.vacc_name = vacc_name[0]
        self.add_btn_index = vacc_name[1]

    def add_batch(self, vaccine_name: str):
        self._get_batch_details(vacc_name=vaccine_name)
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.vacc_name)
        self.po.act(locator=self.LNK_ADD_NEW_BATCH, action=framework_actions.CLICK_LINK, index=self.add_btn_index)
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.vacc_name)
        self._enter_batch_name(vaccine_name=self.vacc_name)
        self._enter_batch_expiry()
        self.po.act(locator=self.BTN_ADD_BATCH, action=framework_actions.CLICK_BUTTON)
        _success_message = f"Batch {self.batch_name} added"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def change_batch(self):
        self.po.act(locator=self.batch_name, action=framework_actions.CLICK_LINK_INDEX_FOR_ROW, value=0)  # CHANGE link
        self.po.act(
            locator=self.TXT_EXPIRY_YEAR, action=framework_actions.FILL, value=get_offset_date(offset_days=365)[:4]
        )
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

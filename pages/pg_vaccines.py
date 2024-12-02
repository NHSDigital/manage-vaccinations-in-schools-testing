from libs import playwright_ops
from libs.constants import actions, object_properties
from libs.wrappers import *


class pg_vaccines:
    po = playwright_ops.playwright_operations()

    LBL_VACCINE_NAME = "Gardasil 9 (HPV)"
    LBL_VACCINE_MANUFACTURER = "Merck Sharp & Dohme"
    LBL_MAIN = "main"
    LBL_PARAGRAPH = "paragraph"
    LBL_BATCH_ARCHIVED = "Batch archived."
    LNK_ADD_NEW_BATCH = "Add a new batch"
    TXT_BATCH_NAME = "Batch"
    TXT_EXPIRY_DAY = "Day"
    TXT_EXPIRY_MONTH = "Month"
    TXT_EXPIRY_YEAR = "Year"
    BTN_ADD_BATCH = "Add batch"
    BTN_SAVE_CHANGES = "Save changes"
    BTN_CONFIRM_ARCHIVE = "Yes, archive this batch"

    def verify_current_vaccine(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_VACCINE_NAME, exact=False
        )
        self.po.verify(
            locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_VACCINE_MANUFACTURER, exact=False
        )

    def enter_batch_name(self):
        self.batch_name = f"Auto{get_new_datetime()}"
        self.po.perform_action(locator=self.TXT_BATCH_NAME, action=actions.FILL, value=self.batch_name)

    def enter_batch_expiry(self, expiry_date: str = ""):
        _future_expiry_date = get_offset_date(offset_days=730) if expiry_date == "" else expiry_date
        _day = _future_expiry_date[-2:]
        _month = _future_expiry_date[4:6]
        _year = _future_expiry_date[:4]
        self.po.perform_action(locator=self.TXT_EXPIRY_DAY, action=actions.FILL, value=_day)
        self.po.perform_action(locator=self.TXT_EXPIRY_MONTH, action=actions.FILL, value=_month)
        self.po.perform_action(locator=self.TXT_EXPIRY_YEAR, action=actions.FILL, value=_year)

    def add_batch(self):
        self.po.perform_action(locator=self.LNK_ADD_NEW_BATCH, action=actions.CLICK_LINK)
        self.enter_batch_name()
        self.enter_batch_expiry()
        self.po.perform_action(locator=self.BTN_ADD_BATCH, action=actions.CLICK_BUTTON)
        _success_message = f"Batch {self.batch_name} added"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=_success_message)

    def change_batch(self):
        self.po.perform_action(
            locator=self.batch_name, action=actions.CLICK_LINK_INDEX_FOR_ROW, value=0
        )  # CHANGE link
        self.po.perform_action(locator=self.TXT_EXPIRY_YEAR, action=actions.FILL, value="2031")
        self.po.perform_action(locator=self.BTN_SAVE_CHANGES, action=actions.CLICK_BUTTON)
        _success_message = f"Batch {self.batch_name} updated"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=_success_message)

    def archive_batch(self):
        self.po.perform_action(
            locator=self.batch_name, action=actions.CLICK_LINK_INDEX_FOR_ROW, value=1
        )  # ARCHIVE link
        self.po.perform_action(locator=self.BTN_CONFIRM_ARCHIVE, action=actions.CLICK_BUTTON)
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=self.LBL_BATCH_ARCHIVED)

import os
import re
from itertools import chain

from libs import CurrentExecution
from libs.generic_constants import (
    aria_roles,
    element_actions,
    element_properties,
    html_tags,
    screenshot_actions,
    screenshot_file_types,
    wait_time,
)
from libs.mavis_constants import data_values
from libs.wrappers import *


class playwright_operations:
    ce = CurrentExecution()
    PAGE_ELEMENT_PATH = "self.ce.page."

    def capture_screenshot(self, identifier: str, action: str) -> None:
        if self.ce.capture_screenshot_flag:
            self.ce.screenshot_sequence += 1
            _ss_path = os.path.join(
                self.ce.session_screenshots_dir,
                f"{self.ce.screenshot_sequence}-{action}-{identifier}.{screenshot_file_types.JPEG}",
            )
            _ss_cleaned_path = clean_file_name(_ss_path)
            self.ce.page.screenshot(path=_ss_cleaned_path, type=screenshot_file_types.JPEG, full_page=True)

    def verify(self, locator: str, property: str, expected_value: str, **kwargs) -> None:
        # Unpack keyword arguments
        exact: bool = kwargs.get("exact", False)
        by_test_id: bool = kwargs.get("by_test_id", False)
        chain_locator: bool = kwargs.get("chain_locator", False)
        # Act
        actual_value = self.get_element_property(
            locator=locator, property=property, by_test_id=by_test_id, chain_locator=chain_locator
        )
        match property.lower():
            case element_properties.TEXT:
                if expected_value != "":
                    self._verify_text(
                        locator=locator, expected_value=expected_value, actual_value=actual_value, exact=exact
                    )
            case element_properties.VISIBILITY:
                self._verify_visibility(locator=locator, expected_value=expected_value, actual_value=actual_value)

    def get_element_property(self, locator: str, property: str, **kwargs) -> str:
        # Unpack keyword arguments
        by_test_id: bool = kwargs.get("by_test_id", False)
        chain_locator: bool = kwargs.get("chain_locator", False)
        index: int = kwargs.get("index", 0)
        # Act
        match property:
            case element_properties.TEXT:
                return self._get_element_text(
                    locator=locator, index=index, by_test_id=by_test_id, chain_locator=chain_locator
                )
            case element_properties.VISIBILITY:
                return self._get_element_visibility(locator=locator, index=index, chain_locator=chain_locator)
            case element_properties.HREF:
                return self._get_element_href(locator=locator, index=index, chain_locator=chain_locator)
            case element_properties.EXISTS:
                return self.ce.page.query_selector(locator) is not None
            case element_properties.PAGE_URL:
                return self.ce.page.url

    def act(self, locator, action, value=None, **kwargs) -> None:
        # Unpack keyword arguments
        exact: bool = kwargs.get("exact", False)
        index: int = kwargs.get("index", 0)
        # Act
        self.capture_screenshot(identifier=locator, action=f"before-{action}")
        match action.lower():
            case element_actions.CLICK_LINK:
                self._click_link(locator=locator, exact=exact, index=index)
            case element_actions.CLICK_BUTTON:
                self._click_button(locator=locator, exact=exact, index=index)
            case element_actions.CLICK_LABEL:
                self._click_label(locator=locator, exact=exact, index=index)
            case element_actions.CLICK_TEXT:
                self._click_text(locator=locator, exact=exact, index=index)
            case element_actions.FILL | element_actions.TYPE:
                self._fill(locator=locator, value=value, exact=exact, index=index)
            case element_actions.RADIO_BUTTON_SELECT:
                self._radio_button_select(locator=locator, exact=exact, index=index)
            case element_actions.SELECT_FILE:
                self._select_file(locator=locator, value=value, exact=exact, index=index)
            case element_actions.SELECT_FROM_LIST:
                self._select_from_list(locator=locator, value=value, index=index)
            case element_actions.CHECKBOX_CHECK:
                self._checkbox_check(locator=locator, index=index)
            case element_actions.CHECKBOX_UNCHECK:
                self._checkbox_uncheck(locator=locator, index=index)
            case element_actions.CLICK_LINK_INDEX_FOR_ROW:
                self._click_index_for_row(locator=locator, value=value, index=index)
            case element_actions.DOWNLOAD_FILE:
                self._download_file(locator=locator, value=value, index=index)
            case element_actions.CLICK_WILDCARD:
                self.ce.page.click(f"text={locator}")
            case element_actions.CHAIN_LOCATOR_ACTION:
                eval(f"{self.PAGE_ELEMENT_PATH}{locator}")
        self.capture_screenshot(identifier=locator, action=f"after-{action}")

    def _click_link(self, locator: str, exact: bool, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator, exact=exact).nth(index)
        else:
            elem = self.ce.page.get_by_role(aria_roles.LINK, name=locator, exact=exact).nth(index)
        elem.click()
        self._check_for_app_crash(locator_info=locator)

    def _click_button(self, locator: str, exact: bool, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_role(aria_roles.BUTTON, name=locator, exact=exact).nth(index)
        elem.click()
        self._check_for_app_crash(locator_info=locator)

    def _click_label(self, locator: str, exact: bool, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
        elem.click()

    def _click_text(self, locator: str, exact: bool, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_text(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_text(locator, exact=exact).nth(index)
        elem.click()

    def _fill(self, locator: str, value: str, exact: bool, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
        elem.click()
        if value != data_values.EMPTY:
            elem.fill(value)

    def _radio_button_select(self, locator: str, exact: bool, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
        elem.click()

    def _select_file(self, locator: str, value: str, exact: bool, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
        elem.set_input_files(value)

    def _select_from_list(self, locator: str, value: str, index: int):
        self._fill(locator=locator, value=value, exact=False, index=index)
        wait(timeout=wait_time.MIN)
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_role(aria_roles.OPTION, name=value)
        elem.click()

    def _checkbox_check(self, locator: str, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator).nth(index)
        elem.check()

    def _checkbox_uncheck(self, locator: str, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator).nth(0)
        elem.uncheck()

    def _click_index_for_row(self, locator: str, value: str, index: int):
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = (
                self.ce.page.get_by_role(
                    aria_roles.ROW,
                    name=locator,
                )
                .get_by_role(aria_roles.LINK)
                .nth(value)
            )
        elem.click()

    def _download_file(self, locator: str, value: str, index: int):
        with self.ce.page.expect_download() as download_info:
            self.act(locator=locator, action=element_actions.CLICK_LINK, index=index)
        download = download_info.value
        # download.save_as("/path/to/save/at/" + download.suggested_filename)
        download.save_as(value)

    def _verify_text(self, locator: str, expected_value: str, actual_value: str, exact: bool):
        if expected_value.startswith(escape_characters.COMMENT_OPERATOR):  # Skip this check
            return
        if exact:
            _passed: bool = True if expected_value == actual_value else False
            if _passed:
                self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED)
            else:
                self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED)
            assert _passed, f"Exact match failed. Expected: '{expected_value}' but actual: '{actual_value}'."
        else:
            if expected_value.startswith(escape_characters.NOT_OPERATOR):
                expected_value = expected_value.removeprefix(escape_characters.NOT_OPERATOR)
                _passed: bool = True if clean_text(text=expected_value) not in clean_text(text=actual_value) else False
                if _passed:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED)
                else:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED)
                assert _passed, f"Text '{expected_value}' not found in '{actual_value}'."
            else:
                _passed: bool = True if clean_text(text=expected_value) in clean_text(text=actual_value) else False
                if _passed:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED)
                else:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED)
                assert _passed, f"Text '{expected_value}' not found in '{actual_value}'."

    def _verify_visibility(self, locator: str, expected_value: str, actual_value: str):
        _passed: bool = True if actual_value == expected_value else False
        if _passed:
            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_VISIBILITY_PASSED)
        else:
            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_VISIBILITY_FAILED)
        assert _passed, f"{locator} is not visible."

    def _get_element_text(self, locator: str, index: int, by_test_id: bool, chain_locator: bool) -> str:
        if by_test_id:
            elem = self.ce.page.get_by_test_id(locator)
        else:
            if chain_locator:
                elem = eval(f"{self.PAGE_ELEMENT_PATH}{locator}")
            else:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).locator(aria_roles.SPAN)
                else:
                    elem = self.ce.page.get_by_role(locator).nth(index)
        elem.scroll_into_view_if_needed()
        return "".join(elem.all_text_contents()).strip()

    def _get_element_visibility(self, locator: str, index: int, chain_locator: bool) -> str:
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            if chain_locator:
                wait(timeout=wait_time.MIN)
                elem = eval(f"{self.PAGE_ELEMENT_PATH}{locator}")
            else:
                elem = self.ce.page.get_by_role(locator).nth(0)
        return elem.is_visible()

    def _get_element_href(self, locator: str, index: int, chain_locator: bool) -> str:
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            if chain_locator:
                elem = eval(f"{self.PAGE_ELEMENT_PATH}{locator}")
            else:
                elem = self.ce.page.get_by_role(aria_roles.LINK, name=locator).nth(index)
        return elem.get_attribute(element_properties.HREF)

    def _check_for_app_crash(self, locator_info: str):
        _actual_title = self.ce.page.title()
        if "Sorry, there’s a problem with the service" in _actual_title:
            self.ce.reset_environment()
            assert False, f"Application has crashed after: {locator_info}"

    def go_to_url(self, url: str) -> None:
        _full_url = f"{self.ce.service_url.replace('/start','')}{url}" if url.startswith("/") else url
        self.ce.page.goto(_full_url)

    def get_table_cell_location_for_value(self, table_locator: str, col_header: str, row_value: str):
        wait(timeout=wait_time.MED)
        table = self.ce.page.locator(table_locator)
        # Get the column index from the column name
        col_counter = 0
        for c in table.locator(html_tags.TH).all():
            if c.inner_text() == col_header:
                break
            col_counter += 1

        # Find out the row for the text in that column
        row_counter = 1
        for _ in range(table.locator(html_tags.TR).count()):
            row_locator = (
                table.locator(html_tags.TR).nth(row_counter).locator(html_tags.TD).nth(col_counter).inner_text()
            )
            if row_locator == row_value:
                break
            row_counter += 1
        return row_counter, col_counter

import os
import re
from sys import prefix

from libs import CurrentExecution
from libs.constants import (
    actions,
    aria_roles,
    data_values,
    element_properties,
    html_tags,
    screenshot_actions,
    screenshot_file_types,
    wait_time,
)
from libs.wrappers import *


class playwright_operations:
    ce = CurrentExecution()
    PAGE_ELEMENT_PATH = "self.ce.page."

    def capture_screenshot(self, identifier: str, action: str) -> None:
        if self.ce.capture_screenshot_flag:
            self.ce.screenshot_sequence += 1
            _ss_path = clean_file_name(
                os.path.join(
                    self.ce.session_screenshots_dir,
                    f"{self.ce.screenshot_sequence}-{action}-{identifier}-{self.ce.current_browser_name}.{screenshot_file_types.JPEG}",
                )
            )
            # self.ce.page.set_viewport_size({"width": 1500, "height": 1500})  # Not prudent for mobile screenshots
            self.ce.page.screenshot(path=_ss_path, type=screenshot_file_types.JPEG)

    def verify(
        self,
        locator: str,
        property: str,
        expected_value: str,
        exact: bool = False,
        by_test_id: bool = False,
        chain_locator: bool = False,
    ) -> None:
        current_value = self.get_element_property(
            locator=locator, property=property, by_test_id=by_test_id, chain_locator=chain_locator
        )
        match property.lower():
            case element_properties.TEXT:
                if expected_value != "":
                    if expected_value.startswith(escape_characters.COMMENT_OPERATOR):  # Skip this check
                        return
                if exact:
                    if expected_value == current_value:
                        self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED)
                    else:
                        self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED)
                    assert (
                        expected_value == current_value
                    ), f"Exact match failed. Expected: '{expected_value}' but actual: '{current_value}'."
                else:
                    if expected_value.startswith(escape_characters.NOT_OPERATOR):
                        expected_value = expected_value.removeprefix(escape_characters.NOT_OPERATOR)
                        if clean_text(text=expected_value) not in clean_text(text=current_value):
                            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED)
                        else:
                            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED)
                        assert clean_text(text=expected_value) not in clean_text(
                            text=current_value
                        ), f"Text '{expected_value}' not found in '{current_value}'."
                    else:
                        if clean_text(text=expected_value) in clean_text(text=current_value):
                            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED)
                        else:
                            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED)
                        assert clean_text(text=expected_value) in clean_text(
                            text=current_value
                        ), f"Text '{expected_value}' not found in '{current_value}'."
            case element_properties.VISIBILITY:
                if current_value == expected_value:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_VISIBILITY_PASSED)
                else:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_VISIBILITY_FAILED)
                assert expected_value == current_value, f"{locator} is not visible."

    def get_element_property(
        self, locator: str, property: str, by_test_id: bool = False, chain_locator: bool = False, index: int = 0
    ) -> str:
        match property:
            case element_properties.TEXT:
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
                return "".join(elem.all_text_contents()).strip()
            case element_properties.VISIBILITY:
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
            case element_properties.HREF:
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
            case element_properties.EXISTS:
                return self.ce.page.query_selector(locator) is not None

    def act(self, locator, action, value=None, exact: bool = False, index: int = 0) -> None:
        self.capture_screenshot(identifier=locator, action=f"before-{action}")
        match action.lower():
            case actions.CLICK_LINK:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator, exact=exact).nth(index)
                else:
                    elem = self.ce.page.get_by_role(aria_roles.LINK, name=locator, exact=exact).nth(index)
                elem.click()
            case actions.CLICK_BUTTON:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_role(aria_roles.BUTTON, name=locator).nth(index)
                elem.click()
            case actions.CLICK_LABEL:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
                elem.click()
            case actions.CLICK_TEXT:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_text(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_text(locator, exact=exact).nth(index)
                elem.click()
            case actions.FILL | actions.TYPE:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
                elem.click()
                if value != data_values.EMPTY:
                    elem.fill(value)
                self.capture_screenshot(identifier=locator, action=f"after-{action}")
            case actions.RADIO_BUTTON_SELECT:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
                elem.click()
                self.capture_screenshot(identifier=locator, action=f"after-{action}")
            case actions.SELECT_FILE:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
                elem.set_input_files(value)
            case actions.SELECT_FROM_LIST:
                self.act(locator=locator, action=actions.FILL, value=value)
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_role(aria_roles.OPTION, name=value)
                elem.click()
            case actions.CHECKBOX_CHECK:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_label(locator).nth(index)
                elem.check()
            case actions.CHECKBOX_UNCHECK:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
                else:
                    elem = self.ce.page.get_by_label(locator).nth(0)
                elem.uncheck()
            case actions.CLICK_LINK_INDEX_FOR_ROW:
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
            case actions.CLICK_WILDCARD:
                elem = self.ce.page.click(f"text={locator}")
            case actions.CHAIN_LOCATOR_ACTION:
                eval(f"{self.PAGE_ELEMENT_PATH}{locator}")

    def go_to_url(self, url: str) -> None:
        _full_url = f"{self.ce.service_url.replace('/start','')}{url}" if url.startswith("/") else url
        self.ce.page.goto(_full_url)

    def get_table_cell_location_for_value(self, table_locator: str, col_header: str, row_value: str):
        wait(timeout=wait_time.MED)
        table = self.ce.page.locator(table_locator)
        col_counter = 0
        for c in table.locator(html_tags.TH).all():
            if c.inner_text() == col_header:
                break
            col_counter += 1

        row_counter = 1
        for _ in range(table.locator(html_tags.TR).count()):
            row_locator = (
                table.locator(html_tags.TR).nth(row_counter).locator(html_tags.TD).nth(col_counter).inner_text()
            )
            if row_locator == row_value:
                break
            row_counter += 1
        return row_counter, col_counter

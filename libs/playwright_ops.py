import os
import re
from itertools import chain

from libs import CurrentExecution
from libs.generic_constants import (
    aria_roles,
    element_properties,
    framework_actions,
    html_tags,
    screenshot_actions,
    screenshot_file_types,
    wait_time,
)
from libs.mavis_constants import data_values
from libs.wrappers import *


class playwright_operations:
    """
    A class to handle Playwright operations for web automation.
    """

    ce = CurrentExecution()
    PAGE_ELEMENT_PATH = "self.ce.page."

    def capture_screenshot(self, identifier: str, action: str) -> None:
        """
        Capture a screenshot of the current page.

        Args:
            identifier (str): Identifier for the screenshot.
            action (str): Action performed before capturing the screenshot.
        """
        if self.ce.capture_screenshot_flag:
            self.ce.screenshot_sequence += 1
            _ss_file_name = clean_file_name(
                f"{self.ce.screenshot_sequence}-{action}-{identifier}.{screenshot_file_types.JPEG}"
            )
            _ss_path = os.path.join(
                self.ce.session_screenshots_dir,
                _ss_file_name,
            )
            self.ce.page.screenshot(path=_ss_path, type=screenshot_file_types.JPEG, full_page=True)

    def verify(self, locator: str, property: str, expected_value: str, **kwargs) -> None:
        """
        Verify a property of a web element.

        Args:
            locator (str): Locator of the element.
            property (str): Property to verify (e.g., text, visibility).
            expected_value (str): Expected value of the property.
            **kwargs: Additional options (e.g., exact match, by_test_id).
        """
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
        """
        Get a property of a web element.

        Args:
            locator (str): Locator of the element.
            property (str): Property to retrieve (e.g., text, visibility).
            **kwargs: Additional options (e.g., by_test_id, chain_locator).

        Returns:
            str: Value of the property.
        """
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
            case element_properties.ELEMENT_EXISTS:
                return self.ce.page.query_selector(locator) is not None
            case element_properties.PAGE_URL:
                return self.ce.page.url

    def act(self, locator, action, value=None, **kwargs) -> None:
        """
        Perform an action on a web element.

        Args:
            locator (str): Locator of the element.
            action (str): Action to perform (e.g., click, fill).
            value (str, optional): Value to use for the action.
            **kwargs: Additional options (e.g., exact match, index).
        """
        # Unpack keyword arguments
        exact: bool = kwargs.get("exact", False)
        index: int = kwargs.get("index", 0)
        # Act
        match action.lower():
            case framework_actions.CLICK_LINK:
                self._click_link(locator=locator, exact=exact, index=index)
            case framework_actions.CLICK_BUTTON:
                self._click_button(locator=locator, exact=exact, index=index)
            case framework_actions.CLICK_LABEL:
                self._click_label(locator=locator, exact=exact, index=index)
            case framework_actions.CLICK_TEXT:
                self._click_text(locator=locator, exact=exact, index=index)
            case framework_actions.FILL | framework_actions.TYPE:
                self._fill(locator=locator, value=value, exact=exact, index=index)
            case framework_actions.RADIO_BUTTON_SELECT:
                self._radio_button_select(locator=locator, exact=exact, index=index)
            case framework_actions.SELECT_FILE:
                self._select_file(locator=locator, value=value, exact=exact, index=index)
            case framework_actions.SELECT_FROM_LIST:
                self._select_from_list(locator=locator, value=value, index=index)
            case framework_actions.CHECKBOX_CHECK:
                self._checkbox_check(locator=locator, index=index)
            case framework_actions.CHECKBOX_UNCHECK:
                self._checkbox_uncheck(locator=locator, index=index)
            case framework_actions.CLICK_LINK_INDEX_FOR_ROW:
                self._click_index_for_row(locator=locator, value=value, index=index)
            case framework_actions.DOWNLOAD_FILE_USING_LINK:
                self._download_file_using_link(locator=locator, value=value, index=index)
            case framework_actions.DOWNLOAD_FILE_USING_BUTTON:
                self._download_file_using_button(locator=locator, value=value, index=index)
            case framework_actions.CLICK_WILDCARD:
                self.ce.page.click(f"text={locator}")
            case framework_actions.CHAIN_LOCATOR_ACTION:
                eval(f"{self.PAGE_ELEMENT_PATH}{locator}")
            case framework_actions.WAIT:
                self._wait(time_out=value)
        if locator is not None:
            self.capture_screenshot(identifier=locator, action=f"after-{action}")

    def _click_link(self, locator: str, exact: bool, index: int):
        """
        Click a link element.

        Args:
            locator (str): Locator of the link.
            exact (bool): Whether to match the link text exactly.
            index (int): Index of the link if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator, exact=exact).nth(index)
        else:
            elem = self.ce.page.get_by_role(aria_roles.LINK, name=locator, exact=exact).nth(index)
        elem.click()
        self._check_for_app_crash(locator_info=locator)

    def _click_button(self, locator: str, exact: bool, index: int):
        """
        Click a button element.

        Args:
            locator (str): Locator of the button.
            exact (bool): Whether to match the button text exactly.
            index (int): Index of the button if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_role(aria_roles.BUTTON, name=locator, exact=exact).nth(index)
        elem.click()
        self._check_for_app_crash(locator_info=locator)

    def _click_label(self, locator: str, exact: bool, index: int):
        """
        Click a label element.

        Args:
            locator (str): Locator of the label.
            exact (bool): Whether to match the label text exactly.
            index (int): Index of the label if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
        elem.click()

    def _click_text(self, locator: str, exact: bool, index: int):
        """
        Click a text element.

        Args:
            locator (str): Locator of the text.
            exact (bool): Whether to match the text exactly.
            index (int): Index of the text if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_text(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_text(locator, exact=exact).nth(index)
        elem.click()

    def _fill(self, locator: str, value: str, exact: bool, index: int):
        """
        Fill a text input field.

        Args:
            locator (str): Locator of the input field.
            value (str): Value to fill in the input field.
            exact (bool): Whether to match the input field label exactly.
            index (int): Index of the input field if multiple matches are found.
        """
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
        """
        Select a radio button.

        Args:
            locator (str): Locator of the radio button.
            exact (bool): Whether to match the radio button label exactly.
            index (int): Index of the radio button if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
        elem.click()

    def _select_file(self, locator: str, value: str, exact: bool, index: int):
        """
        Select a file for upload.

        Args:
            locator (str): Locator of the file input element.
            value (str): Path to the file to upload.
            exact (bool): Whether to match the file input label exactly.
            index (int): Index of the file input element if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator, exact=exact).nth(index)
        elem.set_input_files(value)

    def _select_from_list(self, locator: str, value: str, index: int):
        """
        Select an option from a dropdown list.

        Args:
            locator (str): Locator of the dropdown list.
            value (str): Value to select from the list.
            index (int): Index of the dropdown list if multiple matches are found.
        """
        self._fill(locator=locator, value=value, exact=False, index=index)
        self._wait(time_out=wait_time.MIN)
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_role(aria_roles.OPTION, name=value)
        elem.click()

    def _checkbox_check(self, locator: str, index: int):
        """
        Check a checkbox.

        Args:
            locator (str): Locator of the checkbox.
            index (int): Index of the checkbox if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator).nth(index)
        elem.check()

    def _checkbox_uncheck(self, locator: str, index: int):
        """
        Uncheck a checkbox.

        Args:
            locator (str): Locator of the checkbox.
            index (int): Index of the checkbox if multiple matches are found.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            elem = self.ce.page.get_by_label(locator).nth(0)
        elem.uncheck()

    def _click_index_for_row(self, locator: str, value: str, index: int):
        """
        Click a link in a specific row of a table.

        Args:
            locator (str): Locator of the table row.
            value (str): Value to identify the link in the row.
            index (int): Index of the row if multiple matches are found.
        """
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

    def _download_file_using_link(self, locator: str, value: str, index: int):
        """
        Download a file using a link.

        Args:
            locator (str): Locator of the link.
            value (str): Path to save the downloaded file.
            index (int): Index of the link if multiple matches are found.
        """
        with self.ce.page.expect_download() as download_info:
            self.act(locator=locator, action=framework_actions.CLICK_LINK, index=index)
        download = download_info.value
        download.save_as(value)
        self._check_for_app_crash(locator_info=locator)

    def _download_file_using_button(self, locator: str, value: str, index: int):
        """
        Download a file using a button.

        Args:
            locator (str): Locator of the button.
            value (str): Path to save the downloaded file.
            index (int): Index of the button if multiple matches are found.
        """
        with self.ce.page.expect_download() as download_info:
            self.act(locator=locator, action=framework_actions.CLICK_BUTTON, index=index)
        download = download_info.value
        download.save_as(value)
        self._check_for_app_crash(locator_info=locator)

    def _verify_text(self, locator: str, expected_value: str, actual_value: str, exact: bool):
        """
        Verify the text of an element.

        Args:
            locator (str): Locator of the element.
            expected_value (str): Expected text value. Prefix the text with a ! if you want to verify absence of the text.
            actual_value (str): Actual text value.
            exact (bool): Whether to match the text exactly.
        """
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
                assert _passed, f"Text '{expected_value}' not expected but found in '{actual_value}'."
            else:
                _passed: bool = True if clean_text(text=expected_value) in clean_text(text=actual_value) else False
                if _passed:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED)
                else:
                    self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED)
                assert _passed, f"Text '{expected_value}' not found in '{actual_value}'."

    def _verify_visibility(self, locator: str, expected_value: str, actual_value: str):
        """
        Verify the visibility of an element.

        Args:
            locator (str): Locator of the element.
            expected_value (str): Expected visibility state.
            actual_value (str): Actual visibility state.
        """
        _passed: bool = True if actual_value == expected_value else False
        if _passed:
            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_VISIBILITY_PASSED)
        else:
            self.capture_screenshot(identifier=locator, action=screenshot_actions.VERIFY_VISIBILITY_FAILED)
        assert _passed, f"{locator} is not visible."

    def _get_element_text(self, locator: str, index: int, by_test_id: bool, chain_locator: bool) -> str:
        """
        Get the text content of an element.

        Args:
            locator (str): Locator of the element.
            index (int): Index of the element if multiple matches are found.
            by_test_id (bool): Whether to locate the element by test ID.
            chain_locator (bool): Whether to use a chained locator.

        Returns:
            str: Text content of the element.
        """
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
        """
        Get the visibility state of an element.

        Args:
            locator (str): Locator of the element.
            index (int): Index of the element if multiple matches are found.
            chain_locator (bool): Whether to use a chained locator.

        Returns:
            str: Visibility state of the element.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.ce.page.get_by_role(_location, name=_locator).nth(index)
        else:
            if chain_locator:
                self.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
                elem = eval(f"{self.PAGE_ELEMENT_PATH}{locator}")
            else:
                elem = self.ce.page.get_by_role(locator).nth(0)
        return elem.is_visible()

    def _get_element_href(self, locator: str, index: int, chain_locator: bool) -> str:
        """
        Get the href attribute of a link element.

        Args:
            locator (str): Locator of the link element.
            index (int): Index of the link if multiple matches are found.
            chain_locator (bool): Whether to use a chained locator.

        Returns:
            str: Href attribute of the link.
        """
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

    def _wait(self, time_out: str):
        """
        Wait for a specified amount of time.

        Args:
            time_out (str): Time to wait (e.g., "1s", "1m").
        """
        _seconds = convert_time_units_to_seconds(time_unit=time_out)
        time.sleep(_seconds)

    def _check_for_app_crash(self, locator_info: str):
        """
        Check if the application has crashed.

        Args:
            locator_info (str): Information about the locator that caused the crash.
        """
        _actual_title = self.ce.page.title()
        if "Sorry, there’s a problem with the service" in _actual_title:
            self.ce.reset_environment()
            assert False, f"Application has crashed after: {locator_info}"

    def go_to_url(self, url: str) -> None:
        """
        Navigate to a specified URL.

        Args:
            url (str): URL to navigate to.
        """
        _full_url = f"{self.ce.service_url.replace('/start','')}{url}" if url.startswith("/") else url
        self.ce.page.goto(_full_url)

    def get_table_cell_location_for_value(self, table_locator: str, col_header: str, row_value: str):
        """
        Get the location of a cell in a table based on column header and row value.

        Args:
            table_locator (str): Locator of the table.
            col_header (str): Column header to search for.
            row_value (str): Row value to search for.

        Returns:
            tuple: Row and column indices of the cell.
        """
        self.act(locator=None, action=framework_actions.WAIT, value=wait_time.MED)
        table = self.ce.page.locator(table_locator)

        # Get the column index
        col_index = self._get_column_index(table, col_header)

        # Get the row index
        row_index = self._get_row_index(table, col_index, row_value)

        return row_index, col_index

    def _get_column_index(self, table, col_header: str) -> int:
        """
        Get the index of a column based on the column header.

        Args:
            table: Locator of the table.
            col_header (str): Column header to search for.

        Returns:
            int: Index of the column.
        """
        col_counter = 0
        for c in table.locator(html_tags.TH).all():
            if c.inner_text() == col_header:
                break
            col_counter += 1
        return col_counter

    def _get_row_index(self, table, col_index: int, row_value: str) -> int:
        """
        Get the index of a row based on the value in a specific column.

        Args:
            table: Locator of the table.
            col_index (int): Index of the column to search in.
            row_value (str): Row value to search for.

        Returns:
            int: Index of the row.
        """
        row_counter = 1
        for _ in range(table.locator(html_tags.TR).count()):
            row_locator = str(
                table.locator(html_tags.TR).nth(row_counter).locator(html_tags.TD).nth(col_index).inner_text()
            )
            if row_value.lower() in row_locator.lower():
                break
            row_counter += 1
        return row_counter

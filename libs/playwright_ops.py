from datetime import datetime
from pathlib import Path
import re  # noqa: F401 - used by eval
import time
from typing import Optional

import allure
from playwright.sync_api import Page

from .generic_constants import (
    actions,
    aria_roles,
    escape_characters,
    html_tags,
    properties,
    screenshot_actions,
    wait_time,
)
from mavis.test.wrappers import (
    convert_time_units_to_seconds,
    clean_text,
    clean_file_name,
)


class PlaywrightOperations:
    """
    A class to handle Playwright operations for web automation.
    """

    def __init__(self, page: Page, screenshots_path: Optional[Path]):
        self.page = page
        self.screenshots_path = screenshots_path

    def capture_screenshot(self, identifier: str, action: str) -> None:
        """
        Capture a screenshot of the current page.

        Args:
            identifier (str): Identifier for the screenshot.
            action (str): Action performed before capturing the screenshot.
        """
        if not self.screenshots_path:
            return

        file_name = clean_file_name(
            f"{datetime.now().isoformat()}-{action}-{identifier}.png"
        )

        path = self.screenshots_path / file_name

        self.page.screenshot(path=path, type="png", full_page=True)

    def verify(
        self, locator: str, property: properties, expected_value: str, **kwargs
    ) -> None:
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
            locator=locator,
            property=property,
            by_test_id=by_test_id,
            chain_locator=chain_locator,
        )
        match property:
            case properties.TEXT:
                if expected_value != "":
                    self._verify_text(
                        locator=locator,
                        expected_value=expected_value,
                        actual_value=actual_value,
                        exact=exact,
                    )
            case properties.VISIBILITY:
                self._verify_visibility(
                    locator=locator,
                    expected_value=expected_value,
                    actual_value=actual_value,
                )
            case properties.CHECKBOX_CHECKED:
                self._verify_checkbox(
                    locator=locator,
                    expected_value=expected_value,
                    actual_value=actual_value,
                )

    def get_element_property(self, locator: str, property: properties, **kwargs) -> str:
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
            case properties.TEXT:
                return self._get_element_text(
                    locator=locator,
                    index=index,
                    by_test_id=by_test_id,
                    chain_locator=chain_locator,
                )
            case properties.VISIBILITY:
                return self._get_element_visibility(
                    locator=locator, index=index, chain_locator=chain_locator
                )
            case properties.HREF:
                return self._get_element_href(
                    locator=locator, index=index, chain_locator=chain_locator
                )
            case properties.CHECKBOX_CHECKED:
                return self._get_checkbox_state(
                    locator=locator, index=index, chain_locator=chain_locator
                )
            case properties.ELEMENT_EXISTS:
                return str(self.page.query_selector(locator) is not None)
            case properties.PAGE_URL:
                return self.page.url

    def act(
        self, locator: str | None, action: actions, value: str | None = None, **kwargs
    ) -> None:
        """
        Perform an action on a web element.

        Args:
            locator (str): Locator of the element.
            action (str): Action to perform (e.g., click, fill).
            value (str, optional): Value to use for the action.
            **kwargs: Additional options (e.g., exact match, index).
        """
        # Error check
        if locator is None:
            locator = ""
        if value is None:
            value = ""
        # Unpack keyword arguments
        exact: bool = kwargs.get("exact", False)
        index: int = kwargs.get("index", 0)
        # Act
        match action:
            case actions.CLICK_LINK:
                self._click_link(locator=locator, exact=exact, index=index)
            case actions.CLICK_BUTTON:
                self._click_button(locator=locator, exact=exact, index=index)
            case actions.CLICK_LABEL:
                self._click_label(locator=locator, exact=exact, index=index)
            case actions.CLICK_TEXT:
                self._click_text(locator=locator, exact=exact, index=index)
            case actions.FILL | actions.TYPE:
                self._fill(locator=locator, value=value, exact=exact, index=index)
            case actions.RADIO_BUTTON_SELECT:
                self._radio_button_select(locator=locator, exact=exact, index=index)
            case actions.SELECT_FILE:
                self._select_file(
                    locator=locator, value=value, exact=exact, index=index
                )
            case actions.SELECT_FROM_LIST:
                self._select_from_list(locator=locator, value=value, index=index)
            case actions.CHECKBOX_CHECK:
                self._checkbox_check(locator=locator, index=index)
            case actions.CHECKBOX_UNCHECK:
                self._checkbox_uncheck(locator=locator, index=index)
            case actions.CLICK_LINK_INDEX_FOR_ROW:
                self._click_index_for_row(locator=locator, value=value, index=index)
            case actions.DOWNLOAD_FILE_USING_LINK:
                self._download_file_using_link(
                    locator=locator, value=value, index=index
                )
            case actions.DOWNLOAD_FILE_USING_BUTTON:
                self._download_file_using_button(
                    locator=locator, value=value, index=index
                )
            case actions.CLICK_WILDCARD:
                self.page.click(f"text={locator}")
            case actions.CHAIN_LOCATOR_ACTION:
                eval(f"self.page.{locator}")
            case actions.WAIT:
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
        with allure.step(title=f"Clicking [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator, exact=exact).nth(
                    index
                )
            else:
                elem = self.page.get_by_role(
                    aria_roles.LINK, name=locator, exact=exact
                ).nth(index)
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
        with allure.step(title=f"Clicking [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_role(
                    aria_roles.BUTTON, name=locator, exact=exact
                ).nth(index)
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
        with allure.step(title=f"Clicking [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_label(locator, exact=exact).nth(index)
            elem.click()

    def _click_text(self, locator: str, exact: bool, index: int):
        """
        Click a text element.

        Args:
            locator (str): Locator of the text.
            exact (bool): Whether to match the text exactly.
            index (int): Index of the text if multiple matches are found.
        """
        with allure.step(title=f"Clicking [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_text(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_text(locator, exact=exact).nth(index)
            elem.click()

    def _fill(self, locator: str, value: Optional[str], exact: bool, index: int):
        """
        Fill a text input field.

        Args:
            locator (str): Locator of the input field.
            value (str): Value to fill in the input field.
            exact (bool): Whether to match the input field label exactly.
            index (int): Index of the input field if multiple matches are found.
        """
        _allure_title_value = "***" if "password" in locator.lower() else value
        with allure.step(title=f"Typing [{_allure_title_value}] in [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_label(locator, exact=exact).nth(index)
            elem.click()

            if value:
                elem.fill(value)

    def _radio_button_select(self, locator: str, exact: bool, index: int):
        """
        Select a radio button.

        Args:
            locator (str): Locator of the radio button.
            exact (bool): Whether to match the radio button label exactly.
            index (int): Index of the radio button if multiple matches are found.
        """
        with allure.step(title=f"Selecting radio button [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_label(locator, exact=exact).nth(index)
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
        with allure.step(title=f"Uploading file [{value}] to [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_label(locator, exact=exact).nth(index)
            elem.set_input_files(value)

    def _select_from_list(self, locator: str, value: str, index: int):
        """
        Select an option from a dropdown list.

        Args:
            locator (str): Locator of the dropdown list.
            value (str): Value to select from the list.
            index (int): Index of the dropdown list if multiple matches are found.
        """
        with allure.step(title=f"Selecting [{value}] within list [{locator}]"):
            self._fill(locator=locator, value=value, exact=False, index=index)
            self._wait(time_out=wait_time.MIN)
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_role(aria_roles.OPTION, name=value)
            elem.click()

    def _checkbox_check(self, locator: str, index: int):
        """
        Check a checkbox.

        Args:
            locator (str): Locator of the checkbox.
            index (int): Index of the checkbox if multiple matches are found.
        """
        with allure.step(title=f"Ticking checkbox [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_label(locator).nth(index)
            elem.check()

    def _checkbox_uncheck(self, locator: str, index: int):
        """
        Uncheck a checkbox.

        Args:
            locator (str): Locator of the checkbox.
            index (int): Index of the checkbox if multiple matches are found.
        """
        with allure.step(title=f"Un-checking checkbox [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = self.page.get_by_label(locator).nth(0)
            elem.uncheck()

    def _click_index_for_row(self, locator: str, value: str, index: int):
        """
        Click a link in a specific row of a table.

        Args:
            locator (str): Locator of the table row.
            value (str): Value to identify the link in the row.
            index (int): Index of the row if multiple matches are found.
        """
        with allure.step(title=f"Clicking index [{index}] in table [{locator}]"):
            if escape_characters.SEPARATOR_CHAR in locator:
                _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                elem = self.page.get_by_role(_location, name=_locator).nth(index)
            else:
                elem = (
                    self.page.get_by_role(
                        aria_roles.ROW,
                        name=locator,
                    )
                    .get_by_role(aria_roles.LINK)
                    .nth(index)
                )
                elem.scroll_into_view_if_needed()
            elem.click()

    def _download_file_using_link(self, locator: str, value: str, index: int):
        """
        Download a file using a link.

        Args:
            locator (str): Locator of the link.
            value (str): Path to save the downloaded file.
            index (int): Index of the link if multiple matches are found.
        """
        with allure.step(title=f"Downloading file [{value}] from [{locator}]"):
            with self.page.expect_download() as download_info:
                self.act(locator=locator, action=actions.CLICK_LINK, index=index)
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
        with allure.step(title=f"Downloading file [{value}] from [{locator}]"):
            with self.page.expect_download() as download_info:
                self.act(locator=locator, action=actions.CLICK_BUTTON, index=index)
            download = download_info.value
            download.save_as(value)
            self._check_for_app_crash(locator_info=locator)

    def _verify_text(
        self, locator: str, expected_value: str, actual_value: str, exact: bool
    ):
        """
        Verify the text of an element.

        Args:
            locator (str): Locator of the element.
            expected_value (str): Expected text value. Prefix the text with a ! if you want to verify absence of the text.
            actual_value (str): Actual text value.
            exact (bool): Whether to match the text exactly.
        """
        with allure.step(title=f"Verifying text [{expected_value}]"):
            if expected_value.startswith(
                escape_characters.COMMENT_OPERATOR
            ):  # Skip this check
                return
            if exact:
                _passed: bool = True if expected_value == actual_value else False
                if _passed:
                    self.capture_screenshot(
                        identifier=locator, action=screenshot_actions.VERIFY_TEXT_PASSED
                    )
                else:
                    self.capture_screenshot(
                        identifier=locator, action=screenshot_actions.VERIFY_TEXT_FAILED
                    )
                assert _passed, (
                    f"Exact match failed. Expected: '{expected_value}' but actual: '{actual_value}'."
                )
            else:
                if expected_value.startswith(escape_characters.NOT_OPERATOR):
                    expected_value = expected_value.removeprefix(
                        escape_characters.NOT_OPERATOR
                    )
                    _passed: bool = (
                        True
                        if clean_text(text=expected_value)
                        not in clean_text(text=actual_value)
                        else False
                    )
                    if _passed:
                        self.capture_screenshot(
                            identifier=locator,
                            action=screenshot_actions.VERIFY_TEXT_PASSED,
                        )
                    else:
                        self.capture_screenshot(
                            identifier=locator,
                            action=screenshot_actions.VERIFY_TEXT_FAILED,
                        )
                    assert _passed, (
                        f"Text '{expected_value}' not expected but found in '{actual_value}'."
                    )
                else:
                    _passed: bool = (
                        True
                        if clean_text(text=expected_value)
                        in clean_text(text=actual_value)
                        else False
                    )
                    if _passed:
                        self.capture_screenshot(
                            identifier=locator,
                            action=screenshot_actions.VERIFY_TEXT_PASSED,
                        )
                    else:
                        self.capture_screenshot(
                            identifier=locator,
                            action=screenshot_actions.VERIFY_TEXT_FAILED,
                        )
                    assert _passed, (
                        f"Text '{expected_value}' not found in '{actual_value}'."
                    )

    def _verify_visibility(self, locator: str, expected_value: str, actual_value: str):
        """
        Verify the visibility of an element.

        Args:
            locator (str): Locator of the element.
            expected_value (str): Expected visibility state.
            actual_value (str): Actual visibility state.
        """
        with allure.step(title=f"Verifying visibility [{locator}]"):
            _passed: bool = True if actual_value == expected_value else False
            if _passed:
                self.capture_screenshot(
                    identifier=locator,
                    action=screenshot_actions.VERIFY_VISIBILITY_PASSED,
                )
            else:
                self.capture_screenshot(
                    identifier=locator,
                    action=screenshot_actions.VERIFY_VISIBILITY_FAILED,
                )
            assert _passed, f"{locator} is not visible."

    def _verify_checkbox(self, locator: str, expected_value: str, actual_value: str):
        """
        Verify the state of a checkbox.

        Args:
            locator (str): Locator of the checkbox.
            expected_value (str): Expected checked state.
            actual_value (str): Actual checked state.
        """
        with allure.step(title=f"Verifying checkbox [{locator}]"):
            _passed: bool = (
                True if bool(actual_value) == bool(expected_value) else False
            )
            _checked: str = "" if bool(actual_value) else "not"
            if _passed:
                self.capture_screenshot(
                    identifier=locator, action=screenshot_actions.VERIFY_CHECKED_PASSED
                )
            else:
                self.capture_screenshot(
                    identifier=locator, action=screenshot_actions.VERIFY_CHECKED_FAILED
                )
            assert _passed, f"{locator} is {_checked} checked."

    def _get_element_text(
        self, locator: str, index: int, by_test_id: bool, chain_locator: bool
    ) -> str:
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
            elem = self.page.get_by_test_id(locator)
        else:
            if chain_locator:
                elem = eval(f"self.page.{locator}")
            else:
                if escape_characters.SEPARATOR_CHAR in locator:
                    _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
                    elem = self.page.get_by_role(_location, name=_locator).locator(
                        aria_roles.SPAN
                    )
                else:
                    elem = self.page.get_by_role(locator).nth(index)
        elem.scroll_into_view_if_needed()
        return "".join(elem.all_text_contents()).strip()

    def _get_element_visibility(
        self, locator: str, index: int, chain_locator: bool
    ) -> str:
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
            elem = self.page.get_by_role(_location, name=_locator).nth(index)
        else:
            if chain_locator:
                self.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
                elem = eval(f"self.page.{locator}")
            else:
                elem = self.page.get_by_role(locator).nth(0)
        return elem.is_visible()

    def _get_checkbox_state(self, locator: str, index: int, chain_locator: bool) -> str:
        """
        Get the checked state of a checkbox.

        Args:
            locator (str): Locator of the checkbox.
            index (int): Index of the checkbox if multiple matches are found.
            chain_locator (bool): Whether to use a chained locator.

        Returns:
            str: Checked state of the checkbox.
        """
        if escape_characters.SEPARATOR_CHAR in locator:
            _location = locator.split(escape_characters.SEPARATOR_CHAR)[0]
            _locator = locator.split(escape_characters.SEPARATOR_CHAR)[1]
            elem = self.page.get_by_role(_location, name=_locator).nth(index)
        else:
            if chain_locator:
                self.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
                elem = eval(f"self.page.{locator}")
            else:
                elem = self.page.get_by_role(aria_roles.CHECKBOX, name=locator).nth(0)
        return elem.is_checked()

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
            elem = self.page.get_by_role(_location, name=_locator).nth(index)
        else:
            if chain_locator:
                elem = eval(f"self.page.{locator}")
            else:
                elem = self.page.get_by_role(aria_roles.LINK, name=locator).nth(index)
        return elem.get_attribute(properties.HREF.name)

    def _wait(self, time_out: str):
        """
        Wait for a specified amount of time.

        Args:
            time_out (str): Time to wait (e.g., "1s", "1m").
        """
        with allure.step(title=f"Waiting {time_out}"):
            _seconds = convert_time_units_to_seconds(time_unit=time_out)
            time.sleep(_seconds)

    def _check_for_app_crash(self, locator_info: str):
        """
        Check if the application has crashed.

        Args:
            locator_info (str): Information about the locator that caused the crash.
        """
        _actual_title = self.page.title()
        if "Sorry, there’s a problem with the service" in _actual_title:
            assert False, f"Application has crashed after: {locator_info}"

    def get_table_cell_location_for_value(
        self, table_locator: str, col_header: str, row_value: str
    ):
        """
        Get the location of a cell in a table based on column header and row value.

        Args:
            table_locator (str): Locator of the table.
            col_header (str): Column header to search for.
            row_value (str): Row value to search for.

        Returns:
            tuple: Row and column indices of the cell.
        """
        self.act(locator=None, action=actions.WAIT, value=wait_time.MED)
        table = self.page.locator(table_locator)

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
                table.locator(html_tags.TR)
                .nth(row_counter)
                .locator(html_tags.TD)
                .nth(col_index)
                .inner_text()
            )
            if row_value.lower() in row_locator.lower():
                break
            row_counter += 1
        return row_counter

import os

from libs import CurrentExecution
from libs.constants import (
    actions,
    data_values,
    object_properties,
    playwright_roles,
    screenshot_types,
)
from libs.wrappers import *


class playwright_operations:
    ce = CurrentExecution()

    def capture_screenshot(self, identifier: str, action: str) -> None:
        if self.ce.capture_screenshot_flag:
            self.ce.screenshot_sequence += 1
            _ss_path = clean_file_name(
                os.path.join(
                    self.ce.session_screenshots_dir,
                    f"{self.ce.screenshot_sequence}-{action}-{identifier}-{self.ce.current_browser_name}.{screenshot_types.JPEG}",
                )
            )
            # self.ce.page.set_viewport_size({"width": 1500, "height": 1500})
            self.ce.page.screenshot(path=_ss_path, type=screenshot_types.JPEG)

    def verify(self, locator: str, property: str, value: str, exact: bool = False, by_test_id: bool = False) -> None:
        match property.lower():
            case object_properties.TEXT:
                text = self.get_object_property(locator=locator, property=property, by_test_id=by_test_id)
                if exact:
                    if value == text:
                        self.capture_screenshot(identifier=locator, action="verify_text_passed")
                    else:
                        self.capture_screenshot(identifier=locator, action="verify_text_failed")
                    assert value == text, f"Exact match failed. Expected: '{value}' but actual: '{text}'."
                else:
                    if clean_text(text=value) in clean_text(text=text):
                        self.capture_screenshot(identifier=locator, action="verify_text_passed")
                    else:
                        self.capture_screenshot(identifier=locator, action="verify_text_failed")
                    assert clean_text(text=value) in clean_text(text=text), f"Text '{value}' not found in '{text}'."
            case object_properties.VISIBILITY:
                current_state = self.get_object_property(locator=locator, property=property, by_test_id=by_test_id)
                if current_state == value:
                    self.capture_screenshot(identifier=locator, action="verify_visibility_passed")
                else:
                    self.capture_screenshot(identifier=locator, action="verify_visibility_failed")
                assert value == current_state, f"{locator} is not visible."

    def get_object_property(self, locator: str, property: str, by_test_id: bool = False) -> str:
        match property:
            case object_properties.TEXT:
                if by_test_id:
                    elem = self.ce.page.get_by_test_id(locator)
                else:
                    elem = self.ce.page.get_by_role(locator).nth(0)
                elem.scroll_into_view_if_needed()
                return "".join(elem.all_text_contents()).strip()
            case object_properties.VISIBILITY:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_role(locator).nth(0)
                return elem.is_visible()

    def perform_action(self, locator, action, value=None) -> None:
        self.capture_screenshot(identifier=locator, action=f"before-{action}")
        match action.lower():
            case actions.CLICK_LINK:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_role(playwright_roles.LINK, name=locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.CLICK_BUTTON:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_role(playwright_roles.BUTTON, name=locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.CLICK_LABEL:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.FILL | actions.TYPE:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
                if value != data_values.EMPTY:
                    elem.fill(value)
                self.capture_screenshot(identifier=locator, action=f"after-{action}")
            case actions.RADIO_BUTTON_SELECT:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_text(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
                self.capture_screenshot(identifier=locator, action=f"after-{action}")
            case actions.SELECT_FILE:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.set_input_files(value)
            case actions.SELECT_FROM_LIST:
                self.perform_action(locator=locator, action=actions.FILL, value=value)
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_role(playwright_roles.OPTION, name=value)
                elem.click()
            case actions.CHECKBOX_CHECK:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = self.ce.page.get_by_label(locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.check()
            case actions.CLICK_LINK_INDEX_FOR_ROW:
                if escape_characters.SEPARATOR in locator:
                    _location = locator.split(escape_characters.SEPARATOR)[0]
                    _locator = locator.split(escape_characters.SEPARATOR)[1]
                    elem = self.ce.page.get_by_role(_location, name=_locator).nth(0)
                else:
                    elem = (
                        self.ce.page.get_by_role(
                            playwright_roles.ROW,
                            name=locator,
                        )
                        .get_by_role(playwright_roles.LINK)
                        .nth(value)
                    )
                elem.scroll_into_view_if_needed()
                elem.click()

import os

from playwright.sync_api import expect

from libs import CurrentExecution
from libs.constants import actions, object_properties, screenshot_types, data_values, playwright_roles


class playwright_operations:
    ce = CurrentExecution()

    def capture_screenshot(self, identifier: str, action: str) -> None:
        if self.ce.capture_screenshot_flag:
            self.ce.screenshot_sequence += 1
            _ss_path = os.path.join(
                self.ce.session_screenshots_dir,
                f"{self.ce.screenshot_sequence}-{action}-{identifier}.{screenshot_types.JPEG}",
            )
            self.ce.page.set_viewport_size({"width": 1500, "height": 1500})
            self.ce.page.screenshot(path=_ss_path, type=screenshot_types.JPEG)

    def verify(self, locator: str, property: str, value: str, by_test_id: bool = False) -> None:
        match property.lower():
            case object_properties.TEXT:
                self.capture_screenshot(identifier=locator, action="verify_text")
                text = self.get_object_property(locator=locator, property=property, by_test_id=by_test_id)
                assert value in text, f"Text '{value}' not found in '{text}'."
            case object_properties.VISIBILITY:
                self.capture_screenshot(identifier=locator, action="verify_visibility")
                current_state = self.get_object_property(locator=locator, property=property, by_test_id=by_test_id)
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
                elem = self.ce.page.get_by_role(locator).nth(0)
                return elem.is_visible()

    def perform_action(self, locator, action, value=None) -> None:
        self.capture_screenshot(identifier=locator, action=f"before-{action}")
        match action.lower():
            case actions.CLICK_LINK:
                elem = self.ce.page.get_by_role(playwright_roles.LINK, name=locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.CLICK_BUTTON:
                elem = self.ce.page.get_by_role(playwright_roles.BUTTON, name=locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.CLICK_LABEL:
                elem = self.ce.page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.FILL:
                elem = self.ce.page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
                if value != data_values.EMPTY:
                    elem.fill(value)
                self.capture_screenshot(identifier=locator, action=f"after-{action}")
            case actions.RADIO_BUTTON_SELECT:
                elem = self.ce.page.get_by_text(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
                self.capture_screenshot(identifier=locator, action=f"after-{action}")
            case actions.SELECT_FILE:
                elem = self.ce.page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.set_input_files(value)
            case actions.SELECT_FROM_LIST:
                self.perform_action(locator=locator, action=actions.FILL, value=value)
                elem = self.ce.page.get_by_role(playwright_roles.OPTION, name=value)
                elem.click()
            case actions.CHECKBOX_CHECK:
                elem = self.ce.page.get_by_label(locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.check()

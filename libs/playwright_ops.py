from playwright.sync_api import expect
from libs.constants import object_properties, actions, screenshot_types
from libs import CurrentExecution
import os


class playwright_operations:
    ce = CurrentExecution()

    def capture_screenshot(self, page, identifier: str, action: str) -> None:
        if self.ce.capture_screenshot_flag:
            self.ce.screenshot_sequence += 1
            _ss_path = os.path.join(
                self.ce.session_screenshots_dir,
                f"{self.ce.screenshot_sequence}-{action}-{identifier}.{screenshot_types.JPEG}",
            )
            page.set_viewport_size({"width": 1920, "height": 1080})
            page.screenshot(path=_ss_path, type=screenshot_types.JPEG)

    def verify(self, page, locator: str, property: str, value: str) -> None:
        match property.lower():
            case object_properties.TEXT:
                self.capture_screenshot(page=page, identifier=locator, action="verify_text")
                elem = page.get_by_role(locator).nth(0)
                elem.scroll_into_view_if_needed()
                expect(elem).to_contain_text(value)

    def perform_action(self, page, locator, action, value=None) -> None:
        self.capture_screenshot(page=page, identifier=locator, action=f"before-{action}")
        match action.lower():
            case actions.CLICK_LINK:
                elem = page.get_by_role("link", name=locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.CLICK_BUTTON:
                elem = page.get_by_role("button", name=locator).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.CLICK_LABEL:
                elem = page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
            case actions.FILL:
                elem = page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
                elem.fill(value)
                self.capture_screenshot(page=page, identifier=locator, action=f"after-{action}")
            case actions.RADIO_BUTTON_SELECT:
                elem = page.get_by_text(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.click()
                self.capture_screenshot(page=page, identifier=locator, action=f"after-{action}")
            case actions.SELECT_FILE:
                # _values = os.path.split(value)
                # _file_path = _values[0]
                # _file_name = _values[1]
                elem = page.get_by_label(locator, exact=True).nth(0)
                elem.scroll_into_view_if_needed()
                elem.set_input_files(value)

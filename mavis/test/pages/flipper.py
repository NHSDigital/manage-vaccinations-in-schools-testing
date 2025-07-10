import os
from playwright.sync_api import Page
from mavis.test.annotations import step


class FlipperPage:
    def __init__(self, page: Page):
        self.page = page

        self.additional_flags = {
            flag.lower().strip()
            for flag in os.getenv("ADDITIONAL_FEATURE_FLAGS", "").split(",")
            if flag.strip()
        }
        self.default_flags = {"api", "basic_auth", "dev_tools"}
        self.input_feature_flags = self.additional_flags | self.default_flags

        self.features_tab = self.page.get_by_role("link", name="Features")
        self.fully_enable_button = self.page.get_by_role("button", name="Fully enable")
        self.disable_button = self.page.get_by_role("button", name="Disable")

    def navigate(self):
        self.page.goto("/flipper/features")

    def set_feature_flags(self, check_only: bool = False):
        self.page.pause()
        feature_locators = self.page.query_selector_all(
            ".list-group-item.list-group-item-action"
        )

        for feature_locator in feature_locators:
            feature_name_element = feature_locator.query_selector(".text-truncate")
            if feature_name_element is not None:
                feature_name = feature_name_element.inner_text().strip()
            else:
                break

            if feature_name in self.input_feature_flags:
                # we pass the feature name to the step for better reporting
                if check_only:
                    self._check_feature_flag_enabled(feature_locator, feature_name)
                else:
                    self._ensure_feature_flag_enabled(feature_locator, feature_name)
            else:
                if check_only:
                    self._check_feature_flag_disabled(feature_locator, feature_name)
                else:
                    self._ensure_feature_flag_disabled(feature_locator, feature_name)

    @step("Ensure feature flag {2} is enabled")
    def _ensure_feature_flag_enabled(self, feature_locator, feature_name):
        self.page.pause()
        if feature_locator.query_selector('[aria-label="Off"]'):
            self.page.pause()
            feature_locator.click()
            self.fully_enable_button.click()
            self.features_tab.click()

    @step("Ensure feature flag {2} is disabled")
    def _ensure_feature_flag_disabled(self, feature_locator, feature_name):
        if feature_locator.query_selector('[aria-label="On"]'):

            def dialog_handler(dialog):
                dialog.accept(feature_name)

            self.page.on("dialog", dialog_handler)

            feature_locator.click()
            self.disable_button.click()
            self.features_tab.click()

    @step("Check feature flag {2} is still enabled")
    def _check_feature_flag_enabled(self, feature_locator, feature_name):
        assert feature_locator.query_selector('[aria-label="On"]').is_visible()

    @step("Check feature flag {2} is still disabled")
    def _check_feature_flag_disabled(self, feature_locator, feature_name):
        assert feature_locator.query_selector('[aria-label="Off"]').is_visible()

from functools import wraps

import allure


def step(title: str, attach_screenshot: bool = True):
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            with allure.step(title):
                try:
                    return_value = func(self, *args, **kwargs)
                except Exception:
                    if attach_screenshot:
                        allure.attach(
                            self.page.screenshot(),
                            name="Screenshot on failure",
                            attachment_type=allure.attachment_type.PNG,
                        )
                    raise

                coverage = kwargs.get("coverage")
                if coverage:
                    allure.attach(
                        coverage,
                        name="Coverage",
                        attachment_type=allure.attachment_type.TEXT,
                    )

                if attach_screenshot:
                    allure.attach(
                        self.page.screenshot(),
                        name="Screenshot",
                        attachment_type=allure.attachment_type.PNG,
                    )

                return return_value

        return wrapper

    return decorator

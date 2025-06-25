from functools import wraps

import allure


def step(title: str, attach_screenshot: bool = True):
    step_context = allure.step(title)

    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            return_value = func(self, *args, **kwargs)

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

        return step_context(wrapper)

    return decorator

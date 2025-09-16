import os
from functools import wraps
from io import BytesIO

import allure
from PIL import Image
from PIL.Image import Palette


def _reduce_colors(image_bytes: bytes) -> bytes:
    with BytesIO(image_bytes) as input_io:
        img = Image.open(input_io)
        img = img.convert("P", palette=Palette.ADAPTIVE, colors=32)
        output_io = BytesIO()
        img.save(output_io, format="PNG")
        return output_io.getvalue()


def _add_screenshot(page, name: str) -> None:
    screenshot_bytes = page.screenshot(full_page=True, scale="css")
    reduced_bytes = _reduce_colors(screenshot_bytes)
    allure.attach(
        reduced_bytes,
        name=name,
        attachment_type=allure.attachment_type.PNG,
    )


def step(title: str):
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            with allure.step(title):
                try:
                    return_value = func(self, *args, **kwargs)
                except Exception:
                    _add_screenshot(self.page, name="Screenshot on failure")
                    raise

                coverage = kwargs.get("coverage")
                if coverage:
                    allure.attach(
                        coverage,
                        name="Coverage",
                        attachment_type=allure.attachment_type.TEXT,
                    )

                if os.getenv("SCREENSHOT_ALL_STEPS", "false").lower() == "true":
                    _add_screenshot(self.page, name="Screenshot")

                return return_value

        return allure.step(title)(wrapper)

    return decorator


def issue(ticket_number: str):
    base_url = os.environ.get("JIRA_URL", "https://nhsd-jira.digital.nhs.uk/browse/")
    if base_url:
        full_url = f"{base_url.rstrip('/')}/{ticket_number}"
        return allure.issue(url=full_url, name=ticket_number)
    return allure.issue(ticket_number)

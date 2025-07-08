from functools import wraps

import os
import allure
from io import BytesIO
from PIL import Image
from PIL.Image import Palette


def _reduce_colors(image_bytes: bytes) -> bytes:
    with BytesIO(image_bytes) as input_io:
        img = Image.open(input_io)
        img = img.convert("P", palette=Palette.ADAPTIVE, colors=32)
        output_io = BytesIO()
        img.save(output_io, format="PNG")
        return output_io.getvalue()


def step(title: str, attach_screenshot: bool = True):
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            with allure.step(title):
                try:
                    return_value = func(self, *args, **kwargs)
                except Exception:
                    if attach_screenshot:
                        screenshot_bytes = self.page.screenshot(full_page=True)
                        reduced_bytes = _reduce_colors(screenshot_bytes)
                        allure.attach(
                            reduced_bytes,
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
                    screenshot_bytes = self.page.screenshot(full_page=True)
                    reduced_bytes = _reduce_colors(screenshot_bytes)
                    allure.attach(
                        reduced_bytes,
                        name="Screenshot",
                        attachment_type=allure.attachment_type.PNG,
                    )

                return return_value

        return allure.step(title)(wrapper)

    return decorator

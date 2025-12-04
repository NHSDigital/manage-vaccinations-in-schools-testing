from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import Vaccine
from mavis.test.pages.header_component import HeaderComponent


class VaccinesPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

    @step("Go to vaccines page")
    def navigate(self) -> None:
        self.page.goto("/vaccines")

    @step("Add batch for {1}")
    def click_add_batch(self, vaccine: Vaccine) -> None:
        self.page.get_by_role("link", name=f"Add a new {vaccine} batch").click()

    @step("Change {2} batch for {1}")
    def click_change_batch(self, vaccine: Vaccine, batch_name: str) -> None:
        name = f"Change {batch_name} batch of {vaccine}"
        self.page.get_by_role("link", name=name).click()

    @step("Archive {2} batch for {1}")
    def click_archive_batch(self, vaccine: Vaccine, batch_name: str) -> None:
        name = f"Archive {batch_name} batch of {vaccine}"
        self.page.get_by_role("link", name=name).click(force=True)

    def verify_flu_not_available(self, programmes: list[str]) -> None:
        if "flu" not in programmes:
            expect(
                self.page.get_by_role(
                    "link",
                    name="Adjuvanted Quadrivalent - aQIV (Flu)",
                ),
            ).not_to_be_visible()
            expect(
                self.page.get_by_role(
                    "link",
                    name="Cell-based Quadrivalent - QIVc (Flu)",
                ),
            ).not_to_be_visible()
            expect(
                self.page.get_by_role("link", name="Fluenz Tetra - LAIV (Flu)"),
            ).not_to_be_visible()
            expect(
                self.page.get_by_role(
                    "link",
                    name="Quadrivalent Influenza vaccine - QIVe (Flu)",
                ),
            ).not_to_be_visible()
            expect(
                self.page.get_by_role(
                    "link",
                    name="Quadrivalent Influvac sub-unit Tetra - QIVe (Flu)",
                ),
            ).not_to_be_visible()
            expect(
                self.page.get_by_role("link", name="Supemtek - QIVr (Flu)"),
            ).not_to_be_visible()
        else:
            pass

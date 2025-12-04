from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import generate_random_string


class GillickCompetencePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.assessment_notes_textbox = self.page.get_by_role(
            "textbox",
            name="Assessment notes (optional)",
        )
        self.complete_assessment_button = self.page.get_by_role(
            "button",
            name="Complete your assessment",
        )
        self.update_assessment_button = self.page.get_by_role(
            "button",
            name="Update your assessment",
        )
        self.notes_length_error = (
            page.locator("div").filter(has_text="There is a problemEnter").nth(3)
        )

    @step("Add Gillick competence details")
    def add_gillick_competence(
        self,
        *,
        is_competent: bool,
    ) -> None:
        self.__set_gillick_competence(
            new_assessment=True,
            is_competent=is_competent,
        )

    @step("Edit Gillick competence details")
    def edit_gillick_competence(
        self,
        *,
        is_competent: bool,
    ) -> None:
        self.__set_gillick_competence(
            new_assessment=False,
            is_competent=is_competent,
        )

    def __set_gillick_competence(
        self,
        *,
        new_assessment: bool,
        is_competent: bool,
    ) -> None:
        self.answer_gillick_competence_questions(is_competent=is_competent)
        competence_assessment = (
            f"Child assessed as {'' if is_competent else 'not '}Gillick competent"
        )

        self.assessment_notes_textbox.fill(competence_assessment)
        if new_assessment:
            self.click_complete_assessment()
        else:
            self.click_update_assessment()

        competence_result_locator = self.page.get_by_role(
            "heading",
            name="Gillick assessment",
        ).locator("xpath=following-sibling::*[1]")

        expect(competence_result_locator).to_contain_text(competence_assessment)

    def answer_gillick_competence_questions(self, *, is_competent: bool) -> None:
        questions = [
            "The child knows which vaccination they will have",
            "The child knows which disease the vaccination protects against",
            "The child knows what could happen if they got the disease",
            "The child knows how the vaccination will be given",
            "The child knows which side effects they might experience",
        ]
        response = "Yes" if is_competent else "No"

        for question in questions:
            self.page.get_by_role("group", name=question).get_by_label(response).check()

    @step("Click on Complete your assessment")
    def click_complete_assessment(self) -> None:
        self.complete_assessment_button.click()

    @step("Click on Update your assessment")
    def click_update_assessment(self) -> None:
        self.update_assessment_button.click()

    @step("Check notes length error appears")
    def check_notes_length_error_appears(self) -> None:
        expect(self.notes_length_error).to_be_visible()

    @step("Fill assessment notes with {1}")
    def fill_assessment_notes(self, notes: str) -> None:
        self.assessment_notes_textbox.fill(notes)

    def fill_assessment_notes_with_string_of_length(self, length: int) -> None:
        notes = generate_random_string(target_length=length, generate_spaced_words=True)
        self.fill_assessment_notes(notes)

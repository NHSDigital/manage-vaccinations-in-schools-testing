import nhs_number

from libs import CurrentExecution, file_ops
from libs.constants import escape_characters


class testdata_operations:
    fo = file_ops.file_operations()
    ce = CurrentExecution()

    def get_new_nhs_no(self, valid=True) -> str:
        return nhs_number.generate(valid=valid, for_region=nhs_number.REGION_ENGLAND, quantity=1)[0]

    def get_expected_errors(self, file_path: str) -> list[str]:
        _file_content = self.fo.get_file_text(file_path=file_path)
        return _file_content.split("\n") if _file_content is not None else None

    def clean_text(self, text: str) -> str:
        for _chr in escape_characters.UI_FORMATTING:
            text = text.replace(_chr, "")
        return text

    def clean_file_name(self, file_name: str) -> str:
        for _chr in escape_characters.FILE_NAME:
            file_name = file_name.replace(_chr, "")
        return file_name

    def split_file_paths(self, file_paths: str) -> tuple[str, str]:
        return file_paths.split("||")[0], file_paths.split("||")[1]

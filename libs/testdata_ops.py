from datetime import datetime

import nhs_number

from libs import CurrentExecution, file_ops
from libs.constants import escape_characters


class testdata_operations:
    fo = file_ops.file_operations()
    ce = CurrentExecution()

    def create_file_from_template(self, template_path: str) -> str:
        _template_text = self.fo.get_file_text(file_path=template_path)
        _file_text = []
        for _ln in _template_text:
            _ln = _ln.replace("<<NHS_NO>>", self.get_new_nhs_no())
            _ln = _ln.replace("<<FNAME>>", f"F{self.get_new_datetime()}")
            _ln = _ln.replace("<<LNAME>>", f"L{self.get_new_datetime()}")
            _file_text.append(_ln)
        return self.fo.create_file(content=_file_text)

    def get_new_nhs_no(self, valid=True) -> str:
        return nhs_number.generate(valid=valid, for_region=nhs_number.REGION_ENGLAND, quantity=1)[0]

    def get_new_datetime(self) -> str:
        return datetime.now().strftime("%Y%m%d%H%M%S")

    def get_expected_errors(self, file_path: str) -> list[str]:
        _file_content = self.fo.get_file_text(file_path=file_path)
        return _file_content.split("\n") if _file_content is not None else None

    def clean_text(self, text: str) -> str:
        for _chr in escape_characters.FORMATTING:
            text = text.replace(_chr, "")
        return text

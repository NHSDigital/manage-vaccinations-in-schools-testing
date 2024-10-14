from libs import file_ops
from libs import CurrentExecution
from datetime import datetime
import nhs_number


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
        return self.fo.get_file_text(file_path=file_path)

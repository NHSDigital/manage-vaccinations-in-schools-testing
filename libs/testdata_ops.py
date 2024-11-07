import nhs_number
import pandas as pd

from libs import CurrentExecution, file_ops
from libs.constants import data_values, escape_characters
from libs.wrappers import *


class testdata_operations:
    fo = file_ops.file_operations()
    ce = CurrentExecution()

    def create_file_from_template(self, template_path: str) -> str:
        _template_text = self.fo.get_file_text(file_path=template_path)
        _file_text = []
        _ctr = 0
        for _ln in _template_text.split(escape_characters.NEW_LINE):
            _ln = _ln.replace("<<NHS_NO>>", f"9{self.get_new_nhs_no(valid=True)[:9]}")
            _ln = _ln.replace("<<INVALID_NHS_NO>>", self.get_new_nhs_no(valid=False))
            _ln = _ln.replace("<<FNAME>>", f"F{get_new_datetime()}{_ctr}")
            _ln = _ln.replace("<<LNAME>>", f"L{get_new_datetime()}{_ctr}")
            _file_text.append(_ln)
            _ctr += 1
        return self.fo.create_file(content=escape_characters.NEW_LINE.join(_file_text))

    def get_new_nhs_no(self, valid=True) -> str:
        return nhs_number.generate(valid=valid, for_region=nhs_number.REGION_ENGLAND, quantity=1)[0]

    def get_expected_errors(self, file_path: str) -> list[str]:
        _file_content = self.fo.get_file_text(file_path=file_path)
        return _file_content.split("\n") if _file_content is not None else None

    def read_spreadsheet(self, file_path: str) -> pd.DataFrame:
        _df = self.fo.read_excel_to_df(file_path=file_path)
        return self.clean_df(df=_df)

    def clean_df(self, df: pd.DataFrame) -> pd.DataFrame:
        pd.set_option("future.no_silent_downcasting", True)
        _df = df.fillna(value="0", inplace=False)
        _df.replace(to_replace="True", value="true", inplace=True)
        _df.replace(to_replace="False", value="false", inplace=True)
        _df.replace(to_replace="null", value=data_values.EMPTY, inplace=True)
        _df.replace(to_replace="None", value=data_values.EMPTY, inplace=True)
        _df.replace(to_replace="NaN", value=data_values.EMPTY, inplace=True)
        _df.replace(to_replace="0", value=data_values.EMPTY, inplace=True)
        _df.replace(to_replace="", value=data_values.EMPTY, inplace=True)
        return _df

    def split_file_paths(self, file_paths: str) -> tuple[str, str]:
        _input_file_path = self.create_file_from_template(
            template_path=file_paths.split(escape_characters.SEPARATOR)[0]
        )
        _output_file_path = file_paths.split(escape_characters.SEPARATOR)[1]
        return _input_file_path, _output_file_path

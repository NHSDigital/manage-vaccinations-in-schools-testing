import nhs_number
import pandas as pd

from libs import CurrentExecution, file_ops
from libs.constants import data_values, escape_characters
from libs.wrappers import *


class testdata_operations:
    fo = file_ops.file_operations()
    ce = CurrentExecution()

    def __init__(self):
        self.mapping_df: pd.DataFrame = self.fo.read_csv_to_df(file_path="test_data/file_mapping.csv")

    def create_file_from_template(self, template_path: str, file_name_prefix: str) -> str:
        _template_text = self.fo.get_file_text(file_path=template_path)
        _file_text = []
        _ctr = -1
        _dt = get_new_datetime()
        _hist_dt = get_offset_date(offset_days=-730)
        if _template_text is not None:
            for _ln in _template_text.split(escape_characters.NEW_LINE):
                _ln = _ln.replace("<<NHS_NO>>", f"9{self.get_new_nhs_no(valid=True)[:9]}")
                _ln = _ln.replace("<<INVALID_NHS_NO>>", self.get_new_nhs_no(valid=False))
                _ln = _ln.replace("<<FNAME>>", f"F{_dt}{_ctr}")
                _ln = _ln.replace("<<LNAME>>", f"L{_dt}{_ctr}")
                _ln = _ln.replace("<<VACCS_DATE>>", _dt[:8])
                _ln = _ln.replace("<<HIST_VACCS_DATE>>", _hist_dt)
                _file_text.append(_ln)
                _ctr += 1
        return self.fo.create_file(
            content=escape_characters.NEW_LINE.join(_file_text), file_name_prefix=file_name_prefix
        )

    def get_new_nhs_no(self, valid=True) -> str:
        return nhs_number.generate(valid=valid, for_region=nhs_number.REGION_ENGLAND, quantity=1)[0]

    def get_expected_errors(self, file_path: str) -> list[str]:
        _file_content = self.fo.get_file_text(file_path=file_path)
        return _file_content.split(escape_characters.NEW_LINE) if _file_content is not None else None

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

    def get_file_paths(self, file_paths: str) -> tuple[str, str]:
        _input_template_path: str = self.mapping_df.query("ID==@file_paths")["INPUT_TEMPLATE"].to_string(index=False)
        _output_template_path: str = self.mapping_df.query("ID==@file_paths")["OUTPUT_TEMPLATE"].to_string(index=False)
        _file_prefix: str = self.mapping_df.query("ID==@file_paths")["FILE_PREFIX"].to_string(index=False)
        _input_file_path: str = self.create_file_from_template(
            template_path=_input_template_path, file_name_prefix=_file_prefix
        )
        return _input_file_path, _output_template_path

    def create_child_list_from_file(self, file_path: str):
        if "positive" in file_path.lower():
            _file_df = self.fo.read_csv_to_df(file_path=file_path)
            _child_list = _file_df[["CHILD_FIRST_NAME", "CHILD_LAST_NAME"]]
            return _child_list["CHILD_FIRST_NAME"] + " " + _child_list["CHILD_LAST_NAME"].values.tolist()
        else:
            return None

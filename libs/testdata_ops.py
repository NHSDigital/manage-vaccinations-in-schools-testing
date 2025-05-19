import nhs_number
import pandas as pd

from libs import CurrentExecution, file_ops
from libs.generic_constants import escape_characters
from libs.mavis_constants import mavis_file_types, test_data_values
from libs.wrappers import *


class testdata_operations:
    """
    A class to handle operations related to test data.
    """

    fo = file_ops.file_operations()
    ce = CurrentExecution()

    def __init__(self):
        """
        Initialize the testdata_operations class.
        """
        self.mapping_df: pd.DataFrame = self.fo.read_csv_to_df(file_path="test_data/file_mapping.csv")

    def create_file_from_template(self, template_path: str, file_name_prefix: str) -> str:
        """
        Create a file from a template while replacing placeholders with calculated values.

        Args:
            template_path (str): Path to the template file.
            file_name_prefix (str): Prefix for the generated file name.

        Returns:
            str: Path to the created file.
        """
        _template_text = self.fo.get_file_text(file_path=template_path)
        _file_text = []
        _ctr = 0
        _dt = get_current_datetime()
        _hist_dt = get_offset_date(offset_days=-(365 * 2))
        _session_id = self.ce.get_session_id()
        if _template_text is not None:
            for _ln in _template_text.split(escape_characters.NEW_LINE):
                _ln = _ln.replace("<<SCHOOL_1_NAME>>", test_data_values.SCHOOL_1_NAME)
                _ln = _ln.replace("<<SCHOOL_2_NAME>>", test_data_values.SCHOOL_2_NAME)
                _ln = _ln.replace("<<SCHOOL_1_URN>>", test_data_values.SCHOOL_1_URN)
                _ln = _ln.replace("<<ORG_CODE>>", test_data_values.ORG_CODE)
                _ln = _ln.replace("<<NHS_NO>>", self.get_new_nhs_no(valid=True))
                _ln = _ln.replace("<<INVALID_NHS_NO>>", self.get_new_nhs_no(valid=False))
                _ln = _ln.replace("<<FNAME>>", f"F{_dt}{_ctr}")
                _ln = _ln.replace("<<LNAME>>", f"L{_dt}{_ctr}")
                _ln = _ln.replace("<<VACCS_DATE>>", _dt[:8])
                _ln = _ln.replace("<<VACCS_TIME>>", get_current_time())
                _ln = _ln.replace("<<HIST_VACCS_DATE>>", _hist_dt)
                _ln = _ln.replace("<<DOB_YEAR_8>>", get_dob_from_year(year_group=child_year_group.YEAR_8))
                _ln = _ln.replace("<<DOB_YEAR_9>>", get_dob_from_year(year_group=child_year_group.YEAR_9))
                _ln = _ln.replace("<<DOB_YEAR_10>>", get_dob_from_year(year_group=child_year_group.YEAR_10))
                _ln = _ln.replace("<<DOB_YEAR_11>>", get_dob_from_year(year_group=child_year_group.YEAR_11))
                _ln = _ln.replace("<<SESSION_ID>>", _session_id)
                _file_text.append(_ln)
                _ctr += 1
        self.ce.set_file_record_count(record_count=_ctr)
        return self.fo.create_file(
            content=escape_characters.NEW_LINE.join(_file_text), file_name_prefix=file_name_prefix
        )

    def get_new_nhs_no(self, valid=True) -> str:
        """
        Generate a new NHS number.

        Args:
            valid (bool, optional): Whether to generate a valid NHS number. Defaults to True.

        Returns:
            str: Generated NHS number.
        """
        return nhs_number.generate(valid=valid, for_region=nhs_number.REGION_ENGLAND, quantity=1)[0]

    def get_expected_errors(self, file_path: str):
        """
        Get expected errors from a file.

        Args:
            file_path (str): Path to the file.

        Returns:
            list[str]: List of expected errors.
        """
        _file_content = self.fo.get_file_text(file_path=file_path)
        return _file_content.split(escape_characters.NEW_LINE) if _file_content is not None else None

    def read_spreadsheet(self, file_path: str, clean_df: bool = True, sheet_name: str = "Sheet1") -> pd.DataFrame:
        """
        Read a spreadsheet into a DataFrame.

        Args:
            file_path (str): Path to the spreadsheet file.
            clean_df (bool, optional): Whether to clean the DataFrame. Defaults to True.
            sheet_name (str, optional): Name of the sheet to read. Defaults to "Sheet1".

        Returns:
            pd.DataFrame: DataFrame containing the spreadsheet data.
        """
        _df = self.fo.read_excel_to_df(file_path=file_path, sheet_name=sheet_name)
        return self.clean_df(df=_df) if clean_df else _df

    def clean_df(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean a DataFrame by replacing unwanted values.

        Args:
            df (pd.DataFrame): DataFrame to clean.

        Returns:
            pd.DataFrame: Cleaned DataFrame.
        """
        pd.set_option("future.no_silent_downcasting", True)
        _df = df.fillna(value="0", inplace=False)
        _df.replace(to_replace="True", value="true", inplace=True)
        _df.replace(to_replace="False", value="false", inplace=True)
        _df.replace(to_replace="null", value=test_data_values.EMPTY, inplace=True)
        _df.replace(to_replace="None", value=test_data_values.EMPTY, inplace=True)
        _df.replace(to_replace="NaN", value=test_data_values.EMPTY, inplace=True)
        _df.replace(to_replace="0", value=test_data_values.EMPTY, inplace=True)
        _df.replace(to_replace="", value=test_data_values.EMPTY, inplace=True)
        return _df

    def get_file_paths(self, file_paths: str) -> tuple[str, str]:
        """
        Get input and output file paths based on a mapping.

        Args:
            file_paths (str): Identifier for the file paths.

        Returns:
            tuple[str, str]: Input and output file paths.
        """
        _input_template_path: str = self.mapping_df.query("ID==@file_paths")["INPUT_TEMPLATE"].to_string(index=False)
        _output_template_path: str = self.mapping_df.query("ID==@file_paths")["OUTPUT_TEMPLATE"].to_string(index=False)
        _file_prefix: str = self.mapping_df.query("ID==@file_paths")["FILE_PREFIX"].to_string(index=False)
        _input_file_path: str = self.create_file_from_template(
            template_path=_input_template_path, file_name_prefix=_file_prefix
        )
        return _input_file_path, _output_template_path

    def create_child_list_from_file(self, file_path: str, file_type: mavis_file_types):
        """
        Create a list of child names from a file.

        Args:
            file_path (str): Path to the file.
            file_type (mavis_file_types): Type of file

        Returns:
            list: List of child names.
        """
        _file_df = self.fo.read_csv_to_df(file_path=file_path)
        match file_type:
            case mavis_file_types.CHILD_LIST | mavis_file_types.COHORT | mavis_file_types.CLASS_LIST:
                _cols = ["CHILD_LAST_NAME", "CHILD_FIRST_NAME"]
            case mavis_file_types.VACCS_MAVIS:
                _cols = ["PERSON_SURNAME", "PERSON_FORENAME"]
            case mavis_file_types.VACCS_SYSTMONE:
                _cols = ["Surname", "First name"]
        _names_list = _file_df[_cols[0]] + ", " + _file_df[_cols[1]].values.tolist()
        return _names_list

    def get_session_id(self, excel_path: str) -> str:
        """
        Get the session ID from an Excel file.

        Args:
            excel_path (str): Path to the Excel file.

        Returns:
            str: Session ID.
        """
        _df = self.read_spreadsheet(file_path=excel_path, clean_df=False, sheet_name="Vaccinations")
        return _df["SESSION_ID"].iloc[0]

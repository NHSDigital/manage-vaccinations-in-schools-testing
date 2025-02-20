import os
from os import path

import pandas as pd

from libs.generic_constants import file_mode
from libs.wrappers import *


class file_operations:
    def create_dir(self, dir_path: str) -> bool:
        if not self.check_if_path_exists(file_or_folder_path=dir_path):
            os.makedirs(name=dir_path)
        return self.check_if_path_exists(file_or_folder_path=dir_path)

    def check_if_path_exists(self, file_or_folder_path: str) -> bool:
        return True if path.exists(path=file_or_folder_path) else False

    def get_file_text(self, file_path: str) -> str:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            with open(file=file_path, mode=file_mode.READ) as f:
                return f.read()

    def read_csv_to_df(self, file_path: str) -> pd.DataFrame:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            return pd.read_csv(filepath_or_buffer=file_path)

    def read_excel_to_df(self, file_path: str) -> pd.DataFrame:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            return pd.read_excel(file_path, sheet_name="Sheet1", header=0, dtype="str", index_col=0)

    def create_file(self, content: str, file_name_prefix: str = "") -> str:
        _file_name = f"working/{file_name_prefix}{get_current_datetime()}.csv"
        with open(file=_file_name, mode=file_mode.WRITE) as f:
            f.writelines(content)
        return _file_name

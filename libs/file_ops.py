import os
from os import path

import pandas as pd

from libs.constants import file_mode


class file_operations:

    def check_if_path_exists(self, file_or_folder_path: str) -> bool:
        return True if path.exists(path=file_or_folder_path) else False

    def create_dir(self, dir_path: str) -> bool:
        if not self.check_if_path_exists(file_or_folder_path=dir_path):
            os.makedirs(name=dir_path)
        return self.check_if_path_exists(file_or_folder_path=dir_path)

    def get_file_text(self, file_path: str) -> str:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            with open(file=file_path, mode=file_mode.READ) as f:
                _text = f.read()
            return _text

    def read_csv_to_df(self, file_path: str) -> pd.DataFrame:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            return pd.read_csv(filepath_or_buffer=file_path)

    def read_excel_to_df(self, file_path: str) -> pd.DataFrame:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            _df = pd.read_excel(file_path, sheet_name="Sheet1", header=0, dtype="str", index_col=None)
            _df.replace(to_replace="null", value="", inplace=True)
            _df.replace(to_replace="True", value="true", inplace=True)
            _df.replace(to_replace="False", value="false", inplace=True)
            _df.replace(to_replace="None", value="", inplace=True)
            _df.replace(to_replace="NaN", value="", inplace=True)
            _df.replace(to_replace="", value="<empty>", inplace=True)
            _df.fillna(value="<empty>", inplace=True)
            return _df

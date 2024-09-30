import os
from os import path
from libs.constants import file_mode
import pandas as pd


class file_operations:

    def check_if_path_exists(self, file_or_folder_path: str) -> bool:
        return True if path.exists(path=file_or_folder_path) else False

    def create_dir(self, dir_path: str) -> bool:
        if not self.check_if_path_exists(file_or_folder_path=dir_path):
            os.makedirs(name=dir_path)
        return self.check_if_path_exists(file_or_folder_path=dir_path)

    def get_file_text(self, file_path: str) -> list[str]:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            with open(file=file_path, mode=file_mode.READ) as f:
                _text = f.readlines()
            return _text

    def create_file(self, content: str) -> str:
        from libs import testdata_ops

        _dt = testdata_ops.testdata_operations().get_new_datetime()
        _file_name = f"working/{_dt}.csv"
        with open(file=_file_name, mode=file_mode.WRITE) as f:
            f.writelines(content)
        return _file_name

    def read_file_to_df(self, file_path: str) -> pd.DataFrame:
        if self.check_if_path_exists(file_or_folder_path=file_path):
            return pd.read_csv(filepath_or_buffer=file_path)

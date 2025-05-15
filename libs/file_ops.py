import os
from os import path

import pandas as pd

from libs.generic_constants import file_mode
from libs.wrappers import *


class file_operations:
    """
    A class to handle file operations such as reading, writing, and directory management.
    """

    def create_dir(self, dir_path: str) -> bool:
        """
        Create a directory if it does not exist.

        Args:
            dir_path (str): Path to the directory.

        Returns:
            bool: True if the directory exists or was created successfully, False otherwise.
        """
        if not self.check_if_path_exists(file_or_folder_path=dir_path):
            os.makedirs(name=dir_path)
        return self.check_if_path_exists(file_or_folder_path=dir_path)

    def check_if_path_exists(self, file_or_folder_path: str) -> bool:
        """
        Check if a file or folder path exists.

        Args:
            file_or_folder_path (str): Path to check.

        Returns:
            bool: True if the path exists, False otherwise.
        """
        return True if path.exists(path=file_or_folder_path) else False

    def get_file_text(self, file_path: str) -> str:
        """
        Get the text content of a file.

        Args:
            file_path (str): Path to the file.

        Returns:
            str: Text content of the file.
        """
        if self.check_if_path_exists(file_or_folder_path=file_path):
            with open(file=file_path, mode=file_mode.READ, encoding="utf-8") as f:
                return f.read()
        else:
            assert False, f"Cannot read file.  File not found: {file_path}"

    def read_csv_to_df(self, file_path: str) -> pd.DataFrame:
        """
        Read a CSV file into a DataFrame.

        Args:
            file_path (str): Path to the CSV file.

        Returns:
            pd.DataFrame: DataFrame containing the CSV data.
        """
        if self.check_if_path_exists(file_or_folder_path=file_path):
            return pd.read_csv(filepath_or_buffer=file_path)
        else:
            assert False, f"Cannot read CSV file.  File not found: {file_path}"

    def read_excel_to_df(self, file_path: str, sheet_name: str) -> pd.DataFrame:
        """
        Read an Excel file into a DataFrame.

        Args:
            file_path (str): Path to the Excel file.
            sheet_name (str): Name of the sheet to read.

        Returns:
            pd.DataFrame: DataFrame containing the Excel data.
        """
        if self.check_if_path_exists(file_or_folder_path=file_path):
            return pd.read_excel(file_path, sheet_name=sheet_name, header=0, dtype="str", index_col=0)
        else:
            assert False, f"Cannot read excel file.  File not found: {file_path}"

    def create_file(self, content: str, file_name_prefix: str = "") -> str:
        """
        Create a file with the specified content.

        Args:
            content (str): Content to write to the file.
            file_name_prefix (str, optional): Prefix for the file name. Defaults to "".

        Returns:
            str: Path to the created file.
        """
        _file_name = f"working/{file_name_prefix}{get_current_datetime()}.csv"
        with open(file=_file_name, mode=file_mode.WRITE, encoding="utf-8") as f:
            f.writelines(content)
        return _file_name

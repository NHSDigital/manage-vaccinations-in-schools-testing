import os
from os import path


class file_operations:

    def check_if_path_exists(self, file_or_folder_path: str) -> bool:
        return True if path.exists(path=file_or_folder_path) else False

    def create_dir(self, dir_path: str) -> bool:
        if not self.check_if_path_exists(file_or_folder_path=dir_path):
            os.makedirs(name=dir_path)
        return self.check_if_path_exists(file_or_folder_path=dir_path)

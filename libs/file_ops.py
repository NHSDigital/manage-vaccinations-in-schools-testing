from os import path


class file_operations:

    def check_if_path_exists(self, file_or_folder_path: str) -> bool:
        return True if path.exists(path=file_or_folder_path) else False

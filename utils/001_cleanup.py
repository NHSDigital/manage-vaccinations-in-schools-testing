import os

#  This script is designed to be run manually to clear down the 'working', 'reports' and 'screenshots' directories.
folders_to_clean = ["working", "screenshots"]  # "reports"


def cleanup() -> None:
    for _folder in folders_to_clean:
        _all_files = os.listdir(_folder)
        for _file in _all_files:
            if _file != ".gitkeep":
                os.remove(os.path.join(_folder, _file))


if __name__ == "__main__":
    cleanup()

import os
import shutil

#  This script is designed to be run manually to clear down directories.
folders_to_clean = ["working", "allure-results"]


def cleanup() -> None:
    for entry in os.listdir("."):
        for folder in folders_to_clean:
            if entry.startswith(folder) and os.path.isdir(entry):
                shutil.rmtree(entry)


if __name__ == "__main__":
    cleanup()

import os

#  This script is to be used manually before any commits in new code to avoid committing any reports or working files.
folders_to_clean = ["working", "reports", "screenshots"]


def cleanup() -> None:
    for _folder in folders_to_clean:
        _all_files = os.listdir(_folder)
        for _file in _all_files:
            if _file != ".gitkeep":
                os.remove(os.path.join(_folder, _file))


if __name__ == "__main__":
    cleanup()

from playwright.sync_api import Browser, Page


class CurrentExecution:
    page: Page = None
    browser: Browser = None
    file_record_count: int = 0
    session_id: str = ""

    @classmethod
    def set_file_record_count(cls, record_count: int):
        cls.file_record_count = record_count

    @classmethod
    def get_file_record_count(cls) -> int:
        return cls.file_record_count

    @classmethod
    def set_session_id(cls, session_id: str):
        cls.session_id = session_id

    @classmethod
    def get_session_id(cls) -> str:
        return cls.session_id

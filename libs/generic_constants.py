from enum import Enum, auto
from typing import Final


class properties(Enum):
    TEXT = auto()
    VISIBILITY = auto()
    HREF = auto()
    ELEMENT_EXISTS = auto()
    PAGE_URL = auto()
    CHECKBOX_CHECKED = auto()


class actions(Enum):
    CLICK_LINK = auto()
    CLICK_BUTTON = auto()
    CLICK_LABEL = auto()
    CLICK_TEXT = auto()
    FILL = auto()
    TYPE = auto()
    RADIO_BUTTON_SELECT = auto()
    SELECT_FILE = auto()
    SELECT_FROM_LIST = auto()
    CHECKBOX_CHECK = auto()
    CHECKBOX_UNCHECK = auto()
    CLICK_LINK_INDEX_FOR_ROW = auto()
    CLICK_WILDCARD = auto()
    CHAIN_LOCATOR_ACTION = auto()
    DOWNLOAD_FILE_USING_LINK = auto()
    DOWNLOAD_FILE_USING_BUTTON = auto()
    WAIT = auto()


class screenshot_actions:
    VERIFY_TEXT_PASSED: Final[str] = "verify_text_passed"
    VERIFY_TEXT_FAILED: Final[str] = "verify_text_failed"
    VERIFY_VISIBILITY_PASSED: Final[str] = "verify_visibility_passed"
    VERIFY_VISIBILITY_FAILED: Final[str] = "verify_visibility_failed"
    VERIFY_CHECKED_PASSED: Final[str] = "verify_checked_passed"
    VERIFY_CHECKED_FAILED: Final[str] = "verify_checked_failed"


class screenshot_file_types:
    JPEG: Final[str] = "jpeg"


class aria_roles:
    LINK: Final[str] = "link"
    BUTTON: Final[str] = "button"
    OPTION: Final[str] = "option"
    ROW: Final[str] = "row"
    SPAN: Final[str] = "span"
    CELL: Final[str] = "cell"
    CHECKBOX: Final[str] = "checkbox"


class html_tags:
    TH: Final[str] = "th"
    TABLE: Final[str] = "table"
    TR: Final[str] = "tr"
    TD: Final[str] = "td"


class wait_time:
    MIN: Final[str] = "1s"
    MED: Final[str] = "10s"
    MAX: Final[str] = "30s"


class escape_characters:
    SEPARATOR_CHAR: Final[str] = "||"  # Used only in code
    COMMENT_OPERATOR: Final[str] = "#"  # Used only in code
    NOT_OPERATOR: Final[str] = "!"  # Used only in code
    SPACE: Final[str] = " "
    NEW_LINE: Final[str] = "\n"
    CARRIAGE_RETURN: Final[str] = "\r"
    NEW_LINE_CARRIAGE_RETURN: Final[str] = "\r\n"
    SINGLE_QUOTE_OPEN_UNICODE: Final[str] = "â€™"
    SINGLE_QUOTE_CLOSE_UNICODE: Final[str] = "â€˜"
    SINGLE_QUOTE_OPEN: Final[str] = "‘"
    SINGLE_QUOTE_CLOSE: Final[str] = "’"
    TAB: Final[str] = "\t"
    COLON: Final[str] = ":"
    BACKSLASH: Final[str] = "\\"
    STROKE: Final[str] = "/"
    DOUBLE_QUOTE: Final[str] = '"'
    LESS_THAN: Final[str] = "<"
    GREATER_THAN: Final[str] = ">"
    PIPE: Final[str] = "|"
    ASTERISK: Final[str] = "*"
    QUESTION_MARK: Final[str] = "?"
    COMMA: Final[str] = ","
    NBSP: Final[str] = " "
    ZWJ: Final[str] = "‍"
    UI_FORMATTING: Final[list[str]] = [
        NBSP,
        ZWJ,
        SPACE,
        TAB,
        NEW_LINE,
        CARRIAGE_RETURN,
        NEW_LINE_CARRIAGE_RETURN,
        SINGLE_QUOTE_OPEN_UNICODE,
        SINGLE_QUOTE_OPEN,
        SINGLE_QUOTE_CLOSE_UNICODE,
        SINGLE_QUOTE_CLOSE,
    ]
    FILE_NAME: Final[list[str]] = [
        SEPARATOR_CHAR,
        COLON,
        DOUBLE_QUOTE,
        LESS_THAN,
        GREATER_THAN,
        PIPE,
        ASTERISK,
        QUESTION_MARK,
        NEW_LINE,
        CARRIAGE_RETURN,
        NEW_LINE_CARRIAGE_RETURN,
        STROKE,
        BACKSLASH,
    ]


class file_encoding:
    ASCII: Final[str] = "ascii"


class audit_log_paths:
    TEST_LEVEL_LOG: Final[str] = "logs/test_level.log"

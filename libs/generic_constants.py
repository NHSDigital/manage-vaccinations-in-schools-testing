from typing import Final


class fixture_scope:
    SESSION: Final[str] = "session"
    FUNCTION: Final[str] = "function"


class element_properties:
    TEXT: Final[str] = "text"
    VISIBILITY: Final[str] = "visibility"
    HREF: Final[str] = "href"
    EXISTS: Final[str] = "exists"
    PAGE_URL: Final[str] = "page_url"


class element_actions:
    CLICK_LINK: Final[str] = "click_link"
    CLICK_BUTTON: Final[str] = "click_button"
    CLICK_LABEL: Final[str] = "click_label"
    CLICK_TEXT: Final[str] = "click_text"
    FILL: Final[str] = "fill"
    TYPE: Final[str] = "type"
    RADIO_BUTTON_SELECT: Final[str] = "radio_select"
    SELECT_FILE: Final[str] = "select_file"
    SELECT_FROM_LIST: Final[str] = "select_from_list"
    CHECKBOX_CHECK: Final[str] = "checkbox_check"
    CHECKBOX_UNCHECK: Final[str] = "checkbox_uncheck"
    CLICK_LINK_INDEX_FOR_ROW: Final[str] = "click_link_index_for_row"
    CLICK_WILDCARD: Final[str] = "click_wildcard"
    CHAIN_LOCATOR_ACTION: Final[str] = "chain_locator"
    DOWNLOAD_FILE: Final[str] = "download_file"
    WAIT: Final[str] = "wait"


class screenshot_actions:
    VERIFY_TEXT_PASSED: Final[str] = "verify_text_passed"
    VERIFY_TEXT_FAILED: Final[str] = "verify_text_failed"
    VERIFY_VISIBILITY_PASSED: Final[str] = "verify_visibility_passed"
    VERIFY_VISIBILITY_FAILED: Final[str] = "verify_visibility_failed"


class screenshot_file_types:
    JPEG: Final[str] = "jpeg"


class file_mode:
    READ: Final[str] = "r"
    WRITE: Final[str] = "w"
    APPEND: Final[str] = "a"


class api_response_codes:
    SUCCESS_STATUS_CODE_MIN: Final[int] = 200
    SUCCESS_STATUS_CODE_MAX: Final[int] = 299


class aria_roles:
    LINK: Final[str] = "link"
    BUTTON: Final[str] = "button"
    OPTION: Final[str] = "option"
    ROW: Final[str] = "row"
    SPAN: Final[str] = "span"
    CELL: Final[str] = "cell"


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
    UI_FORMATTING: Final[list[str]] = [
        SPACE,
        NEW_LINE,
        CARRIAGE_RETURN,
        NEW_LINE_CARRIAGE_RETURN,
        SINGLE_QUOTE_OPEN_UNICODE,
        SINGLE_QUOTE_OPEN,
        SINGLE_QUOTE_CLOSE_UNICODE,
        SINGLE_QUOTE_CLOSE,
        TAB,
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
    ]


class file_encoding:
    ASCII: Final[str] = "ascii"

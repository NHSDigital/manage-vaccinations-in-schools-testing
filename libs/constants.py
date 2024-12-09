from typing import Final


class object_properties:
    TEXT: Final[str] = "text"
    VISIBILITY: Final[str] = "visibility"
    HREF: Final[str] = "href"


class actions:
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
    CLICK_LINK_INDEX_FOR_ROW: Final[str] = "click_link_index_for_row"
    CLICK_WILDCARD: Final[str] = "click_wildcard"
    CHAIN_LOCATOR_ACTION: Final[str] = "chain_locator"


class screenshot_types:
    JPEG: Final[str] = "jpeg"


class file_mode:
    READ: Final[str] = "r"
    WRITE: Final[str] = "w"
    APPEND: Final[str] = "a"


class api_constants:
    API_SUCCESS_STATUS_CODE_MIN: Final[int] = 200
    API_SUCCESS_STATUS_CODE_MAX: Final[int] = 299


class data_values:
    EMPTY: Final[str] = "<empty>"


class playwright_roles:
    LINK: Final[str] = "link"
    BUTTON: Final[str] = "button"
    OPTION: Final[str] = "option"
    ROW: Final[str] = "row"


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
    UI_FORMATTING: Final[str] = [
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
    FILE_NAME: Final[str] = [
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


class test_data_file_paths:
    PARENTAL_CONSENT: Final[str] = "test_data/ParentalConsent.xlsx"
    VACCS_HPV_POSITIVE: Final[str] = "VACCS_HPV_POSITIVE"
    VACCS_HPV_NEGATIVE: Final[str] = "VACCS_HPV_NEGATIVE"
    VACCS_HIST_HPV_POSITIVE: Final[str] = "VACCS_HIST_HPV_POSITIVE"
    VACCS_HIST_HPV_NEGATIVE: Final[str] = "VACCS_HIST_HPV_NEGATIVE"
    VACCS_HPV_DUP_1: Final[str] = "VACCS_HPV_DUP_1"
    VACCS_HPV_DUP_2: Final[str] = "VACCS_HPV_DUP_2"
    VACCS_HPV_INVALID_STRUCTURE: Final[str] = "VACCS_HPV_INVALID_STRUCTURE"
    VACCS_HPV_EMPTY_FILE: Final[str] = "VACCS_HPV_EMPTY_FILE"
    VACCS_HPV_HEADER_ONLY: Final[str] = "VACCS_HPV_HEADER_ONLY"
    COHORTS_POSITIVE: Final[str] = "COHORTS_POSITIVE"
    COHORTS_NEGATIVE: Final[str] = "COHORTS_NEGATIVE"
    COHORTS_INVALID_STRUCTURE: Final[str] = "COHORTS_INVALID_STRUCTURE"
    COHORTS_EMPTY_FILE: Final[str] = "COHORTS_EMPTY_FILE"
    COHORTS_HEADER_ONLY: Final[str] = "COHORTS_HEADER_ONLY"
    COHORTS_NO_APPROVAL: Final[str] = "COHORTS_NO_APPROVAL"
    CHILD_POSITIVE: Final[str] = "CHILD_POSITIVE"
    CHILD_NEGATIVE: Final[str] = "CHILD_NEGATIVE"
    CHILD_INVALID_STRUCTURE: Final[str] = "CHILD_INVALID_STRUCTURE"
    CHILD_EMPTY_FILE: Final[str] = "CHILD_EMPTY_FILE"
    CHILD_HEADER_ONLY: Final[str] = "CHILD_HEADER_ONLY"
    CLASS_POSITIVE: Final[str] = "CLASS_POSITIVE"
    CLASS_NEGATIVE: Final[str] = "CLASS_NEGATIVE"
    CLASS_INVALID_STRUCTURE: Final[str] = "CLASS_INVALID_STRUCTURE"
    CLASS_EMPTY_FILE: Final[str] = "CLASS_EMPTY_FILE"
    CLASS_HEADER_ONLY: Final[str] = "CLASS_HEADER_ONLY"

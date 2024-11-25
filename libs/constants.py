from typing import Final


class object_properties:
    TEXT: Final[str] = "text"
    VISIBILITY: Final[str] = "visibility"
    HREF: Final[str] = "href"


class actions:
    CLICK_LINK: Final[str] = "click_link"
    CLICK_BUTTON: Final[str] = "click_button"
    CLICK_LABEL: Final[str] = "click_label"
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


class workflow_type:
    APPLICATION: Final[str] = "application"
    PARENTAL_CONSENT: Final[str] = "parental_consent"


class data_values:
    EMPTY: Final[str] = "<empty>"


class playwright_roles:
    LINK: Final[str] = "link"
    BUTTON: Final[str] = "button"
    OPTION: Final[str] = "option"
    ROW: Final[str] = "row"


class wait_time:
    MIN: Final[str] = "3s"
    MED: Final[str] = "10s"
    MAX: Final[str] = "30s"


class escape_characters:
    SEPARATOR: Final[str] = "||"  # Used only in code
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
    UI_FORMATTING = [
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
    FILE_NAME = [SEPARATOR, COLON]


class test_data_file_paths:
    PARENTAL_CONSENT: Final[str] = "test_data/ParentalConsent.xlsx"
    VACCS_HPV_POSITIVE: Final[str] = (
        f"test_data/hpv/i_positive.csv{escape_characters.SEPARATOR}test_data/hpv/o_positive.csv"
    )
    VACCS_HPV_NEGATIVE: Final[str] = (
        f"test_data/hpv/i_negative.csv{escape_characters.SEPARATOR}test_data/hpv/o_negative.csv"
    )
    VACCS_HIST_HPV_POSITIVE: Final[str] = (
        f"test_data/hpv/i_hist_positive.csv{escape_characters.SEPARATOR}test_data/hpv/o_hist_positive.csv"
    )
    VACCS_HIST_HPV_NEGATIVE: Final[str] = (
        f"test_data/hpv/i_hist_negative.csv{escape_characters.SEPARATOR}test_data/hpv/o_hist_negative.csv"
    )
    VACCS_HPV_DUP_1: Final[str] = f"test_data/hpv/i_dup_1.csv{escape_characters.SEPARATOR}test_data/hpv/o_dup_1.csv"
    VACCS_HPV_DUP_2: Final[str] = f"test_data/hpv/i_dup_2.csv{escape_characters.SEPARATOR}test_data/hpv/o_dup_2.csv"
    VACCS_HPV_INVALID_STRUCTURE: Final[str] = (
        f"test_data/hpv/i_invalid_structure.csv{escape_characters.SEPARATOR}test_data/hpv/o_invalid_structure.csv"
    )
    VACCS_HPV_EMPTY_FILE: Final[str] = (
        f"test_data/hpv/i_empty.csv{escape_characters.SEPARATOR}test_data/hpv/o_empty.csv"
    )
    VACCS_HPV_HEADER_ONLY: Final[str] = (
        f"test_data/hpv/i_header_only.csv{escape_characters.SEPARATOR}test_data/hpv/o_header_only.csv"
    )
    COHORTS_POSITIVE: Final[str] = (
        f"test_data/cohorts/i_positive.csv{escape_characters.SEPARATOR}test_data/cohorts/o_positive.csv"
    )
    COHORTS_NEGATIVE: Final[str] = (
        f"test_data/cohorts/i_negative.csv{escape_characters.SEPARATOR}test_data/cohorts/o_negative.csv"
    )
    COHORTS_INVALID_STRUCTURE: Final[str] = (
        f"test_data/cohorts/i_invalid_structure.csv{escape_characters.SEPARATOR}test_data/cohorts/o_invalid_structure.csv"
    )
    COHORTS_EMPTY_FILE: Final[str] = (
        f"test_data/cohorts/i_empty.csv{escape_characters.SEPARATOR}test_data/cohorts/o_empty.csv"
    )
    COHORTS_HEADER_ONLY: Final[str] = (
        f"test_data/cohorts/i_header_only.csv{escape_characters.SEPARATOR}test_data/cohorts/o_header_only.csv"
    )
    CHILD_POSITIVE: Final[str] = (
        f"test_data/child/i_positive.csv{escape_characters.SEPARATOR}test_data/child/o_positive.csv"
    )
    CHILD_NEGATIVE: Final[str] = (
        f"test_data/child/i_negative.csv{escape_characters.SEPARATOR}test_data/child/o_negative.csv"
    )
    CHILD_INVALID_STRUCTURE: Final[str] = (
        f"test_data/child/i_invalid_structure.csv{escape_characters.SEPARATOR}test_data/child/o_invalid_structure.csv"
    )
    CHILD_EMPTY_FILE: Final[str] = (
        f"test_data/child/i_empty.csv{escape_characters.SEPARATOR}test_data/child/o_empty.csv"
    )
    CHILD_HEADER_ONLY: Final[str] = (
        f"test_data/child/i_header_only.csv{escape_characters.SEPARATOR}test_data/child/o_header_only.csv"
    )
    CLASS_POSITIVE: Final[str] = (
        f"test_data/class_list/i_positive.csv{escape_characters.SEPARATOR}test_data/class_list/o_positive.csv"
    )
    CLASS_NEGATIVE: Final[str] = (
        f"test_data/class_list/i_negative.csv{escape_characters.SEPARATOR}test_data/class_list/o_negative.csv"
    )
    CLASS_INVALID_STRUCTURE: Final[str] = (
        f"test_data/class_list/i_invalid_structure.csv{escape_characters.SEPARATOR}test_data/class_list/o_invalid_structure.csv"
    )
    CLASS_EMPTY_FILE: Final[str] = (
        f"test_data/class_list/i_empty.csv{escape_characters.SEPARATOR}test_data/class_list/o_empty.csv"
    )
    CLASS_HEADER_ONLY: Final[str] = (
        f"test_data/class_list/i_header_only.csv{escape_characters.SEPARATOR}test_data/class_list/o_header_only.csv"
    )

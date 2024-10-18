class object_properties:
    TEXT = "text"
    VISIBILITY = "visibility"


class actions:
    CLICK_LINK = "click_link"
    CLICK_BUTTON = "click_button"
    CLICK_LABEL = "click_label"
    FILL = "fill"
    RADIO_BUTTON_SELECT = "radio_select"
    SELECT_FILE = "select_file"
    SELECT_FROM_LIST = "select_from_list"
    CHECKBOX_CHECK = "checkbox_check"


class screenshot_types:
    JPEG = "jpeg"


class file_mode:
    READ = "r"
    WRITE = "w"
    APPEND = "a"


class api_constants:
    API_SUCCESS_STATUS_CODE_MIN = 200
    API_SUCCESS_STATUS_CODE_MAX = 299


class workflow_type:
    APPLICATION = "application"
    PARENTAL_CONSENT = "parental_consent"


class data_values:
    EMPTY = "<empty>"


class playwright_roles:
    LINK = "link"
    BUTTON = "button"
    OPTION = "option"


class wait_time:
    MIN = "3s"
    MED = "10s"
    MAX = "30s"


class escape_characters:
    SPACE = " "
    NEW_LINE = "\n"
    CARRIAGE_RETURN = "\r"
    NEW_LINE_CARRIAGE_RETURN = "\r\n"
    SINGLE_QUOTE_OPEN_UNICODE = "â€™"
    SINGLE_QUOTE_CLOSE_UNICODE = "â€˜"
    SINGLE_QUOTE_OPEN = "‘"
    SINGLE_QUOTE_CLOSE = "’"
    TAB = "\t"
    COLON = ":"
    BACKSLASH = "\\"
    FRONTSLASH = "/"
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
    FILE_NAME = [COLON]


class test_data_file_paths:
    PARENTAL_CONSENT = "test_data/ParentalConsent.xlsx"
    VACCS_HPV_POSITIVE = "test_data/hpv/i_positive.csv||test_data/hpv/o_positive.csv"
    VACCS_HPV_NEGATIVE = "test_data/hpv/i_negative.csv||test_data/hpv/o_negative.csv"
    VACCS_HPV_DUP_1 = "test_data/hpv/i_dup_1.csv||test_data/hpv/o_dup_1.csv"
    VACCS_HPV_DUP_2 = "test_data/hpv/i_dup_2.csv||test_data/hpv/o_dup_2.csv"
    COHORTS_POSITIVE = "test_data/cohorts/i_positive.csv||test_data/cohorts/o_positive.csv"
    COHORTS_NEGATIVE = "test_data/cohorts/i_negative.csv||test_data/cohorts/o_negative.csv"
    CHILD_POSITIVE = "test_data/child/i_positive.csv||test_data/child/o_positive.csv"
    CHILD_NEGATIVE = "test_data/child/i_negative.csv||test_data/child/o_negative.csv"

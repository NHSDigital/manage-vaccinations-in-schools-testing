import pytest


@pytest.fixture(autouse=True)
def go_to_log_in_page(login_page):
    login_page.go_to_login_page()


@pytest.mark.login
@pytest.mark.order(101)
@pytest.mark.parametrize(
    "user,pwd,expected_message",
    [
        ("invalid_user", "invalid_password", "Invalid Email or password."),
        ("invalid_user", "", "Invalid Email or password."),
        ("", "invalid_password", "Invalid Email or password."),
        ("", "", "Invalid Email or password."),
    ],
)
def test_invalid(user, pwd, expected_message, login_page):
    login_page.try_invalid_login(user=user, pwd=pwd, expected_message=expected_message)


@pytest.mark.login
@pytest.mark.order(102)
def test_home_page_links_for_nurse(nurse, login_page, dashboard_page):
    login_page.log_in(**nurse)
    dashboard_page.verify_all_expected_links_for_nurse()
    login_page.log_out()


@pytest.mark.login
@pytest.mark.order(103)
def test_home_page_links_for_superuser(superuser, login_page, dashboard_page):
    login_page.log_in(**superuser)
    dashboard_page.verify_all_expected_links_for_superuser()
    login_page.log_out()


@pytest.mark.login
@pytest.mark.order(104)
def test_home_page_links_for_admin(admin, login_page, dashboard_page):
    login_page.log_in(**admin)
    dashboard_page.verify_all_expected_links_for_admin()
    login_page.log_out()

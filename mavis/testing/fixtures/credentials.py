import os

import pytest


@pytest.fixture(scope="session")
def admin() -> dict[str, str]:
    return {
        "username": os.environ["ADMIN_USERNAME"],
        "password": os.environ["ADMIN_PASSWORD"],
    }


@pytest.fixture(scope="session")
def basic_auth() -> dict[str, str]:
    return {
        "username": os.environ["BASIC_AUTH_USERNAME"],
        "password": os.environ["BASIC_AUTH_PASSWORD"],
    }


@pytest.fixture(scope="session")
def nurse() -> dict[str, str]:
    return {
        "username": os.environ["NURSE_USERNAME"],
        "password": os.environ["NURSE_PASSWORD"],
    }


@pytest.fixture(scope="session")
def superuser() -> dict[str, str]:
    return {
        "username": os.environ["SUPERUSER_USERNAME"],
        "password": os.environ["SUPERUSER_PASSWORD"],
    }

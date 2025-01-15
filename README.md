# Manage vaccinations in schools

[![Run MAVIS tests on TEST](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/MAVIS_TEST.yml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/MAVIS_TEST.yml)

## Introduction

This is a test automation project to test the manage vaccinations in schools (MAVIS) project.  It contains several positive and negative functional as well as regression tests.

It is currently configured to run on the QA environment.  The project utilizes the PyTest framework along with Playwright to manage and execute the tests.

## Installation

This test pack requires Python 3.10 installed on the system or greater to run.

To execute the tests from your system, please follow the 4 easy steps below:

1. Clone the repository to any local folder

   ```console
   git clone https://github.com/NHSDigital/manage-vaccinations-in-schools-testing.git
   ```

1. Create a virtual environment

    ```console
    python -m venv .venv
    ```

1. Install all dependencies

    ```console
    pip install -r requirements.txt
    ```

1. Create a .env file.  Speak to a team member to get the contents of the .env file.

   ```console
   cp .env.generic .env
   ```

1. Finally, verify the setup by running a self-test

    ```console
    pytest -m smoke
    ```

Once the self test passes, you are good to go.

Tests for individual endpoints can be executed using individual markers.  For example:

```console
pytest -m regression
```

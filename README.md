# Manage vaccinations in schools

[![Test workflow](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/test.yaml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/test.yaml)

## Introduction

This is a test automation project to test the manage vaccinations in schools (MAVIS) project.  It contains several positive and negative functional as well as regression tests.

It is currently configured to run on the QA environment.  The project utilizes the PyTest framework along with Playwright to manage and execute the tests.

## Installing

To execute the tests from your system, please follow the steps below:

1. Clone the repository to any local folder

   ```console
   git clone https://github.com/NHSDigital/manage-vaccinations-in-schools-testing.git
   ```

1. Install Python

   The version of Python is specified in the `.tool-versions` file meaning it can be managed automatically using tools
   such as [Mise](https://mise.jdx.dev) or [Asdf](https://asdf-vm.com).

   ```console
   mise install
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

## Linting

```shell
$ ruff format
$ ruff check
```

## Running

Once the self test passes, you are good to go.

Tests for individual endpoints can be executed using individual markers.  For example:

```console
pytest -m regression
```

## More information

Further details on the scope and approach of the automation are on the [NHSD Confluence page](https://nhsd-confluence.digital.nhs.uk/pages/viewpage.action?spaceKey=Vacc&title=Mavis+Test+Automation).

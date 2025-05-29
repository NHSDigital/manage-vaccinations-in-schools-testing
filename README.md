# Testing for Manage vaccinations in schools

This repository contains an automated testing framework for the [Manage vaccinations in schools][mavis] service,
including both functional and performance tests.

[mavis]: https://github.com/nhsuk/manage-vaccinations-in-schools/

[![Functional tests](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/functional.yaml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/functional.yaml)

[![Performance tests](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance.yaml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance.yaml)

[![Performance (end to end) tests](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance-e2e.yaml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance-e2e.yaml)

## Functional tests

The functional tests are written using [Playwright] with [Pytest].

[Playwright]: https://playwright.dev/python/
[Pytest]: https://docs.pytest.org/en/stable/

### Installing

To execute the tests from your system, please follow the steps below:

1. Install Python

   The version of Python is specified in the `.tool-versions` file meaning it can be managed automatically using tools
   such as [Mise](https://mise.jdx.dev) or [Asdf](https://asdf-vm.com).

   ```shell
   mise install
   ```

1. Create a virtual environment

    ```shell
    python -m venv .venv
    ```

1. Install all dependencies

    ```shell
    pip install -r requirements.txt
    ```

1. Create a .env file.  Speak to a team member to get the contents of the .env file.

   ```shell
   cp .env.generic .env
   ```

1. Finally, verify the setup by running a self-test

    ```shell
    pytest -m smoke
    ```

### Running

```shell
$ pytest
```

#### Browsers and devices

By default, the tests will run using `Chromium` with no particular device,
however it's possible to run the tests in different browsers and devices.
Some examples are listed below.

##### iPhone 15

```shell
$ pytest --browser webkit --device "iPhone 15"
```

##### Firefox

```shell
$ pytest --browser firefox
```

##### Google Pixel 7

```shell
$ pytest --browser chromium --device "Pixel 7"
```

##### Microsoft Edge

```shell
$ pytest --browser chromium --browser-channel msedge
```

#### Headless mode

If running in a CI environment (determined by the presence of a `CI`
environment variable) then by default the tests will run in headless mode. To
run the tests in headed more, use the following command:

```shell
$ pytest --headed
```

#### Screenshots

To take screenshots while the tests are running there is a `--screenshot`
command line option. The screenshots will be saved in a `screenshots`
directory.

```shell
$ pytest --screenshot on
```

#### Slow motion

When running the tests locally in headed mode, it can be useful to make the
steps artificially slower to see what's happening at each point. To introduce
a 1-second delay, use the following command:

```shell
$ pytest --slowmo 1000
```

#### Markers

Tests for individual endpoints can be executed using individual markers. For example:

```shell
$ pytest -m regression
```

#### Resetting the environment

By default, when running the tests, a call is made to `/reset/{ods_code}` which
is designed to reset the environment for a clean test run. It can sometimes be
necessary to skip resetting the environment (when running a single test for
example). To do this, there is `--skip-reset` flag available:

```shell
$ pytest tests/test_10_unmatched_consent_responses.py --skip-reset
```

#### Tracing

There's an option available to run tests with tracing, allowing the test to be
replayed in the Trace Viewer.

```shell
$ pytest --tracing on
$ playwright show-trace test-results/.../trace.zip
```

### Reporting

While the tests are running results are stored in `allure-results` which can
then be used to generate a report:

```shell
$ npm install
$ npx allure generate allure-results
$ npx allure open
```

### Linting

Ruff is used as a linting tool in this repo:

```shell
$ ruff format
$ ruff check
```

## Performance tests

### Installation

The JMeter test scenarios require JMeter installed, the latest version is recommended. In addition, two plugins are required:

1. Dummy Sampler.
2. Random CSV Data Set

It is recommended to install these via JMeter plugins manager, which is either installed by default or can be found here. https://jmeter-plugins.org/wiki/PluginsManager/.

JMeter requires Java installed on the system. Please note that Oracle Java (JDK/JRE) is NOT recommended, an unusual issue was found that could not be replicated or fixed. To avoid the issue, use OpenJDK (latest version)

Many aspects of scripting are helped with the use of Blazemeter tools, for example the Chrome recorder here. https://chromewebstore.google.com/detail/blazemeter-the-continuous/mbopgmdnpcbohhpnfglgohlbhfongabi

It should be noted that Blazemeter does create a very specific type of script and can need some additional work to produce a reliable script.

### Script execution

The scripts are designed to run as part of a workflow. This is for simplicity as well as satisfy the need for significant performance test hosting capability. The Github runners are (currently) capable of hosting the required tests.

The links for both workflows are at the top of this page. Where possible, the E2E variant should be used.

#### Script parameters

The script is designed to run as a 'single click', however there are still a few changes to get to that. In the meantime, the following inputs are configured on the workflow;

- Use Workflow from xxxxx . Use Main branch where possible, unless testing a code change in a different branch.
- Run data prep. Defaulting to true, this flag allows the data prep stage to be turned off. This is useful if data prep has already occurred previously. Data prep includes the file upload and consent journey steps in order to correctly prepare for a test.
- Run the nurse journey. Defaulting to true, this flag allows the nurse journey test to be turned off. As above this is useful if the data prep is to be run separately at an earlier date/time.
- URN. This is a required value, and is typically a six digit numeric for a school in the QA environment. This takes the place of the 'session slug' that was in previous scripts. At time of writing this is required to be added manually and must have an active session, however long term the value will be taken from the cohort file (below) and will no longer be required.
- Input file. This is the cohort file to be used by the E2E flow. This should be in CSV format and must be a valid cohort file. This will be replaced by an automated file generation process, and will be removed at that point. Note the file must exist in the repository in performance-tests/E2E folder.
- Duration of nurse journey test in seconds. Optional value, if the default of one hour is not suitable for the test required it can be overwritten. This does not affect the consent journey or file upload steps as they have fixed parameters.
- Number of nurses (threads) to run. Optional value, if the default value of 70 nurses is not suitable for the test required it can be overwritten. This does not affect the consent journey or file upload steps as they have fixed parameters.
- Ramp up time in seconds. Optional value, if the default of 15 minutes is not suitable for the test required it can be overwritten. This does not affect the consent journey or file upload steps as they have fixed parameters.
- Vaccination loop count. Optional value, this is to replicate a nurse 'session' where (for example) a group of 20 patients would be vaccinated before the nurse logged out and took a break. This is more effective for longer tests where it will log out and log in on regular intervals. This can be overridden if required, and also does not affect the consent journey or file upload steps as they have fixed parameters.

#### Results retrieval and analysis

The workflow generates a zip file on successful completion of the script. Once unzipped to a folder it contains the results HTML report which can be viewed in any browser, as well as the results.log which is text based. The metrics and performance should be compared to similar report from Cloudwatch, Splunk and other monitoring tools.

#### Future improvements

The following changes will be added soon:

- complete automation of data prep. The first step of the workflow will be to generate a new valid cohort file to be used by the rest of the workflow. This will remove the need for URN and input file to be added as inputs.
- Better reporting. Current thinking is to have the test results uploaded to Splunk for better analysis, however it is currently unknown whether this will be permitted. Another option would be to publish the reports to github pages, again this may be blocked by permissions. Lastly, a tabular version of the results could be generated directly on the workflow output, this is most definitely a 'backup' option.

## More information

Further details on the scope and approach of the automation are on the [NHSD Confluence page](https://nhsd-confluence.digital.nhs.uk/pages/viewpage.action?spaceKey=Vacc&title=Mavis+Test+Automation).

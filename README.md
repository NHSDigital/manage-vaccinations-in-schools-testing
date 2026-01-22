# Testing for Manage vaccinations in schools

This repository contains automated end-to-end, performance and security tests for the [Manage vaccinations in schools][mavis] application.

[mavis]: https://github.com/nhsuk/manage-vaccinations-in-schools/

[![End-to-End tests](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/end-to-end-tests.yaml/badge.svg?branch=main)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/end-to-end-tests.yaml?branch=main)

[![Performance (end to end) tests](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance.yaml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance.yaml)

[![Run full OWASP ZAP scan against QA](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/owasp_zap.yaml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/owasp_zap.yaml)

## End-to-End tests

The end-to-end tests are written using [Playwright] with [Pytest].

[Playwright]: https://playwright.dev/python/
[Pytest]: https://docs.pytest.org/en/stable/

### Installation

To execute the tests from your system, follow the steps below:

1. Install [uv](https://docs.astral.sh/uv/getting-started/installation/#installation-methods). `uv` will attempt to detect and use a compatible Python installation. Otherwise, it will install a compatible version to use at runtime. Verify the installation with:

   ```shell
   $ uv sync
   ```

1. Create a .env file. Speak to a team member to get the contents of the .env file.

   ```shell
   $ cp .env.generic .env
   ```

1. Check the setup is working by running a smoke test

   ```shell
   $ uv run pytest -m smoke
   ```

### Execution with `uv`

There are two ways to run commands with `uv`

* You can run commands from outside the `uv` virtual environment:

    ```shell
    $ uv run pytest
    ```

* You can run commands from inside the `uv` virtual environment, by first creating the environment and then activating it.

    ```shell
    $ uv venv
    $ source .venv/bin/activate
    $ pytest
    ```

### Playwright CLI arguments

Playwright offers many [CLI arguments] which can be used when running tests. Some useful ones are highlighted here:

[CLI arguments]: https://playwright.dev/python/docs/test-runners#cli-arguments

#### Browsers and devices

Playwright can emulate running tests on various [devices]. By default, the tests use `Desktop Chrome`. This can be changed by using the `--device` CLI argument like so:

```shell
$ pytest --device "iPhone 15"
```

[devices]: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json

#### Headless mode

By default the tests will run in headless mode. To
run the tests in headed mode, use the following command:

```shell
$ pytest --headed
```
#### Tracing

There's an option available to run tests with tracing, allowing the test to be
replayed in the Trace Viewer.

```shell
$ pytest --tracing on
$ playwright show-trace test-results/.../trace.zip
```
### Pytest CLI arguments

Pytest also has some useful CLI arguments

#### Markers

Some tests are grouped using markers. You can include/exclude groups with the `-m` flag: 

```shell
$ pytest -m log_in
$ pytest -m "not imms_api and not accessibility"
```
#### Parallel test execution

This repository uses [pytest-xdist] to run test modules in parallel. The number of available workers is equal to the number of CPUs that your system has. By default, when running tests locally, all available workers will be used when running multiple test modules. This behaviour can be configured with the `-n` flag.

```shell
$ pytest -n 4    # only use 4 workers
$ pytest -n 0    # disable pytest-xdist
```

[pytest-xdist]:https://github.com/pytest-dev/pytest-xdist

### Reporting

While the tests are running, results are stored in `allure-results` which can
then be used to generate a report. Using the `--single-file` flag generates an html which can be easily shared and can be opened in any browser. This requires a Java installation.

```shell
$ npm install
$ npx allure-commandline generate --clean --single-file -o allure-results
$ npx allure-commandline open
```

### Linting and formatting

[Ruff] is used as a linting and formatting tool in this repo:

```shell
$ ruff format
$ ruff check --fix
```

[Ruff]:https://github.com/astral-sh/ruff

### Playwright Page Object Model

The Playwright [Page Object Model] (or POM) approach is taken when developing this repository. Each page/wizard in Mavis should have its own Page object, storing all appropriate locators and methods. When multiple pages use the same locators/methods, a component should be created that extracts these. Then page objects can access this functionality via the component. See `mavis/test/pages/header_component.py` and its usages for an example.

[Page Object Model]:https://playwright.dev/docs/pom

### Test data

Test data is created before running tests using the `/api/testing/onboard` endpoint of the chosen MAVIS environment. The data is then cleaned up at the end. Most of this can be seen [here]. The following process is performed for each worker:

1. For each programme group (HPV, Flu, Doubles, MMR)
   1. A random valid year group is selected.
   2. Two random valid schools that have this year group are retrieved using the MAVIS `/api/testing/locations` endpoint.
   3. User, team, and organisation data is generated by the test worker.
   4. The school, user, team, and organisation data is sent to the MAVIS `/api/testing/onboard` endpoint, inserting all of this data into the database and linking the schools to the team.
   5. The test worker also generates two children which are not immediately added to the database but can be imported later.
2. The generated test data is provided as a set of fixtures, which can be injected into tests (or other fixtures). Some common examples:
   - `children` – provides two children for each programme group (in the form of a map)
   - `schools` – provides two schools for each programme group (also in the form of a map)  
3. After a test module has finished, the worker clears out any data created by running the test module by calling the MAVIS `/api/testing/teams/<workgroup>` endpoint with parameter `keep_itself=true`.
4. After a worker has finished running all test modules allocated to it, it calls the MAVIS `/api/testing/teams/<workgroup>` endpoint without the `keep_itself` parameter, which clears all associated with the team used by the worker including the team itself. No data should remain after a test run.

[here]: https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/blob/main/mavis/test/fixtures/data_models.py

### More information

Further details on the scope and approach of the automation are on the [NHSD Confluence page](https://nhsd-confluence.digital.nhs.uk/pages/viewpage.action?spaceKey=Vacc&title=Mavis+Test+Automation).

## Performance tests

### Installation

The JMeter test scenarios require JMeter installed, the latest version is recommended. In addition, several plugins are required:

1. jpgc-udp UDP protocol support (possibly not needed in the future).
2. jpgc-graphs-basic response time graphs (used for reporting).
3. jpgc-dummy Dummy transaction (used for script delays and debugging).
4. bzm-random-csv random CSV access (possibly not needed in the future).
5. jpgc-sts Simple Table Server (used for temporary data hosting during a test).

It is recommended to install these via JMeter plugins manager, which is either installed by default or can be found here. https://jmeter-plugins.org/wiki/PluginsManager/.

JMeter requires Java installed on the system. Please note that Oracle Java (JDK/JRE) is NOT recommended, an unusual issue was found that could not be replicated or fixed. To avoid the issue, use OpenJDK. In addition a pipeline issue was found with the latest OpenJDK, so version 21 is recommended.

Many aspects of scripting are helped with the use of Blazemeter tools, for example the Chrome recorder here. https://chromewebstore.google.com/detail/blazemeter-the-continuous/mbopgmdnpcbohhpnfglgohlbhfongabi

It should be noted that Blazemeter does create a very specific type of script and will need additional work to produce a reliable script.

### Script execution

The scripts are designed to run as part of a workflow. This is for simplicity as well as satisfy the need for significant performance test hosting capability. The Github runners are (currently) capable of hosting the required tests.

Older workflows are no longer viable due to the amount of data involved. Only the STS variants in the relevant folder should be used.

#### Script parameters

The script is now presented as a 'single click' execution as the 'Performance' GitHub workflow, with many default values being acceptable for repeated testing. For greater control the options and their usage is listed below. 

- Use Workflow from xxxxx . Use Main branch where possible, unless testing a code change in a different branch.
- Add a new session date, default is true. This takes an unused session that has cohorts added to it, and creates session dates for today and tomorrow. The default organisation has more than 400 schools for each programme so should not need refreshing for quite some time.
- Run consent journey, default is true. This completes consents for any/all of the active sessions (including the one created above). This can be run without the previous step if there are already open sessions for today.
- Run nurse journey, default is true. This completes vaccinations for any/all of the active consents (including the ones created from the consent journey). This can be run without previous steps if there are already sufficient consents for open sessions.
- Duration of nurse journey test in seconds. Optional value, if the default of one hour is not suitable for the test required it can be overwritten. This does not affect the consent journey as that simply runs for all available consents.
- Number of nurses (threads) to run. Optional value, if the default value of 70 nurses is not suitable for the test required it can be overwritten. This does not affect the consent journey as consents come from the public website and are not session based.
- Ramp up time in seconds. Optional value, if the default of 15 minutes is not suitable for the test required it can be overwritten. This does not affect the consent journey. Note that the ramp up time should be adjusted if the duration is also changed, to allow for the maximum time at 100% load.
- Default user, default is 'perf2test@example.com'. This controls the user login and therefore what organisation, sessions and schools are used. Currently 'perf2' is the most populated organisation.
- URL, default is 'performance.mavistesting.com'. This allows a performance test to run on different environments. From November 2025 there is a dedicated 'performance' environment which should be used.

#### Results retrieval and analysis

During the workflow test, a link is provided to Cloudwatch for logging as the workflow no longer has visibility of the real time log. Cloudwatch should be monitored for any indication of a high error count or very slow performance.
At the end of the test the results are published to GitHub pages, and a link provided in the workflow. This should be used for performance analysis by comparing with previous reports as well as output from Cloudwatch and Grafana. Note that GitHub pages can be slow so the link may not be active immediately after a test has completed. It can take up to five minutes for the results to appear.

#### Future improvements

The following changes will be added soon:

- Real time reporting. With the availability of Grafana it is planned to submit realtime response times to Grafana for analysis. This is a standard approach for performance testing/monitoring, and can be used to correlate between response times and other metrics presented through Grafana.

# Manage vaccinations in schools

[![Performance tests (E2E)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/perf-test-with-data.yml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/perf-test-with-data.yml)

[![Performance tests](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance-tests.yml/badge.svg)](https://github.com/NHSDigital/manage-vaccinations-in-schools-testing/actions/workflows/performance-tests.yml)

## Introduction

This is part of the test automation project, and focuses on performance testing of the manage vaccinations in schools (MAVIS) project. It contains two primary workflows and is to be expanded.

It is currently configured to run on the QA environment.  The project is JMeter based for scripting, execution and reporting

## Installation

The JMeter test scenarios require JMeter installed, the latest version is recommended. In addition, two plugins are required:

1. Dummy Sampler.
2. Random CSV Data Set

It is recommended to install these via JMeter plugins manager, which is either installed by default or can be found here. https://jmeter-plugins.org/wiki/PluginsManager/.

JMeter requires Java installed on the system. Please note that Oracle Java (JDK/JRE) is NOT recommended, an unusual issue was found that could not be replicated or fixed. To avoid the issue, use OpenJDK (latest version)

Many aspects of scripting are helped with the use of Blazemeter tools, for example the Chrome recorder here. https://chromewebstore.google.com/detail/blazemeter-the-continuous/mbopgmdnpcbohhpnfglgohlbhfongabi

It should be noted that Blazemeter does create a very specific type of script and can need some additional work to produce a reliable script. 

## Script execution

The scripts are designed to run as part of a workflow. This is for simplicity as well as satisfy the need for significant performance test hosting capability. The Github runners are (currently) capable of hosting the required tests.

The links for both workflows are at the top of this page. Where possible, the E2E variant should be used.

### Script parameters

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

### results retrieval and analysis

The workflow generates a zip file on successful completion of the script. Once unzipped to a folder it contains the results HTML report which can be viewed in any browser, as well as the results.log which is text based. The metrics and performance should be compared to similar report from Cloudwatch, Splunk and other monitoring tools. 

### Future improvements

The following changes will be added soon:

- complete automation of data prep. The first step of the workflow will be to generate a new valid cohort file to be used by the rest of the workflow. This will remove the need for URN and input file to be added as inputs.
- Better reporting. Current thinking is to have the test results uploaded to Splunk for better analysis, however it is currently unknown whether this will be permitted. Another option would be to publish the reports to github pages, again this may be blocked by permissions. Lastly, a tabular version of the results could be generated directly on the workflow output, this is most definitely a 'backup' option. 

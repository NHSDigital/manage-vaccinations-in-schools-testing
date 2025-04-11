#!/usr/bin/env bash

# Runs the nurse-journey JMeter file with the given options.

jmeter_params=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help)
      echo "Usage: $0 [options] <session_slug>"
      echo "Options:"
      echo "  -h, --help  Display this help message and exit"
      echo "  -d, --duration  Duration of the test in seconds"
      echo "  -r, --ramp-up  Ramp-up time in seconds"
      echo "  -T, --threads  Number of threads (users)"
      echo "  -V, --vaccinations  Number of vaccinations to perform by each thread before signout & signin"
      exit 0
      ;;
    -A|--auth-token)
      jmeter_params+=("-JAuthToken=$2")
      shift 2
      ;;
    -d|--duration)
      jmeter_params+=("-JDuration=$2")
      shift 2
      ;;
    -r|--ramp-up)
      jmeter_params+=("-JRampUp=$2")
      shift 2
      ;;
    -T|--threads)
      jmeter_params+=("-JThreads=$2")
      shift 2
      ;;
    -V|--vaccinations)
      jmeter_params+=("-JVaccinationLoop=$2")
      shift 2
      ;;
    *)
      session_slug=$1
      shift
      ;;
  esac
done

if [ -z "$session_slug" ]; then
  echo "Usage: $0 [options] <session_slug>"
  exit 1
fi

# Warn the user if AuthToken is not set
if [[ ! " ${jmeter_params[@]} " =~ " -JAuthToken=" ]]; then
  echo "!WARNING! AuthToken is not set. Tests will fail if the env is behind basic auth."
fi

# bin/jmeter -n -t ../Mavis_NURSE.jmx -l ../mavis-perf-test-2025-04-02-write.jtl -JSessionSlug=GrjmypgJXN -Jsample_varables=PatientInfo_matchNr,PatientId,Authenticity_Token,RandomNumber -JDuration=300 -JRampUp=10
timestamp=$(date '+%Y%m%d%H%M%S')

jmeter -n -t nurse-journey.jmx -l ../mavis-perf-test-nurse-journey-${timestamp}.jtl -JSessionSlug=${session_slug} "${jmeter_params[@]}"

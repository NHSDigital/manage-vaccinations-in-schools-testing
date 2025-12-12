#!/bin/bash
set -e

# Validate required parameters
if [ -z "$AUTH_TOKEN" ]; then
    echo "Error: AUTH_TOKEN is required"
    exit 1
fi

if [ -z "$RESULT_PATH" ]; then
    echo "Error: RESULT_PATH is required"
    exit 1
fi

echo "==================================="
echo "Starting Performance Test"
echo "==================================="
echo "Add New Session: $ADD_NEW_SESSION"
echo "Run Consent: $RUN_CONSENT"
echo "Run Nurse: $RUN_NURSE"
echo "BaseURL: $BASE_URL"
echo "User: $USER"
echo "Duration: $DURATION seconds"
echo "Threads: $THREADS"
echo "Ramp Up: $RAMP_UP seconds"
echo "Result Path: $RESULT_PATH"
echo "==================================="

# Create output directories
mkdir -p /output/generate-cohort
mkdir -p /output/import
mkdir -p /output/consent
mkdir -p /output/nurse

# Step 1: Run the selected tests
if [ "$RUN_CONSENT" = true ]; then
    echo "Running Consent Journey test..."
    jmeter -n -t STS/consent-journey.jmx \
        -l /output/consent/samples.jtl \
        -j /output/consent/jmeter.log \
        -e -o /output/consent/report \
        -Jjmeter.reportgenerator.report_title="MAVIS test report" \
        -Jjmeter.reportgenerator.overall_granularity=10000 \
        -Jjmeter.reportgenerator.sample_filter="^.*[^0-9]$" \
        -JAuthToken="$AUTH_TOKEN" \
        -JLoops=-1 \
        -JThreads="$THREADS" \
        -JRampUp=60 \
        -JDuration="$DURATION" \
        -JUser="$USER" \
        -JBaseURL="$BASE_URL" \
        -JAddNewSession="$ADD_NEW_SESSION"

    if [ $? -ne 0 ]; then
        echo "Error: Consent Journey test failed"
        exit 1
    fi
fi

if [ "$RUN_NURSE" = true ]; then
    echo "Running Nurse Journey test..."
    jmeter -n -t STS/nurse-journey.jmx \
        -l /output/nurse/samples.jtl \
        -j /output/nurse/jmeter.log \
        -e -o /output/nurse/report \
        -Jjmeter.reportgenerator.report_title="MAVIS test report" \
        -Jjmeter.reportgenerator.overall_granularity=10000 \
        -Jjmeter.reportgenerator.sample_filter="^.*[^0-9]$" \
        -JAuthToken="$AUTH_TOKEN" \
        -JLoops=-1 \
        -JDuration="$DURATION" \
        -JThreads="$THREADS" \
        -JRampUp="$RAMP_UP" \
        -JUser="$USER" \
        -JBaseURL="$BASE_URL"
    if [ $? -ne 0 ]; then
        echo "Error: Nurse Journey test failed"
        exit 1
    fi
fi

# Upload results to S3
echo "==================================="
echo "Uploading results to S3"
echo "==================================="

S3_BUCKET="performancetest-reports"

S3_PATH="s3://${S3_BUCKET}/${RESULT_PATH}"

echo "Uploading to: ${S3_PATH}"

if aws s3 sync /output "${S3_PATH}" --no-progress; then
    echo "Successfully uploaded results to S3"
    echo "S3 Location: ${S3_PATH}"
else
    echo "ERROR: Failed to upload results to S3"
    exit 1
fi

echo "==================================="
echo "Performance test completed successfully"
echo "==================================="

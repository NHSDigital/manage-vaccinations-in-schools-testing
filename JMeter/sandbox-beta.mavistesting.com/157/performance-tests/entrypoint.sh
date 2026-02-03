#!/bin/bash
set -e

# Validate required parameters
if [ -z "$URN" ]; then
    echo "Error: URN is required"
    exit 1
fi

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
echo "Run Import: $RUN_IMPORT"
echo "Run Consent: $RUN_CONSENT"
echo "Run Nurse: $RUN_NURSE"
echo "URN: $URN"
echo "BaseURL: $BASE_URL"
echo "User: $USER"
echo "Duration: $DURATION seconds"
echo "Threads: $THREADS"
echo "Ramp Up: $RAMP_UP seconds"
echo "Row Count: $ROW_COUNT"
echo "Result Path: $RESULT_PATH"
echo "==================================="

# Create output directories
mkdir -p /output/generate-cohort
mkdir -p /output/import
mkdir -p /output/consent
mkdir -p /output/nurse

# Step 1: Generate cohort file
if [ "$RUN_IMPORT" = true ]; then
    echo "Step 1: Generating cohort file..."
    jmeter -n -t STS/generate-cohort.jmx \
        -l /output/generate-cohort/samples.jtl \
        -j /output/generate-cohort/jmeter.log \
        -e -o /output/generate-cohort/report \
        -JAuthToken="$AUTH_TOKEN" \
        -JURN="$URN" \
        -JBaseURL="$BASE_URL" \
        -JRowCount="$ROW_COUNT"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to generate cohort file"
        exit 1
    fi
    echo "Cohort file generated successfully"
fi

# Step 2: Import cohort file
if [ "$RUN_IMPORT" = true ]; then
    echo "Step 2: Importing cohort file..."
    jmeter -n -t STS/upload-cohort-data.jmx \
        -l /output/import/samples.jtl \
        -j /output/import/jmeter.log \
        -e -o /output/import/report \
        -JAuthToken="$AUTH_TOKEN" \
        -JUser="$USER" \
        -JBaseURL="$BASE_URL" \
        -JInputFile="cohortnew.csv"

    if [ $? -ne 0 ]; then
        echo "Error: Failed to import cohort file"
        exit 1
    fi
    echo "Cohort file imported successfully"
fi

# Step 3: Run the selected tests
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
        -JThreads=5 \
        -JRampUp=60 \
        -JDuration="$DURATION" \
        -JUser="$USER" \
        -JBaseURL="$BASE_URL" \
        -JURN="$URN"
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
        -JBaseURL="$BASE_URL" \
        -JURN="$URN"
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

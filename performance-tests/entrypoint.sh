#!/bin/bash
set -e

# Default values
DURATION=${DURATION:-3600}
THREADS=${THREADS:-70}
RAMP_UP=${RAMP_UP:-900}
VACCINATION_LOOP=${VACCINATION_LOOP:-20}
ROW_COUNT=${ROW_COUNT:-1000}

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
echo "Test: $TEST_TO_RUN"
echo "URN: $URN"
echo "Duration: $DURATION seconds"
echo "Threads: $THREADS"
echo "Ramp Up: $RAMP_UP seconds"
echo "Vaccination Loop: $VACCINATION_LOOP"
echo "Row Count: $ROW_COUNT"
echo "Result Path: $RESULT_PATH"
echo "==================================="

# Create output directories
mkdir -p /output/generate-cohort
mkdir -p /output/import
mkdir -p /output/consent
mkdir -p /output/nurse

# Step 1: Generate cohort file
echo "Step 1: Generating cohort file..."
jmeter -n -t E2E/generate-cohort.jmx \
    -l /output/generate-cohort/samples.jtl \
    -j /output/generate-cohort/jmeter.log \
    -e -o /output/generate-cohort/report \
    -JAuthToken="$AUTH_TOKEN" \
    -JURN="$URN" \
    -JRowCount="$ROW_COUNT"

if [ $? -ne 0 ]; then
    echo "Error: Failed to generate cohort file"
    exit 1
fi
echo "Cohort file generated successfully"

# Step 2: Import cohort file
echo "Step 2: Importing cohort file..."
jmeter -n -t E2E/upload-cohort-data.jmx \
    -l /output/import/samples.jtl \
    -j /output/import/jmeter.log \
    -e -o /output/import/report \
    -JAuthToken="$AUTH_TOKEN" \
    -JInputFile="cohortnew.csv"

if [ $? -ne 0 ]; then
    echo "Error: Failed to import cohort file"
    exit 1
fi
echo "Cohort file imported successfully"

# Step 3: Run the selected test
if [ "$TEST_TO_RUN" == "consent-journey" ]; then
    echo "Step 3: Running Consent Journey test..."
    jmeter -n -t E2E/consent-journey.jmx \
        -l /output/consent/samples.jtl \
        -j /output/consent/jmeter.log \
        -e -o /output/consent/report \
        -JAuthToken="$AUTH_TOKEN" \
        -JDuration="$DURATION" \
        -JThreads="$THREADS" \
        -JRampUp="$RAMP_UP" \
        -JInputFile="cohortnew.csv"
    
    TEST_EXIT_CODE=$?
    
elif [ "$TEST_TO_RUN" == "nurse-journey" ]; then
    echo "Step 3: Running Consent Journey for data prep..."
    jmeter -n -t E2E/consent-journey.jmx \
        -l /output/consent/samples.jtl \
        -j /output/consent/jmeter.log \
        -e -o /output/consent/report \
        -JAuthToken="$AUTH_TOKEN" \
        -JInputFile="cohortnew.csv"
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to run consent journey for data prep"
        exit 1
    fi
    
    echo "Step 4: Running Nurse Journey test..."
    jmeter -n -t E2E/nurse-journey.jmx \
        -l /output/nurse/samples.jtl \
        -j /output/nurse/jmeter.log \
        -e -o /output/nurse/report \
        -JAuthToken="$AUTH_TOKEN" \
        -JDuration="$DURATION" \
        -JThreads="$THREADS" \
        -JRampUp="$RAMP_UP" \
        -JVaccinationLoop="$VACCINATION_LOOP" \
        -JInputFile="cohortnew.csv"
    
    TEST_EXIT_CODE=$?
else
    echo "Error: Unknown test type: $TEST_TO_RUN"
    exit 1
fi

# Check test results
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "==================================="
    echo "Performance test FAILED"
    echo "==================================="
    exit 1
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

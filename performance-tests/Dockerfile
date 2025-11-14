ARG BASE_IMAGE_SOURCE=base-jmeter-image:latest

FROM $BASE_IMAGE_SOURCE
# Create directories for test files and outputs
RUN mkdir -p /performance-tests /output
WORKDIR /performance-tests
COPY STS/ STS
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

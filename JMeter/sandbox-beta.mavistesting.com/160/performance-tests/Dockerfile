FROM eclipse-temurin:25-jre-jammy

ENV JMETER_VERSION=5.6.3 \
    CMDRUNNER_VERSION=2.3 \
    JMETER_PLUGINS_MANAGER_VERSION=1.7.0 \
    JMETER_PLUGINS=jpgc-udp,jpgc-graphs-basic,jpgc-dummy,bzm-random-csv,jpgc-sts \
    JMETER_HOME=/opt/jmeter \
    PATH="/opt/jmeter/bin:${PATH}"

RUN apt-get update && apt-get install -y curl tar parallel unzip && rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2 for S3 uploads
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws

WORKDIR /opt

# Install JMeter
RUN curl -sSO https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz \
    && tar xzf apache-jmeter-${JMETER_VERSION}.tgz \
    && mv apache-jmeter-${JMETER_VERSION} jmeter \
    && rm apache-jmeter-${JMETER_VERSION}.tgz

RUN curl -sSO --output-dir ${JMETER_HOME}/lib \
    https://repo1.maven.org/maven2/kg/apc/cmdrunner/${CMDRUNNER_VERSION}/cmdrunner-${CMDRUNNER_VERSION}.jar

RUN curl -LsS --output ${JMETER_HOME}/lib/ext/jmeter-plugins-manager-${JMETER_PLUGINS_MANAGER_VERSION}.jar \
    https://jmeter-plugins.org/get/ \
    && java -cp ${JMETER_HOME}/lib/ext/jmeter-plugins-manager-${JMETER_PLUGINS_MANAGER_VERSION}.jar \
    org.jmeterplugins.repository.PluginManagerCMDInstaller \
    && chmod +x ${JMETER_HOME}/bin/PluginsManagerCMD.sh

RUN sed -i '/<Logger name="org.apache.jmeter.junit" level="debug" \/>/a \    <Logger name="org.apache.jmeter.protocol.http.sampler.HTTPSamplerBase" level="info" additivity="false"\/>' \
    ${JMETER_HOME}/bin/log4j2.xml

# Install JMeter plugins
RUN echo "${JMETER_PLUGINS}" | tr ',' '\n' | \
    parallel -j 5 "${JMETER_HOME}/bin/PluginsManagerCMD.sh install {}"

# Create directories for test files and outputs
RUN mkdir -p /performance-tests /output
WORKDIR /performance-tests
COPY STS/ STS
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Mount directories as volumes to make them writeable
VOLUME [ "/output", "/performance-tests/temp" ]

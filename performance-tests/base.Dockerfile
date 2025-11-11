FROM eclipse-temurin:21

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
RUN curl -sSO https://dlcdn.apache.org//jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz \
    && tar xzf apache-jmeter-${JMETER_VERSION}.tgz \
    && mv apache-jmeter-${JMETER_VERSION} jmeter \
    && rm apache-jmeter-${JMETER_VERSION}.tgz

# Install Command Runner    
RUN curl -sSO --output-dir ${JMETER_HOME}/lib \
    https://repo1.maven.org/maven2/kg/apc/cmdrunner/${CMDRUNNER_VERSION}/cmdrunner-${CMDRUNNER_VERSION}.jar

# Install jmeter plugins    
RUN curl -LsS --output ${JMETER_HOME}/lib/ext/jmeter-plugins-manager-${JMETER_PLUGINS_MANAGER_VERSION}.jar \
    https://jmeter-plugins.org/get/ \
    && java -cp ${JMETER_HOME}/lib/ext/jmeter-plugins-manager-${JMETER_PLUGINS_MANAGER_VERSION}.jar \
    org.jmeterplugins.repository.PluginManagerCMDInstaller \
    && chmod +x ${JMETER_HOME}/bin/PluginsManagerCMD.sh

# Set default logging level    
RUN sed -i '/<Logger name="org.apache.jmeter.junit" level="debug" \/>/a \    <Logger name="org.apache.jmeter.protocol.http.sampler.HTTPSamplerBase" level="info" additivity="false"\/>' \
    ${JMETER_HOME}/bin/log4j2.xml

# Install JMeter plugins
RUN echo "${JMETER_PLUGINS}" | tr ',' '\n' | \
    parallel -j 5 "${JMETER_HOME}/bin/PluginsManagerCMD.sh install {}"

# Install Tika
RUN curl -sSO --output-dir ${JMETER_HOME}/lib https://repo1.maven.org/maven2/org/apache/tika/tika-app/1.28.5/tika-app-1.28.5.jar

# Set STS to startup by default
RUN sed -i '$ajmeterPlugin.sts.loadAndRunOnStartup=true \njmeterPlugin.sts.port=9191 \njmeterPlugin.sts.daemon=false \njsr223.init.file=/opt/jmeter/bin/simple-table-server.groovy' ${JMETER_HOME}/bin/user.properties

# Set report defaults
RUN sed -i '$ajmeter.reportgenerator.report_title="MAVIS test report" \njmeter.reportgenerator.overall_granularity=10000 \njmeter.reportgenerator.sample_filter="^.*[^0-9]$"' ${JMETER_HOME}/bin/user.properties

# Create blank data files for STS
RUN cd /opt/jmeter/bin && touch consents.txt && touch vaccinations.txt

ENTRYPOINT ["/bin/bash"]


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

ENTRYPOINT ["/bin/bash"]

# K6 Performance Testing for MAVIS Application

This repository contains k6 load tests for the MAVIS application. It provides a comprehensive testing suite to evaluate the performance, scalability, and reliability of the MAVIS system under various load conditions.

## Setup Instructions

### Prerequisites

- **mise**: Tool version manager ([Installation guide](https://mise.jdx.dev/getting-started.html))
- **Operating System**: Linux or macOS (Windows users may need manual k6 installation)

### Quick Setup

Run the automated setup script to install all dependencies:

```bash
./scripts/setup.sh
```

This script will:
- Install tools using `mise install` (based on `.tool-versions`)
- Install k6 version 1.3.0 from Grafana
- Set up mitmproxy Docker container for traffic recording and analysis
- Install Node.js packages

### Manual Setup
If you prefer to set up manually or encounter issues with the automated script:

#### 1. Install mise and Node.js
```bash
# Install mise if not already installed
curl https://mise.run | sh

# Install tools in .tool-versions
mise install
```

#### 2. Install k6
Choose your platform as documented on the [k6 website](https://grafana.com/docs/k6/latest/set-up/install-k6/):

##### Linux (Ubuntu/Debian)
Run the following commands one by one:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6=1.3.0
```

##### macOS
```bash
brew install grafana/k6/k6@1.3.0
```

##### Windows
Download from [k6 releases](https://github.com/grafana/k6/releases/tag/v1.3.0)

#### 3. Install Node.js Dependencies
```bash
npm install
```

## Project Structure

```
k6_performance/
├── scripts/
│   └── setup.sh          # Automated setup script
├── src/                  # TypeScript source files
│   ├── index.ts          # Main test file
│   └── utils/
│       └── constants.ts  # Configuration constants
├── dist/                 # Compiled JavaScript output
│   ├── test.js          # Compiled test file
│   └── test.js.map      # Source map
├── node_modules/         # Node.js dependencies
├── .tool-versions        # Tool version specifications
├── .node-version         # Node.js version
├── .gitignore           # Git ignore rules
├── package.json         # Node.js project configuration
├── package-lock.json    # Dependency lock file
├── rollup.config.js     # Rollup build configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Running Tests

This project uses TypeScript for k6 tests with automatic compilation. You have several options:

### Using npm scripts (Recommended)
```bash
# Build and run tests in one command
npm test

# Just build the TypeScript files
npm run build

# Type check without building
npm run typecheck
```

### Using k6 directly
```bash
# First build the TypeScript files
npm run build

# Then run the compiled JavaScript
k6 run dist/test.js

# Run with custom options
k6 run --vus 10 --duration 60s dist/test.js
```

### Development workflow
```bash
# 1. Edit TypeScript files in src/
# 2. Build and test
npm test

# Or build separately
npm run build
k6 run dist/test.js
```

### Example: Updating MAVIS Base URL
```typescript
// src/utils/constants.ts
export const MAVIS_BASE_URL = 'https://your-mavis-instance.com'
```

### Example: Adjusting Load Test Options
See [k6 options](https://grafana.com/docs/k6/latest/using-k6/k6-options/)
```typescript
// src/index.ts
export const options = {
    vus: 10,        // Number of virtual users
    duration: '5m', // Test duration
};
```

## Monitoring and Results

k6 provides various output options:
- Console output (default)
- Data export to cloudwatch ⇒ Pending implementation
- Grafana dashboards for visualization ⇒ Pending implementation

## Debugging & Traffic Recording with mitmproxy
Unfortunately, k6 does not have built-in support for debugging and traffic recording. Therefore, we will need to set up
a man-in-the-middle proxy to intercept our traffic (HTTP & HTTPS) to record our traffic.

### Setup

You can use mitmproxy to capture and analyze both the HTTP & HTTPS requests made by your k6 tests. To enable https we
need to use a self-signed certificate and add it to the trusted certificates. Luckily for us the 
[docker image](https://hub.docker.com/r/mitmproxy/mitmproxy/) will automatically generate a certificates for us,
so all we need to do is add it to the trusted certificates.

The easiest approach is simply to start the container once and shut it down to generate the certificates. You can use 
the one-liner below to do this.
```bash
# Start mitmproxy via Docker and save traffic to a file
docker run --rm -d -v ~/.mitmproxy:/home/mitmproxy/.mitmproxy -p 8080:8080 \
--name mitmproxy-setup mitmproxy/mitmproxy mitmdump -w /dev/null && \
docker ps -q --filter "ancestor=mitmproxy/mitmproxy" | xargs -r docker stop
```
Now you should have a directory `~/.mitmproxy` with certificate files inside `mitmproxy-ca-cert.pem` in it. To add it to
your trusted certificates you can just run

**Linux**(Ubuntu/Debian)
```bash
sudo cp ~/.mitmproxy/mitmproxy-ca-cert.pem /usr/local/share/ca-certificates/mitmproxy.crt
sudo update-ca-certificates
```
**macOS**
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/.mitmproxy/mitmproxy-ca-cert.cer
```

### Using mitmproxy for Traffic Recording
The easiest way to enable mitmproxy for all calls from your terminal is to set the environment variables
```bash
export HTTP_PROXY=http://127.0.0.1:8080
export http_proxy=http://127.0.0.1:8080 # For macOS
export HTTPS_PROXY=http://127.0.0.1:8080
 ```
now any tool that respects these environment variables (k6, curl, wget, npm, etc.) will automatically route traffic
through your proxy. This means that no changes are needed on k6 side to start capturing traffic.

To start the mitmproxy setup you can run it in interactive mode with the following command:
```bash
docker run --rm -it -v ~/.mitmproxy:/home/mitmproxy/.mitmproxy -p 8080:8080 --name interactive mitmproxy/mitmproxy mitmproxy
```

## Resources

- [k6 Documentation](https://grafana.com/docs/)
- [k6 JavaScript API](https://grafana.com/docs/k6/latest/javascript-api/)
- [mise Documentation](https://mise.jdx.dev/)
- [mitmproxy Documentation](https://docs.mitmproxy.org/stable/)
- [mitmproxy Docker Image](https://hub.docker.com/r/mitmproxy/mitmproxy/)

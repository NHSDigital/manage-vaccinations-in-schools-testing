#!/bin/bash

# Setup script for k6 Performance Testing Repository
# This script installs all required dependencies for running k6 load tests

set -e

echo "🚀 Setting up k6 Performance Testing environment..."

echo "📦 Installing tools via mise..."
mise install

echo "🔧 Installing k6 version 1.3.0..."
if command -v k6 &> /dev/null && [[ "$(k6 version 2>&1 | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+')" == "v1.3.0" ]]; then
    echo "✅ k6 v1.3.0 is already installed"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Installing k6 for Linux..."
        sudo gpg -k
        sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6=1.3.0
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Installing k6 for macOS..."
        if command -v brew &> /dev/null; then
            brew install k6@1.3.0 || brew install grafana/k6/k6@1.3.0
        else
            echo "❌ Homebrew not found. Please install Homebrew first."
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Please install k6 v1.3.0 manually from https://grafana.com/docs/k6/latest/set-up/install-k6/"
        exit 1
    fi
fi

echo "🔧 Setting up mitmproxy (Docker)..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    echo "Pulling mitmproxy Docker image..."
    docker pull mitmproxy/mitmproxy@sha256:4ff0437c5cd20babca7b1a563391fc609e66ef93bca60c98d191bdd439809afb
    echo "✅ mitmproxy Docker image ready"
else
    echo "❌ Docker not found. Please install Docker to use mitmproxy."
    echo "   Visit: https://docs.docker.com/get-docker/"
    echo "   mitmproxy will run via Docker: docker run --rm -it -p 8080:8080 mitmproxy/mitmproxy"
fi

if [[ -f "package.json" ]]; then
    echo "📦 Installing Node.js packages..."
    npm install
else
    echo "ℹ️  No package.json found, skipping npm install"
fi

echo "✅ Setup complete! You can now run k6 load tests."
echo "🔍 Verify installation:"
echo "  - k6 version: $(k6 version 2>/dev/null || echo 'k6 not found')"
echo "  - Node.js version: $(node --version 2>/dev/null || echo 'Node.js not found')"
echo "  - npm version: $(npm --version 2>/dev/null || echo 'npm not found')"
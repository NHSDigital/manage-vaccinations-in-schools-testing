"""
Entry point for running the CarePlus mock SOAP service.

Usage:
    python -m mavis.test.mocks.careplus [--host 127.0.0.1] [--port 8080]
      [--site-namespace MOCK]

WSDL is served at:  GET <path>?wsdl
Endpoint is at:     POST <path>
Healthcheck is at:  GET /health
"""

import argparse
import logging
from http.server import HTTPServer

from mavis.test.mocks.careplus import (
    Config,
    SOAPHandler,
    build_service_path,
)

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8080
DEFAULT_SITE_NAMESPACE = "MOCK"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="Mock SCHImmsService SOAP server")
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--site-namespace", default=DEFAULT_SITE_NAMESPACE)
    args = parser.parse_args()

    path = build_service_path(args.site_namespace)

    config: Config = {
        "host": args.host,
        "port": args.port,
        "path": path,
    }

    server = HTTPServer((args.host, args.port), SOAPHandler.make_handler(config))
    log.info(
        "SOAP mock service listening on http://%s:%d%s", args.host, args.port, path
    )
    log.info("WSDL at http://%s:%d%s?wsdl", args.host, args.port, path)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Shutting down")


if __name__ == "__main__":
    main()

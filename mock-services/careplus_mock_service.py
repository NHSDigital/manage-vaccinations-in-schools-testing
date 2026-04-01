#!/usr/bin/env python3
"""
Minimal mock SOAP service that implements the SchImmsService / InsertImmsRecord
endpoint described in the CarePlus WSDL.

Usage:
    python soap_mock_service.py [--host 127.0.0.1] [--port 8080]
  [--site-namespace MOCK]

WSDL is served at:  GET <path>?wsdl
Endpoint is at:     POST <path>
Healthcheck is at:  GET /health
"""

import argparse
import csv
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
from io import StringIO
from typing import TypedDict, cast

from defusedxml import ElementTree

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (overridden by CLI args at startup)
# ---------------------------------------------------------------------------
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8080
DEFAULT_NAMESPACE_BASE = "https://careplus.syhapp.thirdparty.nhs.uk"
DEFAULT_SITE_NAMESPACE = "MOCK"


class Config(TypedDict):
    host: str
    port: int
    site_namespace: str
    namespace: str
    path: str


_config = cast("Config", {})


def _build_target_namespace(site_namespace: str) -> str:
    return f"{DEFAULT_NAMESPACE_BASE}/{site_namespace}/webservices"


def _build_service_path(site_namespace: str) -> str:
    return f"/{site_namespace}/soap.SchImms.cls"


def _split_request_target(request_target: str) -> tuple[str, str]:
    path, _, query = request_target.partition("?")
    return path, query.lower()


# ---------------------------------------------------------------------------
# SOAP / XML helpers
# ---------------------------------------------------------------------------


def _build_wsdl(host: str, port: int, namespace: str, path: str) -> str:
    location = f"http://{host}:{port}{path}"
    soap_action = f"{namespace}/soap.SchImms.InsertImmsRecord"
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<definitions
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:s="http://www.w3.org/2001/XMLSchema"
    xmlns:s0="{namespace}"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    targetNamespace="{namespace}">

  <types>
    <s:schema elementFormDefault="qualified" targetNamespace="{namespace}">
      <s:element name="InsertImmsRecord">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" name="strUserId" type="s:string"/>
            <s:element minOccurs="0" name="strPwd" type="s:string"/>
            <s:element minOccurs="0" name="strPayload" type="s:string"/>
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="InsertImmsRecordResponse">
        <s:complexType>
          <s:sequence>
            <s:element name="InsertImmsRecordResult" type="s:string"/>
          </s:sequence>
        </s:complexType>
      </s:element>
    </s:schema>
  </types>

  <message name="InsertImmsRecordSoapIn">
    <part name="parameters" element="s0:InsertImmsRecord"/>
  </message>
  <message name="InsertImmsRecordSoapOut">
    <part name="parameters" element="s0:InsertImmsRecordResponse"/>
  </message>

  <portType name="SchImmsServiceSoap">
    <operation name="InsertImmsRecord">
      <input message="s0:InsertImmsRecordSoapIn"/>
      <output message="s0:InsertImmsRecordSoapOut"/>
    </operation>
  </portType>

  <binding name="SchImmsServiceSoap" type="s0:SchImmsServiceSoap">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http" style="document"/>
    <operation name="InsertImmsRecord">
      <soap:operation soapAction="{soap_action}" style="document"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="SchImmsService">
    <port name="SchImmsServiceSoap" binding="s0:SchImmsServiceSoap">
      <soap:address location="{location}"/>
    </port>
  </service>

</definitions>"""


def _soap_response(namespace: str, result: str) -> bytes:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:s0="{namespace}">
  <soap:Body>
    <s0:InsertImmsRecordResponse>
      <s0:InsertImmsRecordResult>{result}</s0:InsertImmsRecordResult>
    </s0:InsertImmsRecordResponse>
  </soap:Body>
</soap:Envelope>""".encode()


def _soap_fault(code: str, message: str) -> bytes:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>{code}</faultcode>
      <faultstring>{message}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>""".encode()


# ---------------------------------------------------------------------------
# Business logic
# ---------------------------------------------------------------------------


class InsertImmsRecordError(Exception):
    pass


def _validate_csv_payload(payload: str) -> None:
    try:
        rows = list(csv.reader(StringIO(payload)))
    except csv.Error as exc:
        reason = f"Invalid CSV with error: {exc}"
        raise InsertImmsRecordError(reason) from exc

    expected_entries = None
    non_empty_row_count = 0
    for row_number, row in enumerate(rows, start=1):
        if not any(cell.strip() for cell in row):
            continue

        non_empty_row_count += 1
        entry_count = len(row)
        if expected_entries is None:
            expected_entries = entry_count
            continue

        if entry_count != expected_entries:
            reason = (
                f"Invalid CSV: row {row_number} has {entry_count} entries; "
                f"expected {expected_entries}"
            )
            raise InsertImmsRecordError(reason)

    if non_empty_row_count == 0:
        reason = "Invalid CSV: payload must contain at least one non-empty row"
        raise InsertImmsRecordError(reason)


def handle_insert_imms_record(user_id: str, pwd: str, payload: str) -> str:
    """
    Called for every valid InsertImmsRecord request.

    Args:
        user_id:  value of strUserId
        pwd:      value of strPwd
        payload:  value of strPayload (CSV string)

    Returns:
      The plain response text returned in InsertImmsRecordResult.
      Return "1" to signal success.

    Raises:
        InsertImmsRecordError: If the request payload is invalid.
    """
    if not user_id.strip():
        reason = "Missing user ID"
        raise InsertImmsRecordError(reason)

    if not pwd.strip():
        reason = "Missing password"
        raise InsertImmsRecordError(reason)

    _validate_csv_payload(payload)

    return "1"


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------


class SOAPHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        log.info("HTTP %s", format % args)

    def _is_configured_path(self) -> bool:
        request_path, _ = _split_request_target(self.path)
        return request_path == _config["path"]

    # ------------------------------------------------------------------
    # GET — serve the WSDL
    # ------------------------------------------------------------------
    def do_GET(self) -> None:
        request_path, query = _split_request_target(self.path)
        if request_path == "/health" and not query:
            body = b"ok"
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if request_path != _config["path"]:
            self.send_response(404)
            self.end_headers()
            return

        if query == "wsdl":
            wsdl = _build_wsdl(
                _config["host"],
                _config["port"],
                _config["namespace"],
                _config["path"],
            )
            body = wsdl.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/xml; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    # ------------------------------------------------------------------
    # POST — handle SOAP requests
    # ------------------------------------------------------------------
    def do_POST(self) -> None:
        if not self._is_configured_path():
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)

        try:
            root = ElementTree.fromstring(body)
        except ElementTree.ParseError as exc:
            self._send_xml(400, _soap_fault("soap:Client", f"Malformed XML: {exc}"))
            return

        namespace = _config["namespace"]
        insert_el = root.find(f".//{{{namespace}}}InsertImmsRecord")
        if insert_el is None:
            self._send_xml(
                400,
                _soap_fault("soap:Client", "InsertImmsRecord element not found"),
            )
            return

        user_id = insert_el.findtext(f"{{{namespace}}}strUserId") or ""
        pwd = insert_el.findtext(f"{{{namespace}}}strPwd") or ""
        payload = insert_el.findtext(f"{{{namespace}}}strPayload") or ""

        try:
            result = handle_insert_imms_record(user_id, pwd, payload)
        except InsertImmsRecordError as exc:
            log.warning("InsertImmsRecord rejected for user=%r: %s", user_id, exc)
            self._send_xml(400, _soap_fault("soap:Client", str(exc)))
            return

        self._send_xml(200, _soap_response(namespace, result))

    def _send_xml(self, status: int, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "text/xml; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description="Mock SchImmsService SOAP server")
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--site-namespace", default=DEFAULT_SITE_NAMESPACE)
    args = parser.parse_args()

    namespace = _build_target_namespace(args.site_namespace)
    path = _build_service_path(args.site_namespace)

    _config.update(
        {
            "host": args.host,
            "port": args.port,
            "site_namespace": args.site_namespace,
            "namespace": namespace,
            "path": path,
        }
    )

    server = HTTPServer((args.host, args.port), SOAPHandler)
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

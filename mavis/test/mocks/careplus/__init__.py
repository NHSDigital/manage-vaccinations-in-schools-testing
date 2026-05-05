"""Minimal mock SOAP service implementing the SCHImmsService / InsertImmsRecord
endpoint described in the CarePlus WSDL.
"""

import csv
import logging
from http.server import BaseHTTPRequestHandler
from io import StringIO
from typing import TypedDict

from defusedxml import ElementTree

log = logging.getLogger(__name__)

CAREPLUS_BASE_URL = "http://careplus.syhapp.thirdparty.nhs.uk"


class Config(TypedDict):
    host: str
    port: int
    path: str


def build_service_path(site_namespace: str) -> str:
    return f"/{site_namespace}/soap.SCHImms.cls"


def _split_request_target(request_target: str) -> tuple[str, str]:
    path, _, query = request_target.partition("?")
    return path, query.lower()


def _build_wsdl(config: Config) -> str:
    location = f"http://{config['host']}:{config['port']}{config['path']}"
    soap_action = f"{CAREPLUS_BASE_URL}/soap.SCHImms.InsertImmsRecord"
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<definitions
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:s="http://www.w3.org/2001/XMLSchema"
    xmlns:s0="{CAREPLUS_BASE_URL}"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    targetNamespace="{CAREPLUS_BASE_URL}">

  <types>
    <s:schema elementFormDefault="qualified" targetNamespace="{CAREPLUS_BASE_URL}">
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

  <portType name="SCHImmsServiceSoap">
    <operation name="InsertImmsRecord">
      <input message="s0:InsertImmsRecordSoapIn"/>
      <output message="s0:InsertImmsRecordSoapOut"/>
    </operation>
  </portType>

  <binding name="SCHImmsServiceSoap" type="s0:SCHImmsServiceSoap">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http" style="document"/>
    <operation name="InsertImmsRecord">
      <soap:operation soapAction="{soap_action}" style="document"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="SCHImmsService">
    <port name="SCHImmsServiceSoap" binding="s0:SCHImmsServiceSoap">
      <soap:address location="{location}"/>
    </port>
  </service>

</definitions>"""


def _soap_response(result: str) -> bytes:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:s0="{CAREPLUS_BASE_URL}">
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


class SOAPHandler(BaseHTTPRequestHandler):
    config: Config

    @classmethod
    def make_handler(cls, config: Config) -> type["SOAPHandler"]:
        return type(cls.__name__, (cls,), {"config": config})

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        log.info("HTTP %s", format % args)

    def _is_configured_path(self) -> bool:
        request_path, _ = _split_request_target(self.path)
        return request_path == self.config["path"]

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

        if request_path != self.config["path"]:
            self.send_response(404)
            self.end_headers()
            return

        if query == "wsdl":
            wsdl = _build_wsdl(self.config)
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

        insert_el = root.find(f".//{{{CAREPLUS_BASE_URL}}}InsertImmsRecord")
        if insert_el is None:
            self._send_xml(
                400,
                _soap_fault("soap:Client", "InsertImmsRecord element not found"),
            )
            return

        user_id = insert_el.findtext(f"{{{CAREPLUS_BASE_URL}}}strUserId") or ""
        pwd = insert_el.findtext(f"{{{CAREPLUS_BASE_URL}}}strPwd") or ""
        payload = insert_el.findtext(f"{{{CAREPLUS_BASE_URL}}}strPayload") or ""

        try:
            result = handle_insert_imms_record(user_id, pwd, payload)
        except InsertImmsRecordError as exc:
            log.warning("InsertImmsRecord rejected for user=%r: %s", user_id, exc)
            self._send_xml(400, _soap_fault("soap:Client", str(exc)))
            return

        self._send_xml(200, _soap_response(result))

    def _send_xml(self, status: int, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "text/xml; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

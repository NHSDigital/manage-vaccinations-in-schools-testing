#!/usr/bin/env python3
"""
Python equivalent of the JMeter vaccination processing script.
Processes Excel files with vaccination data and generates parent information.
"""

import sys
import io
import csv
import os
import string
import random
import logging
import requests
import base64
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Optional
from openpyxl import load_workbook
from openpyxl.workbook import Workbook
from openpyxl.worksheet.worksheet import Worksheet
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
log = logging.getLogger(__name__)


def random_string(length=9):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(length))


def random_digits(length=3):
    return ''.join(random.choice(string.digits) for _ in range(length))


def excel_str(value) -> str:
    if pd.isna(value):  # Handles NaN, None, pd.NA, etc.
        return ""
    return str(value).strip()


def get_xlsx_file(http_session, endpoint: str, headers: Dict[str, str], filename: str):
    try:
        log.info(f"Downloading Excel file from {endpoint}")
        response = http_session.get(endpoint, headers=headers, timeout=30)
        response.raise_for_status()

        # Ensure data directory exists
        os.makedirs("data", exist_ok=True)

        # Save file to data directory
        file_path = os.path.join("data", filename)
        with open(file_path, 'wb') as f:
            f.write(response.content)

        log.info(f"Successfully downloaded {filename} to {file_path}")
        return file_path

    except requests.RequestException as e:
        log.error(f"Failed to download from {endpoint}: {e}")
        raise
    except Exception as e:
        log.error(f"Error saving file {filename}: {e}")
        raise


def process_xlsx(filename, output_dir, session_id, counters):
    data_directory = Path(output_dir)
    data_directory.mkdir(exist_ok=True)

    # Open CSV files once (append mode in case script is run multiple times)
    csv_files = {
        "flu": data_directory / "flu-vaccination-data.csv",
        "hpv": data_directory / "hpv-vaccination-data.csv",
        "menacwy": data_directory / "menacwy-vaccination-data.csv",
        "td_ipv": data_directory / "td_ipv-vaccination-data.csv",
    }

    programme_mapping = {
        "3-in-1": "td_ipv",
        "acwyx4": "menacwy",
    }

    # Columns of Excel files
    required_cols = [
        "PERSON_FORENAME", "PERSON_SURNAME", "PERSON_DOB", "PERSON_ADDRESS_LINE_1",
        "PERSON_POSTCODE", "CONSENT_DETAILS", "VACCINATED", "PROGRAMME"
    ]

    # Columns of produced csv files (lowercase for python convention)
    CSV_HEADERS = [
        "programme", "forename", "surname", "dob", "address_line_1", "postcode",
        "parent_name", "parent_relationship", "parent_email", "parent_phone", "session_id"
    ]

    df = pd.read_excel(filename, sheet_name="Vaccinations", engine="openpyxl")

    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise KeyError(f"Missing columns in Excel: {missing}")

    # Counters (for logging)
    total_written = 0

    for prog, path in csv_files.items():
        if not path.exists():
            pd.DataFrame(columns=CSV_HEADERS).to_csv(path, index=False)

    # Process each row
    for idx, row in df.iterrows():
        if excel_str(row["PERSON_FORENAME"]) == "PERSON_FORENAME":
            continue

        # Extract and clean values
        forename = excel_str(row["PERSON_FORENAME"])
        surname = excel_str(row["PERSON_SURNAME"])
        dob = pd.to_datetime(row["PERSON_DOB"]).strftime("%Y-%m-%d") if pd.notna(row["PERSON_DOB"]) else ""
        address = excel_str(row["PERSON_ADDRESS_LINE_1"])
        postcode = excel_str(row["PERSON_POSTCODE"])
        consent = excel_str(row["CONSENT_DETAILS"])
        vaccinated = excel_str(row["VACCINATED"])
        programme_raw = excel_str(row["PROGRAMME"]).lower()

        # Normalise programme
        programme = programme_mapping.get(programme_raw, programme_raw)

        # Decision logic — exactly as in original Groovy
        ready_for_consent = (consent == "")
        ready_for_vaccination = (vaccinated == "")

        if not ready_for_consent and ready_for_vaccination:
            # Generate fake parent data
            rand_str = random_string(9)
            rand_num = random_digits(3)

            parent_name = f"{rand_str} {surname}"
            parent_email = f"{rand_str}.{surname}@example.com".lower()
            parent_phone = f"07700 900{rand_num}"

            record = {
                "programme": programme,
                "forename": forename,
                "surname": surname,
                "dob": dob,
                "address_line_1": address,
                "postcode": postcode,
                "parent_name": parent_name,
                "parent_relationship": "father",
                "parent_email": parent_email,
                "parent_phone": parent_phone,
                "session_id": session_id
            }

            # Write directly to correct CSV
            filename = csv_files.get(programme)
            if filename:
                pd.DataFrame([record]).to_csv(filename, mode='a', header=False, index=False)
                counters[programme] += 1
                total_written += 1

    print(f"Processing complete for session ID: {session_id}, found {total_written} eligible vaccinations.")
    print(f"Total records written: ("
          f" Flu : {counters['flu']}",
          f" HPV: {counters['hpv']}",
          f" MenACWY: {counters['menacwy']}",
          f" Td/IPV: {counters['td_ipv']})\n")


def process_endpoints(base_url: str, http_session, session_id_list: List[str], auth_headers: Dict[str, str],
                      output_dir: str) -> None:
    """
    Process multiple endpoints with Excel files and generate programme-based CSV files.

    Args:
        endpoints: List of endpoint URLs to download Excel files from
        auth_headers: Single authorization header JSON to apply to all endpoints
    """

    # Download and process all Excel files
    counters = {"flu": 0, "hpv": 0, "menacwy": 0, "td_ipv": 0}
    for i, session_id in enumerate(session_id_list):
        endpoint = f"https://{base_url}/sessions/{session_id}.xlsx"
        try:
            filename = f"download_{i + 1}.xlsx"
            file_path = get_xlsx_file(http_session, endpoint, auth_headers, filename)

            process_xlsx(file_path, output_dir, session_id, counters)

        except Exception as e:
            log.error(f"Error processing endpoint {endpoint}: {e}")
            continue


def get_auth_headers(base_url, basic_auth_user, basic_auth_password, user):
    import re

    credentials = f"{basic_auth_user}:{basic_auth_password}"
    encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
    auth_headers = {
        "Authorization": f"Basic {encoded_credentials}"
    }
    http_session = requests.Session()  # Get the login page to extract authenticity token
    response = http_session.get(f"https://{base_url}/users/sign-in", headers=auth_headers, timeout=30)
    response.raise_for_status()

    form_token_match = re.search(r'<input type="hidden" name="authenticity_token" value="([^"]+)"', response.text)
    if form_token_match:
        authenticity_token = form_token_match.group(1)
    else:
        raise ValueError("Could not find authenticity token in login page")
    login_data = {
        'authenticity_token': authenticity_token,
        'user[email]': user,
        'user[password]': user,
    }

    login_headers = {
        "Authorization": f"Basic {encoded_credentials}",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': f"{base_url}/users/sign-in",
    }
    http_session.post(f"https://{base_url}/users/sign-in",
                      headers=login_headers,
                      data=login_data,
                      timeout=30,
                      allow_redirects=True)

    # Return session headers with cookies for subsequent requests
    return http_session, login_headers


def get_session_ids(base_url, http_session, auth_headers):
    """
    Get session IDs by parsing HTML response from /sessions endpoint.
    
    Args:
        base_url: Base URL of the application
        auth_headers: Authentication headers for the request
        sessions_filters: Optional query string filters for sessions
    
    Returns:
        List of session IDs as quoted strings
    """
    import re

    # Make GET request to sessions endpoint
    sessions_url = f"https://{base_url}/sessions"
    try:
        response = http_session.get(sessions_url, headers=auth_headers, timeout=30)
        response.raise_for_status()

        # Extract session data using regex pattern from JavaScript
        # Pattern matches: sessions/(sessionId)" followed by up to 400 chars then nhsuk-tag--white">(vaccine)</
        session_regex = r'sessions/(.*?)"[\s\S]{1,400}?nhsuk-tag nhsuk-tag--white">(.*?)<'

        all_sessions = []
        matches = re.findall(session_regex, response.text)

        for match in matches:
            session_id = match[0]
            session_vaccine = match[1]
            all_sessions.append({
                'sessionId': session_id,
                'sessionVaccine': session_vaccine
            })

        # Return session IDs as quoted strings (matching JavaScript logic)
        session_ids = [f'{session["sessionId"]}' for session in all_sessions]

        log.info(f"Found {len(session_ids)} sessions")
        return session_ids

    except Exception as e:
        log.error(f"Error getting session IDs from {sessions_url}: {e}")
        return []


def main():
    """Main function to demonstrate usage."""
    if len(sys.argv) < 5:
        print("Usage:")
        print("  python vaccination_processor.py <base_url> <basic_auth_user> <basic_auth_password> <user_email>")
        print("")
        print("Example:")
        print('  python vaccination_processor.py qa.example.com admin password123 user@example.com')
        sys.exit(1)

    # Check if running in endpoints mode (4 parameters)
    import json

    for csv_path in Path("data").glob("*-vaccination-data.csv"):
        csv_path.unlink(missing_ok=True)

    try:
        # Parse command line arguments
        base_url = sys.argv[1]
        basic_auth_user = sys.argv[2]
        basic_auth_password = sys.argv[3]
        user = sys.argv[4]

        http_session, login_headers = get_auth_headers(base_url, basic_auth_user, basic_auth_password, user)
        session_id_list = get_session_ids(base_url, http_session, login_headers)
        # Process endpoints with shared authorization headers
        process_endpoints(base_url, http_session, session_id_list, login_headers, "data")
        return

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error in endpoints mode: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

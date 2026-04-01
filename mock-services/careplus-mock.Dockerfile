FROM python:3.13-slim

WORKDIR /app

COPY mock-services/careplus_mock_service.py /app/careplus_mock_service.py

RUN pip install --no-cache-dir defusedxml

EXPOSE 8080

CMD ["python", "/app/careplus_mock_service.py", "--host", "0.0.0.0", "--port", "8080", "--site-namespace", "MOCK"]

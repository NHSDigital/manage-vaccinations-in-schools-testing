FROM python:3.13-slim

WORKDIR /app

COPY mavis/__init__.py mavis/__init__.py
COPY mavis/test/__init__.py mavis/test/__init__.py
COPY mavis/test/mocks/ mavis/test/mocks/

RUN pip install --no-cache-dir defusedxml

EXPOSE 8080

CMD ["python", "-m", "mavis.test.mocks.careplus", "--host", "0.0.0.0", "--port", "8080", "--site-namespace", "MOCK"]

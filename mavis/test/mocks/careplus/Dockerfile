FROM python:3.13-slim

WORKDIR /app

COPY mavis/ mavis/

RUN pip install --no-cache-dir defusedxml

EXPOSE 8080

CMD ["python", "-m", "mavis.test.mocks.careplus", "--host", "0.0.0.0", "--port", "8080", "--site-namespace", "MOCK"]

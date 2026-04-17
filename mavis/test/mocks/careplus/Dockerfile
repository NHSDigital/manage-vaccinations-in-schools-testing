FROM python:3.13-slim

WORKDIR /app

# Empty __init__.py stubs are needed to make `mavis.test.mocks.careplus` a
# valid dotted package path. We cannot copy the real mavis/test/__init__.py
# because it imports from mavis.test.fixtures, which depends on pytest.
RUN mkdir -p mavis/test
RUN touch mavis/__init__.py mavis/test/__init__.py
COPY mavis/test/mocks/ mavis/test/mocks/

RUN pip install --no-cache-dir defusedxml

EXPOSE 8080

CMD ["python", "-m", "mavis.test.mocks.careplus", "--host", "0.0.0.0", "--port", "8080", "--site-namespace", "MOCK"]

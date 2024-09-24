import pytest
from libs import CurrentExecution as ce

@pytest.fixture
def setup():
    p = ce.start_execution()
    yield p
    ce.end_execution()

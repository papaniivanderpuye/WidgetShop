# conftest.py
import os
import sys
import pytest
from flask import url_for

sys.path.insert(0, os.path.dirname(
    os.path.realpath(__file__)) + '/../')
from main import app as application


@pytest.fixture
def app():
    app = application()
    return app

    def test_index(client):
        res = client.get(url_for('app.index'))
        assert res.status_code == 200

    def test_empty_db(client):
        """Start with a blank database."""

        rv = client.get('/')
        assert b'No entries here so far' in rv.data

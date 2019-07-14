#!/usr/bin/python2.7
'''
Automation Team KPI API
'''
import argparse
import datetime
import logging
import logging.config
import os
import random
import sys
# Auth Requirements
from functools import wraps

import deprecation
from flask import (Flask, abort, jsonify, make_response, redirect,
                   render_template, request, send_file, url_for)

# Auto KPI Requirements
sys.path.insert(0, os.path.dirname(
    os.path.realpath(__file__)) + '/../')
import server.application as autokpi_app
from server.adapters.mysql_adapter import MysqlAdapter
from server.common import get_auth_context, log_error, log_exception
from server.config.config import Config
from server.domain import Widget
from server.exceptions import *
from server.handlers import (Context, WidgetHandler)
from server.utils import get_version


# Flask requirements


'''APP CONFIG'''
PARSER = argparse.ArgumentParser(description='TESLAB API')
PARSER.add_argument('-p', '--port', dest='port',
                    type=int, help='Port', default=1996)
PARSER.add_argument('-d', '--development', dest='environ',
                    help='Force development environment',
                    action='store_true')
ARGS = PARSER.parse_args()

CONFIG = Config.Development()
logging.config.dictConfig(CONFIG.LOG_CONFIG)
LOGGER = logging.getLogger('autokpi')
LOGGER.info("Starting AutoKPI Application")

# Version 1 Route
version_route = 'v1'


def get_handlers():
    context = Context()
    adapter = MysqlAdapter(CONFIG.DB_CONN)
    context.widget = WidgetHandler(adapter)
    context.response = ResponseHandler()
    return context


# Set global handlers to prevent too many connections
HANDLER = get_handlers()

app = Flask(__name__,
            static_folder="../static/dist",
            template_folder="../static")

@app.route('/' + version_route + '/project/', methods=['POST'])
def create_project():
    try:
        type = _get_param(request, 'type')
        color = _get_param(request, 'color', None)
        quantity = _get_param(request, 'quantity', None)
        date_needed_by = _get_param(request, 'date_needed_by', None)

        widget = autokpi_app.map_data_to_obj(
            Widget,
            type=type,
            color=color,
            quantity=quantity,
            date_needed_by=date_needed_by
        )
        results = autokpi_app.create_widget_order(
            HANDLER, widget, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'widget')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'widget')

@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
@app.route('/<path:path>', methods=['GET', 'POST'])
def index(path=None):
    resp = make_response(render_template(
        'index.html',
        user_ntid=user_ntid,
        user_fullname=user_fullname,
        user_email=user_email,
        rpm_ver=get_version()
    ))
    resp.headers.extend({
                         'orig_url': request.url_root})
    return resp

if __name__ == "__main__":
    app.run(host='localhost', port=ARGS.port, debug=True)

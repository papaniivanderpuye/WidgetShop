#!/usr/bin/python2.7

'''
Widget Shop API
'''
import argparse
import logging
import logging.config
import os
import sys
from datetime import datetime
from flask import (Flask, make_response,
                   render_template, request)

# Widget Shop Requirements
sys.path.insert(0, os.path.dirname(
    os.path.realpath(__file__)) + '/../')
import server.application as widget_app
from server.adapters.mysql_adapter import MysqlAdapter
from server.config.config import Config
from server.domain import WidgetOrder
from server.exceptions import *
from server.handlers import (
    Context, WidgetOrderHandler, ResponseHandler)


'''APP CONFIG'''
PARSER = argparse.ArgumentParser(description='WIDGET_APP API')
PARSER.add_argument('-p', '--port', dest='port',
                    type=int, help='Port', default=1996)
ARGS = PARSER.parse_args()

CONFIG = Config.Development()
logging.config.dictConfig(CONFIG.LOG_CONFIG)
LOGGER = logging.getLogger('widget_shop')
LOGGER.info("Starting Widget Shop Application")

# Version 1 Route
api = '/api'
version_route = '/v1'


def get_handlers():
    context = Context()
    adapter = MysqlAdapter(CONFIG.DB_CONN)
    context.widget_order = WidgetOrderHandler(adapter)
    context.response = ResponseHandler()
    return context


# Set global handlers to prevent too many connections
HANDLER = get_handlers()
app = Flask(__name__,
            static_folder="../static/dist",
            template_folder="../static")


@app.route(api + version_route + '/widget_order', methods=['POST'])
def create_widget_order():
    """ Create Widget Order.
    GET:
        Summary: create widget order endpoint.
        Description: save a widget order.
        Parameters:
        -----------
            - name: type
              in: json
              description: type of widget
              type: string
              required: true

            - name: color
              in: json
              description: color of widget
              type: string
              required: true

            - name: quantity
              in: json
              description: quantity of widgets
              type: int
              required: true

            - name: date_needed_by
                in: json
                description: date order should be delivered by
                type: string
                required: true
        Responses:
        ----------
            200:
                description: order saved, order number to be returned.
            404:
                order not saved, data is wrong.
    """

    try:
        type = _get_param(request, 'type', None)
        color = _get_param(request, 'color', None)
        quantity = _get_param(request, 'quantity', None)
        date_needed_by = _get_param(request, 'date_needed_by', None)

        widget_order = widget_app.map_data_to_obj(
            WidgetOrder,
            type=type,
            color=color,
            quantity=quantity,
            date_needed_by=date_needed_by
        )
        results = widget_app.create_widget_order(
            HANDLER, widget_order)
        return widget_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return widget_app.exception(HANDLER, GenericDatabaseException, request.method, 'widget')
    except Exception as err:
        LOGGER.exception(err)
        return widget_app.exception(HANDLER, GenericDatabaseException, request.method, 'widget')


@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
@app.route('/<path:path>', methods=['GET', 'POST'])
def index(path=None):
    """ Go To Home Page.
    GET/POST:
        Summary: This is the index function that returns the home page of the web app.
        Description:
        Parameters
        ----------
        path : str
            path of url. Adding this to redirect any wrong url path
            back to index(the default is None).

        Returns
        -------
        flask.wrappers.Response
            returns http response of index html page.

        """
    """ Go to HomePage.
        GET/POST:
            summary: goes to homepage.
            description: show homepage.
            Parameters:
            ----------
                - name: path
                  in: path
                  description: is any path other than the ones previously defined on the script
                  type: string
                  required: false

            Responses:
            ----------
                200:
                    showing homepage.
                404:
                    not showing homepage.
    """
    resp = make_response(render_template(
        'index.html'
    ))
    resp.headers.extend({
        'orig_url': request.url_root})
    return resp


def _get_param(req, param, default=None):
    """Gets Paramers or Json Data from request.

    Parameters
    ----------
    req : Flask.request
        request to get data from.
    param : str
        string name of the data to obtain.
    default : str/int/None
        Default object to return if data was not found (the default is None).

    Returns
    -------
    str/int/None
        returns data obtained from request.

    """
    """ Return param from incoming payload """
    if req.method == 'GET':
        if req.args:
            return req.args.get(param, default)
    else:
        if req.json:
            return req.json.get(param, default)
    return None


if __name__ == "__main__":
    app.run(host='localhost', port=ARGS.port, debug=True)

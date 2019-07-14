'''Common functions used for API

This provides functionality to be able to:
1) Authenticate User

Use the following methods in your blueprints:
get_auth_context
'''

import os
import sys
import linecache
import logging

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)) + '/../')

from server.adapters.auth import AuthClient
from server.adapters.http import HttpAdapter


LOGGER = logging.getLogger('autokpi')


def get_auth_context(client_id, client_secret, urls):
    return AuthClient(
        adapter=HttpAdapter(),
        client_id=client_id,
        client_secret=client_secret,
        urls=urls)

def log_exception():
    exc_type, exc_obj, tb = sys.exc_info()
    f = tb.tb_frame
    lineno = tb.tb_lineno
    filename = f.f_code.co_filename
    linecache.checkcache(filename)
    line = linecache.getline(filename, lineno, f.f_globals)
    exception = '\n\nException in \n{}, \nLine {}: "{}" \nexception: {}\n\n'.format(filename, lineno, line.strip(), exc_obj)
    LOGGER.exception(exception)

def log_error():
    exc_type, exc_obj, tb = sys.exc_info()
    f = tb.tb_frame
    lineno = tb.tb_lineno
    filename = f.f_code.co_filename
    linecache.checkcache(filename)
    line = linecache.getline(filename, lineno, f.f_globals)
    error = '\n\nError in \n{}, \nLine {}: "{}" \nerror: {}\n\n'.format(filename, lineno, line.strip(), exc_obj)
    LOGGER.error(error)

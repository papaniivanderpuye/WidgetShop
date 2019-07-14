'''
HTTP Adapter
'''

import json
import logging
import requests
import urllib3

from retrying import retry
from server.exceptions import *

LOGGER = logging.getLogger('autokpi')
DEFAULT_HEADERS = {'content-type': 'application/json'}

#Disable Un-secured HTTPS Warnings (https://urllib3.readthedocs.io/en/latest/advanced-usage.html#ssl-warnings)
urllib3.disable_warnings()


class HttpAdapter(object):
    '''HTTP Adapter class'''
    @retry(stop_max_attempt_number=5,
           wait_exponential_multiplier=1000)
    def post(self, url, payload, headers=DEFAULT_HEADERS):
        try:
            data = json.dumps(payload)
            if headers["content-type"] == "application/x-www-form-urlencoded":
                data = payload
            resp = requests.post(url, data=data,
                                 headers=headers,
                                 verify=False)
            if resp.status_code >= 500:
                LOGGER.error("%s received" % resp.status_code)
                raise Exception("Internal Server Error")
            elif resp.status_code in (400, 404):
                if resp.json()['error'] == 'invalid_grant':
                    LOGGER.error("Authorization code invalid..redirecting to login")
                    raise  AuthCodeMissingException('Invalid auth code')
                LOGGER.error("%s received" % resp.status_code)
                raise ValueError("Bad Request")
            return resp.json()
        except AuthCodeMissingException as err:
            LOGGER.error(err)
            raise AuthCodeMissingException("Could not reach URL: {}".format(url))
        except ValueError as err:
            LOGGER.error(err)
            raise ValueError("Bad request was made")
        except Exception as err:
            LOGGER.error(err)
            raise Exception("Could not reach URL: {}".format(url))


    @retry(stop_max_attempt_number=5,
           wait_exponential_multiplier=1000)
    def get(self, url, headers=DEFAULT_HEADERS, raise400=True):
        try:
            resp = requests.get(url, headers=headers, verify=False)
            if resp.status_code >= 500:
                LOGGER.error("%s received" % resp.status_code)
                raise Exception("Internal Server Error")
            if raise400 and resp.status_code in (400, 404):
                LOGGER.error("%s received" % resp.status_code)
                raise ValueError("Bad Request")
            return resp.json()
        except ValueError as err:
            LOGGER.error(err)
            raise ValueError(resp.status_code)
        except Exception as err:
            LOGGER.error(err)
            raise Exception("Could not reach URL: {}".format(url))

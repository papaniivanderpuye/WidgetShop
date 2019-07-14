import logging
import os
import sys

sys.path.insert(0, os.path.dirname(
    os.path.realpath(__file__)) + '/../')

from server.handlers.config import BaseConfigHandler


class Config(BaseConfigHandler):
    """Application configuration class.
    """
    class Production:
        ENV = 'p'
        DB_CONN = {
            'user': '!tesautomation',
            'password': 'C0mc4st!!',
            'host': 'autordb-cmc-1p.sys.comcast.net',
            'database': 'TES_PROJECTS',
            'charset': 'utf8'
        }
        APP_SECRET_KEY = '6198EE8119219C3159A5D7D54A76771BA83A52A8C8CB4C5DFEA8E2BF9F'

        APP_URL = 'http://tesautokpi.comcast.com'
        APP_URL = 'https://tesautokpi.comcast.com'  # For New SSO
        APP_LOGOUT_URL = '{}/#/logoff'.format(APP_URL)
        SSO_CLIENT_ID = '1ce5bb69-1f3c-4d26-bca3-75c3ff43fc90'
        SSO_CLIENT_SECRET = '89a126d1e6fd4ae9be1b188c1636bd29'

        SSO_URLS = {
            'login': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/authorize',
            'token': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/token',
            'user': 'https://graph.microsoft.com/v1.0/me',
            'redirect': APP_URL,
            'logout': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/logout'.format(APP_LOGOUT_URL)
        }

        LOG_LEVEL = logging.INFO

        def _get_log_config(self):
            return {
                'version': 1,
                'disable_existing_loggers': True,
                'formatters': {
                    'simple': {
                        'format': '%(asctime)s %(levelname)s %(message)s'
                    }
                },
                'handlers': {
                    'main': {
                        'level': 'DEBUG',
                        'class': 'logging.FileHandler',
                        'filename': '/var/log/autokpi.log',
                        'formatter': 'simple'
                    }
                },
                'loggers': {
                    'autokpi': {
                        'handlers': ['main'],
                        'level': self.LOG_LEVEL
                    }
                }
            }
        LOG_CONFIG = property(_get_log_config)

        BYPASS_SSO = False
        BYPASS_SSO_NTID = 'morpheus00'
        BYPASS_SSO_USER = 'Morpheus'
        BYPASS_SSO_EMAIL = 'morpheus@nebuchadnezzar.com'

    class QA(Production):
        """Config paramaters for QA, inherit from Production """
        ENV = 'q'
        LOG_LEVEL = logging.DEBUG
        DB_CONN = {
            'user': '!tesautomation',
            'password': 'C0mc4st!!',
            'host': 'autordb-cmc-1p.sys.comcast.net',
            'database': 'TES_PROJECTS_QA',
            'charset': 'utf8'
        }
        APP_URL = 'http://tesautokpi-qa.comcast.com'
        APP_URL = 'https://tesautokpi-qa.comcast.com'  # For New SSO
        APP_LOGOUT_URL = '{}/#/logoff'.format(APP_URL)
        SSO_CLIENT_ID = 'b0b44120-7587-4d1b-9025-e1e06397050d'
        SSO_CLIENT_SECRET = '33aed82cf74a4cd882bfac153c7965b2'
        SSO_URLS = {
            'login': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/authorize',
            'token': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/token',
            'user': 'https://graph.microsoft.com/v1.0/me',
            'redirect': APP_URL,
            'logout': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/logout?target={}'.format(APP_LOGOUT_URL)
        }

    class Development(QA):
        """Config paramaters for development, inherit from QA"""
        ENV = 'd'
        DB_CONN = {
            'user': '!tesautomation',
            'password': 'C0mc4st!!',
            'host': 'autordb-cmc-1p.sys.comcast.net',
            'database': 'TES_PROJECTS_DEV',
            'charset': 'utf8'
        }

        APP_URL = 'http://tesautokpi-dev.comcast.com'
        APP_URL = 'https://tesautokpi-dev.comcast.com'  # For New SSO
        APP_LOGOUT_URL = '{}/#/logoff'.format(APP_URL)

        SSO_URLS = {
            'login': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/authorize',
            'token': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/token',
            'user': 'https://graph.microsoft.com/v1.0/me',
            'redirect': APP_URL,
            'logout': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/logout?target={}'.format(APP_LOGOUT_URL)
        }

    class PreDevelopment(Development):
        DB_CONN = {
            'user': 'root',
            'password': 'PaNW^?DV9"zT,!^`',
            'host': 'localhost',
            'database': 'WIDGET_SHOP',
            'charset': 'utf8'
        }
        """Config paramaters for pre-development, inherit from Development"""
        APP_URL = 'http://localhost:1996'
        APP_LOGOUT_URL = '{}/#/logoff'.format(APP_URL)

        BYPASS_SSO = True
        unauthorized = False
        if unauthorized:
            BYPASS_SSO_NTID = 'unauthorized_id'

        SSO_URLS = {
            'login': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/authorize',
            'token': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/token',
            'user': 'https://graph.microsoft.com/v1.0/me',
            'redirect': APP_URL,
            'logout': 'https://login.microsoftonline.com/906aefe9-76a7-4f65-b82d-5ec20775d5aa/oauth2/v2.0/logout?target={}'.format(APP_LOGOUT_URL)
        }

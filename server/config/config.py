import logging
import os
import sys
sys.path.insert(0, os.path.dirname(
    os.path.realpath(__file__)) + '/../')
from server.handlers.config import BaseConfigHandler

class Config(BaseConfigHandler):
    """Application configuration class.
    """
    class Development:
        DB_CONN = {
            'user': 'USER',
            'password': 'PASSWORD',
            'host': 'localhost',
            'database': 'WIDGET_SHOP',
            'charset': 'utf8'
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
                        'filename': '/var/log/widget_shop.log',
                        'formatter': 'simple'
                    }
                },
                'loggers': {
                    'widget_shop': {
                        'handlers': ['main'],
                        'level': self.LOG_LEVEL
                    }
                }
            }
        LOG_CONFIG = property(_get_log_config)

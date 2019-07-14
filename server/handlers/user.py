'''Handler Layer'''
import logging

from server.handlers import sql as queries

from server.exceptions import GenericDatabaseException
from server.exceptions import UnauthorizedUserException
from server.utils import _sanitize_string

LOGGER = logging.getLogger('autokpi')


class UserHandler(object):
    def __init__(self, adapter):
        self.adapter = adapter

    def check_user_auth(self, net_id):
        try:
            query = queries.GET_USER.format(net_id)
            results = self.adapter.execute(query,fetch_one=True)
            if len(results) == 0:
                LOGGER.info(results)
                msg = 'User does not exist.'
                raise UnauthorizedUserException(msg)
            return results
        except UnauthorizedUserException as err:
            LOGGER.exception('Could not check User Authorization: {}'.format(err))
            raise UnauthorizedUserException(err)
        except GenericDatabaseException as err:
            LOGGER.exception('Could not check User Authorization: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

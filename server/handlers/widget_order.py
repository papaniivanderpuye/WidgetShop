'''Handler Layer'''
import datetime
import logging
from server.domain import (
    WidgetOrder
)
from server.exceptions import GenericDatabaseException

LOGGER = logging.getLogger('widget_shop')


class WidgetOrderHandler(object):
    def __init__(self, adapter):
        self.adapter = adapter

    def create_widget_order(self, data):
        try:
            output = 0
            output_msg = None
            args = (
                output,
                output_msg,
                data.type,
                data.color,
                data.quantity,
                data.date_needed_by
            )

            results = self.adapter.call_proc("CREATE_WIDGET_ORDER", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not create widget order: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

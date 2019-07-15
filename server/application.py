'''Application Layer'''

import csv
import logging
import time
import deprecation


from server.exceptions import GenericDatabaseException

LOGGER = logging.getLogger('widget_shop')

def create_widget_order(handler, data):
	try:
		return handler.widget_order.create_widget_order(data)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not create widget order')
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise


def build_jsonapi_response(handler, data, urlroot):
	try:
		return _jsonserialise_list_of_obj(handler,data,urlroot)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def _jsonserialise_list_of_obj(handler,list_of_obj, urlroot):
	return [handler.json.jsonSerialize(obj,urlroot) for obj in list_of_obj]

def response(handler, result, method, request_url):
	return handler.response.response(result, method, request_url)

def exception(handler, exception, method, object):
	return handler.response.exception(exception, method, object)

def map_data_to_obj(cls, **kwargs):
    return cls(**kwargs)

def _serialize_list_of_obj(list_of_obj):
    '''Returns serialized list of domain objects'''
    return [obj.serialize() for obj in list_of_obj]

'''Handler Layer'''
import datetime
import logging
from flask import jsonify
from server.exceptions import *

LOGGER = logging.getLogger('autokpi')

'''
ASSUMES JSONAPI Results where applicable, & returns JSONAPI valid erros.
'''

ERR_MSG = 'Could not {}. Please contact support.'

class ResponseHandler(object):
    def response(self, result, method, request_url):
        if method == 'GET':
            if result:
                return jsonify(result), 200
            else:
                return ('', 404)
        else:
            if result[0] != 0:
                return jsonify({
                'code': result[0],
                'title' : result[1]
                }), 400
            else:
                if method == 'POST':
                    links = {}

                    if request_url[-1].encode() != '/':
                        request_url += '/'

                    links['self'] = request_url + result[1]

                    return jsonify({
                        'links' : links
                        }), 201
                else:
                    return ('', 204)

    def exception(self, exception, method, object):
        if exception == GenericDatabaseException:
            if method == 'GET':
                msg = 'get {}'.format(object)
            elif method == 'DELETE':
                msg = 'delete {}'.format(object)
            else:
                msg = 'save {}'.format(object)
            return jsonify({
                    'message': ERR_MSG.format(msg)
                }), 503
        else:
            return jsonify({
                'title': '{} {}'.format(API_ERR_MSG, err)
            }), 500

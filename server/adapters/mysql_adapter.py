'''
MySQL Adapter
'''

import copy
import logging
import os
import mysql.connector
from mysql.connector import errorcode
from retrying import retry
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from server.exceptions import GenericDatabaseException

LOGGER = logging.getLogger('autokpi')


class MysqlAdapter(object):
    '''This class will defines the methods used for MySQL'''
    def __init__(self, conn, create_pconn=True):
        self.conn = conn
        self.create_pconn = create_pconn
        self.pConn = None
        self._connect()

    def _connect(self):
        conn = copy.deepcopy(self.conn)
        if 'charset' in conn.keys():
            conn_str = 'mysql://{}:{}@{}/{}?charset={}'.format(conn['user'],conn['password'],conn['host'],conn['database'],conn['charset'])
            del conn['charset']
        else:
            conn_str = 'mysql://{}:{}@{}/{}'.format(conn['user'],conn['password'],conn['host'],conn['database'])
        self.engine = create_engine(conn_str)

        # Only create the pConn if True
        if self.create_pconn:
            self.pConn = mysql.connector.connect(**conn)

    def teardown(self):
        if self.engine:
            self.engine.dispose()
        if self.create_pconn:
            self.pConn.close()

    def __del__(self):
        if self.create_pconn:
            self.pConn.close()

    @retry(stop_max_attempt_number=5,
           wait_exponential_multiplier=1000)
    def call_proc(self, stored_proc, params=[]):
        try:
            cursor = self.pConn.cursor()

            for i, param in enumerate(params):
                if isinstance(param, list):
                    # Convert python list
                    str_vals = ','.join([p for p in param])
                    params[i] = '{}'.format(str_vals)
                    continue

            LOGGER.debug(params)
            result_args = cursor.callproc(stored_proc, params)
            results = (int(_encode_ascii(result_args[0])),_encode_ascii(result_args[1]))
            self.pConn.commit()
            cursor.close()
            return results
        except mysql.connector.Error as err:
            LOGGER.error('Could not execute stored procedure: {} {}'.format(
                stored_proc, params))
            LOGGER.exception(err)
            self._connect()
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.error('Could not execute stored procedure: {} {}'.format(
                         stored_proc, params))
            LOGGER.exception(err)
            self._connect()
            raise Exception(err)

    @retry(stop_max_attempt_number=5,
           wait_exponential_multiplier=1000)
    def execute(self, query, fetch_one=False, fetch_many=False):
        try:
            with self.engine.connect() as conn:
                if fetch_one:
                    row = conn.execute(query).fetchone()
                    return row if row else []
                if fetch_many:
                    rows = conn.execute(query).fetchall()
                    result = rows if rows else []
                    return result
                result = conn.execute(query)
                return result
        except SQLAlchemyError as err:
            LOGGER.error('Could not execute a query: {}'.format(query))
            LOGGER.exception(err)
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.error('Could not execute a query: {}'.format(query))
            LOGGER.exception(err)
            raise Exception(err)

    def execute_and_map(self, obj, query):
        return map(obj.make, self.execute(query))

def _encode_ascii(str):
    return str.encode('ascii','ignore') if isinstance(str, basestring) else str

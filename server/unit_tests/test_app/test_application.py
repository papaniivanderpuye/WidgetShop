#!/usr/bin/python2.7
# Application UNIT TEST
import logging
import logging.config
import os
import sys
import unittest


sys.path.insert(0, os.path.dirname(
    os.path.realpath(__file__)) + '/../../../')

from server.domain import *
from server.exceptions import *
from server.handlers import *
from server.adapters.mysql_adapter import MysqlAdapter
from server.config.config import Config
import server.application as widget_app



CONFIG = Config.Development()
logging.config.dictConfig(CONFIG.LOG_CONFIG)
LOGGER = logging.getLogger('widget_shop')

def get_handlers():
    context = Context()
    adapter = MysqlAdapter(CONFIG.DB_CONN)
    context.widget_order = WidgetOrderHandler(adapter)
    context.response = ResponseHandler()
    return context

# Set global handlers to prevent too many connections
HANDLER = get_handlers()

class TestApplication(unittest.TestCase):
    def test_create_widget_order(self):
        '''Tests creating an order record'''
        data = widget_app.map_data_to_obj(
            WidgetOrder,
            type='Widget',
            color='red',
            quantity=1,
            date_needed_by='2019-02-19'
        )
        results = widget_app.create_widget_order(HANDLER, data)
        self.assertIsInstance(results[1], str)
        self.assertEqual(results[0], 0)

    def test_wrong_widget_type(self):
         '''Tests order with wrong widget type'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type='Widget1',
             color='red',
             quantity=1,
             date_needed_by='2019-02-19'
         )
         results = widget_app.create_widget_order(HANDLER, data)
         self.assertEqual(results[1], '[ERROR] TYPE IS NOT VALID (Must be either Widget, Widget Pro or Widget Xtreme)')
         self.assertEqual(results[0], 4001)

    def test_None_widget_type(self):
         '''Tests order with `None` widget type'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type=None,
             color='red',
             quantity=1,
             date_needed_by='2019-02-19'
         )
         results = widget_app.create_widget_order(HANDLER, data)
         self.assertEqual(results[1], '[ERROR] TYPE IS NOT VALID (Must be either Widget, Widget Pro or Widget Xtreme)')
         self.assertEqual(results[0], 4001)

    def test_wrong_widget_color(self):
         '''Tests order with wrong widget color'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type='Widget',
             color='red1',
             quantity=1,
             date_needed_by='2019-02-19'
         )
         results = widget_app.create_widget_order(HANDLER, data)
         self.assertEqual(results[1], '[ERROR] COLOR IS NOT VALID (Must be either red, blue or yellow)')
         self.assertEqual(results[0], 4002)

    def test_None_widget_color(self):
         '''Tests order with `None` widget color'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type='Widget',
             color=None,
             quantity=1,
             date_needed_by='2019-02-19'
         )
         results = widget_app.create_widget_order(HANDLER, data)
         self.assertEqual(results[1], '[ERROR] COLOR IS NOT VALID (Must be either red, blue or yellow)')
         self.assertEqual(results[0], 4002)

    def test_wrong_widget_quantity(self):
         '''Tests order with wrong widget quantity'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type='Widget',
             color='red1',
             quantity=0,
             date_needed_by='2019-02-19'
         )
         results = widget_app.create_widget_order(HANDLER, data)
         self.assertEqual(results[1], '[ERROR] QUANTITY NOT VALID (Must be greater than 0)')
         self.assertEqual(results[0], 4003)

    def test_None_widget_quantity(self):
         '''Tests order with `None` widget quantity'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type='Widget',
             color='red1',
             quantity=None,
             date_needed_by='2019-02-19'
         )
         results = widget_app.create_widget_order(HANDLER, data)
         self.assertEqual(results[1], '[ERROR] QUANTITY NOT VALID (Must be greater than 0)')
         self.assertEqual(results[0], 4003)

    def test_None_date(self):
         '''Tests order with `None` widget date_needed_by'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type='Widget',
             color='red',
             quantity=1,
             date_needed_by= None
         )
         results = widget_app.create_widget_order(HANDLER, data)
         self.assertEqual(results[1], '[ERROR] DATE NOT VALID')
         self.assertEqual(results[0], 4004)

    def test_wrong_dateformat(self):
         '''Tests database error wrong date_needed_by format'''
         data = widget_app.map_data_to_obj(
             WidgetOrder,
             type='Widget',
             color='red',
             quantity=1,
             date_needed_by= '2019-02-19dfafa'
         )
         with self.assertRaises(GenericDatabaseException): widget_app.create_widget_order(HANDLER, data)




if __name__ == '__main__':
    unittest.main()

'''Domain Layer

This layer includes all objects that will be used by the application
and handler layers
'''

import logging

LOGGER = logging.getLogger('widget_shop')

class WidgetOrder():
    '''Base Project Class'''
    def __init__(self, type=None, color=None, quantity=None, date_needed_by=None):
        self.type = type
        self.color = color
        self.quantity = quantity
        self.date_needed_by = date_needed_by

'''
Context (Handlers)
'''

from server.handlers.widget_order import WidgetOrderHandler
from server.handlers.response import ResponseHandler


class Context(object):
    def __init__(self):
        self._widget_order = None
        self._response = None

    @property
    def widget(self):
        if not self._widget_order:
            raise NotImplementedError("No WidgetOrder Handler Exists")
        return self._widget_order

    @widget.setter
    def widget(self, handler):
        self._widget_order = handler

    @property
    def response(self):
        if not self._response:
            raise NotImplementedError("No Response Handler Exists")
        return self._response

    @response.setter
    def response(self, handler):
        self._response = handler

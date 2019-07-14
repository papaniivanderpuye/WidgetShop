'''
Context (Handlers)
'''

from server.handlers.widget import WidgetHandler
from server.handlers.response import ResponseHandler


class Context(object):
    def __init__(self):
        self._widget = None
        self._response = None

    @property
    def widget(self):
        if not self._widget:
            raise NotImplementedError("No Widget Handler Exists")
        return self._widget

    @project.setter
    def project(self, handler):
        self._widget = handler

    @property
    def response(self):
        if not self._response:
            raise NotImplementedError("No Response Handler Exists")
        return self._response

    @response.setter
    def response(self, handler):
        self._response = handler

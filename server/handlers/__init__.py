'''
Context (Handlers)
'''

from server.handlers.project import ProjectHandler
from server.handlers.jsonapi import JsonApiHandler
from server.handlers.response import ResponseHandler
from server.handlers.user import UserHandler


class Context(object):
    def __init__(self):
        self._project = None
        self._jsonapi = None
        self._response = None
        self._user = None

    @property
    def project(self):
        if not self._project:
            raise NotImplementedError("No Projects Handler Exists")
        return self._project

    @project.setter
    def project(self, handler):
        self._project = handler

    @property
    def jsonapi(self):
        if not self._jsonapi:
            raise NotImplementedError("No JSON API Handler Exists")
        return self._jsonapi

    @jsonapi.setter
    def jsonapi(self, handler):
        self._jsonapi = handler

    @property
    def response(self):
        if not self._response:
            raise NotImplementedError("No Response Handler Exists")
        return self._response

    @response.setter
    def response(self, handler):
        self._response = handler

    @property
    def user(self):
        if not self._user:
            raise NotImplementedError("No User Handler Exists")
        return self._user

    @user.setter
    def user(self, handler):
        self._user = handler

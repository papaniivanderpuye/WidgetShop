'''Application-wide Exceptions'''

class GenericDatabaseException(Exception):
    def __init__(self, *args, **kwargs):
        Exception.__init__(self, *args, **kwargs)

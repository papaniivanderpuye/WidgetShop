'''This file contains the Config class'''
import socket

class BaseConfigHandler(object):
    """Config Handler Class"""
    @classmethod
    def get(cls):
        """Get the config object for the current environment"""
        return cls.Development()
    class Production:
        """Config paramaters for production instance"""
        pass

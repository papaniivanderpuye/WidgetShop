'''This file contains the Config class'''
import socket


class BaseConfigHandler(object):
    """Config Handler Class"""

    @classmethod
    def get(cls):
        """Get the config object for the current environment"""

        # Define environment
        env = socket.gethostname().split('.')[0][-1:].lower()

        if env == 'p':
            return cls.Production()
        elif env == 'd':
            return cls.Development()
        elif env == 'q':
            return cls.QA()
        else:
            return cls.PreDevelopment()

    class Production:
        """Config paramaters for production instance"""
        pass

    class QA(Production):
        """Config pramaters for QA, inherts from prod"""
        pass

    class Development(QA):
        """Config paramaters for development, inherit from QA"""
        pass

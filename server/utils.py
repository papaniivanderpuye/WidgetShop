'''
Utils Layer

This file contains functions that can be used universally
'''
import re
import os


def _sanitize_string(str, escape_single_quote=True):
    clean_str = ''
    if (str):
        clean_str = re.escape(str)
        clean_string = ' .,!?@#$%^&*()[]{}-_+;:<>/?|\n'
        for char in clean_string:
            clean_str = clean_str.replace('\\' + char, char)
    if escape_single_quote:
        clean_str = clean_str.replace("\\'","'")
    return clean_str


def get_version():
    try:
        cmd = 'rpm -q --qf "%{VERSION}-%{RELEASE}\n" autokpi'
        version = os.popen(cmd).read().strip()
        if version.lower() == 'package autokpi is not installed':
            raise Exception
        if not version:
            raise Exception
        return version
    except Exception as err:
        return 'Unknown'

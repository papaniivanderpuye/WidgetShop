""" Functions for SSO """

import logging
import os
import sys
import urllib
import random

import jwt
from flask import session

from server.exceptions import *

LOGGER = logging.getLogger('autokpi')


def _get_param(req, param, default=None):
    """ Return param from incoming payload """
    if param in req.cookies:
        return req.cookies.get(param)

    if req.method in ['GET', 'POST']:
        return req.form.get(param, default)
    else:
        return req.json.get(param, default)


class AuthClient(object):
    def __init__(self, adapter, client_id, client_secret, urls):
        self.adapter = adapter
        self.client_id = client_id
        self.client_secret = client_secret
        self.urls = urls

    def login(self, request):
        auth_code = _get_param(
            request, 'session', None)
        session['SSO_ACCESS_TOKEN'] = _get_param(
            request, 'access_token', None)
        session['SSO_ID_TOKEN'] = _get_param(
            request, 'id_token', None)
        if not auth_code or auth_code == 0:
            raise AuthCodeMissingException(
                'Missing auth code')
        session['AUTH_CODE'] = auth_code
        if ((session['SSO_ACCESS_TOKEN']) and (session['SSO_ID_TOKEN'])):
            try:
                self._start_session()
            except AuthCodeMissingException as err:
                LOGGER.error(err)
                raise AuthCodeMissingException(
                    err)
        else:
            raise AuthCodeMissingException(
                'Missing tokens')
        return session['SSO_NTID']

    @staticmethod
    def logout():
        for key in session.keys():
            session.pop(key)
        session.clear()

    def _start_session(self):
        try:
            ntid, full_name, email = self.get_user_data(
                session['SSO_ID_TOKEN'])
            session['SSO_NTID'] = ntid
            session['SSO_FULLNAME'] = full_name
            session['SSO_EMAIL'] = email
            return ntid
        except AuthCodeMissingException as err:
            raise AuthCodeMissingException(
                err)
        except Exception as err:
            LOGGER.exception(
                'Could not store user session: {}'.format(err))
            raise

    def get_user_data(self, id_token):
        try:
            results = jwt.decode(
                id_token, verify=False)

            # Checking if the response is for the request we sent. Using our Nonce
            if (('NONCE' not in session) or (session['NONCE'] != results['nonce'])):
                if 'NONCE' not in session:
                    err = 'Nonce not in session'
                else:
                    err = 'Invalid nonce'
                session.clear()
                raise AuthCodeMissingException(
                    err)

            user_ntid = results['preferred_username'].split("@")[
                0]
            user_email = results['preferred_username']

            fullname = results['name']
            for ch in ['(Contractor)', ',']:
                if ch in fullname:
                    fullname = fullname.replace(
                        ch, '')
            fullname_list = fullname.split()
            given_name = fullname_list.pop(
                -1)
            other_names = ' '.join(
                fullname_list)

            user_fullname = '{} {}'.format(given_name,
                                           other_names)
            return user_ntid, user_fullname, user_email
        except AuthCodeMissingException as err:
            raise AuthCodeMissingException(
                err)
        except Exception as err:
            LOGGER.exception(
                'Could not obtain user data: {}'.format(err))
            raise

    def get_redirect_url(self):
        return self._build_login_url(session['SSO_AFTER_LOGIN_SESSION_URL'])

    def set_redirect_url(self, url):
        session['SSO_AFTER_LOGIN_SESSION_URL'] = url

    def get_session(self):
        if 'SSO_ACCESS_TOKEN' in session:
            return session['SSO_NTID'], session['SSO_FULLNAME'], session['SSO_EMAIL'], session['AUTH_CODE']
        else:
            raise TokenExpiredException(
                'Missing token')

    def _build_access_token_params(self, auth_code):
        params = 'client_id={client_id}&'
        'grant_type=authorization_code&'
        'redirect_uri={redirect}&'
        'code={auth_code}&'
        'scope=openid%20profile%20email'.format(
            client_id=self.client_id,
            redirect=urllib.quote(
                self.urls['redirect']),
            auth_code=auth_code
        )
        return '{}?{}'.format(self.urls['token'], params)

    def _build_access_token_payload(self, auth_code):
        payload = dict(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.urls['redirect'],
            code=auth_code,
            grant_type="authorization_code",
            scope="openid profile email User.Read"
        )

        return payload

    def _acquire_access_token(self, auth_code):
        url = self.urls['token']
        payload = self._build_access_token_payload(
            auth_code)
        headers = {
            'content-type': 'application/x-www-form-urlencoded'
        }
        try:
            results = self.adapter.post(
                url=url, payload=payload, headers=headers)
            session['SSO_ACCESS_TOKEN'] = results['access_token']
            session['SSO_ID_TOKEN'] = results['id_token']
        except AuthCodeMissingException as err:
            LOGGER.exception(
                'Could not get access token: {}'.format(err))
            raise AuthCodeMissingException(
                err)
        except Exception as err:
            LOGGER.exception(
                'Could not get access token: {}'.format(err))
            raise

    def _build_user_data_params(self, access_token):
        return '{}?{}'.format(
            self.urls['user'],
            'access_token={}'.format(
                access_token)
        )

    def _build_login_url(self, url):
        session['NONCE'] = self._generate_nonce()
        redirect = urllib.quote(
            url)
        params = 'client_id={client_id}&' \
            'client_secret={secret}&' \
            'response_type=id_token%20token&' \
            'response_mode=form_post&' \
            'redirect_uri={redirect}&' \
            'scope=openid%20profile%20email&' \
            'nonce={random_nonce}'.format(
                client_id=self.client_id,
                secret=self.client_secret,
                redirect=redirect,
                random_nonce=session['NONCE']
            )
        return '{}?{}'.format(self.urls['login'], params)

    def _stamp_login_db(self, user):
        # TODO
        pass

    def _generate_nonce(self, length=8):
        """Generate pseudorandom number."""
        return ''.join([str(random.randint(0, 9)) for i in range(length)])

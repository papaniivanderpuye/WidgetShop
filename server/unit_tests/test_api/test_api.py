""" API Unit Testing """
from nose.tools import *
import requests

host_url = 'http://localhost:1996'
api = '/api'
version_route = '/v1'


def test_index_response():
    '''Tests index response'''
    response = requests.get(host_url)
    assert_true(response.ok)


def test_widget_order_no_data_response():
    '''Tests widget order with no json data'''
    response = requests.post(
        host_url + api + version_route + '/widget_order')

    assert_false(response.ok)


def test_widget_order_response():
    '''Tests widget order with correct data'''
    payload = {'type': 'Widget',
               'color': 'red',
               'quantity': 1,
               'date_needed_by': '2019-02-19'}

    url = host_url + api + version_route + '/widget_order'
    response = requests.post(url, json=payload)
    data = response.json()
    assert_true(data['success'])
    assert_true(('id' in data))

def test_wrong_type_response():
    '''Tests widget order with wrong type'''
    payload = {'type': 'Widget',
               'color': 'red',
               'quantity': 1,
               'date_needed_by': '2019-02-19'}

    url = host_url + api + version_route + '/widget_order'

    for type in ['Widget1',None]:
        payload['type'] = type
        response = requests.post(url, json=payload)
        data = response.json()
        assert_false(response.ok)
        assert_equal(4001,data['code'])
        assert_equal('[ERROR] TYPE IS NOT VALID (Must be either Widget, Widget Pro or Widget Xtreme)',data['title'])

def test_wrong_color_response():
    '''Tests widget order with wrong color'''
    payload = {'type': 'Widget',
               'color': 'red',
               'quantity': 1,
               'date_needed_by': '2019-02-19'}

    url = host_url + api + version_route + '/widget_order'

    for type in ['red2',None]:
        payload['color'] = type
        response = requests.post(url, json=payload)
        data = response.json()
        assert_false(response.ok)
        assert_equal(4002,data['code'])
        assert_equal('[ERROR] COLOR IS NOT VALID (Must be either red, blue or yellow)',data['title'])

def test_wrong_quantity_response():
    '''Tests widget order with wrong quantity'''
    payload = {'type': 'Widget',
               'color': 'red',
               'quantity': 1,
               'date_needed_by': '2019-02-19'}

    url = host_url + api + version_route + '/widget_order'

    for type in [0,None]:
        payload['quantity'] = type
        response = requests.post(url, json=payload)
        data = response.json()
        assert_false(response.ok)
        assert_equal(4003,data['code'])
        assert_equal('[ERROR] QUANTITY NOT VALID (Must be greater than 0)',data['title'])

def test_no_date_response():
    '''Tests widget order with no date'''
    payload = {'type': 'Widget',
               'color': 'red',
               'quantity': 1,
               'date_needed_by': None}

    url = host_url + api + version_route + '/widget_order'
    response = requests.post(url, json=payload)
    data = response.json()
    assert_false(response.ok)
    assert_equal(4004,data['code'])
    assert_equal('[ERROR] DATE NOT VALID',data['title'])

def test_dateformat_error_response():
    '''Tests database error with wrong date format'''
    payload = {'type': 'Widget',
               'color': 'red',
               'quantity': 1,
               'date_needed_by': '2019-02-19dsfaf'}

    url = host_url + api + version_route + '/widget_order'
    response = requests.post(url, json=payload)
    data = response.json()
    assert_false(response.ok)
    assert_equal('Could not save widget. Please contact support.',data['message'])

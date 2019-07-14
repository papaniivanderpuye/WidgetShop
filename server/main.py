#!/usr/bin/python2.7
'''
Automation Team KPI API
'''
import argparse
import datetime
import logging
import logging.config
import os
import random
import sys
# Auth Requirements
from functools import wraps

import deprecation
from flask import (Flask, abort, jsonify, make_response, redirect,
                   render_template, request, send_file, url_for)

# Auto KPI Requirements
sys.path.insert(0, os.path.dirname(
    os.path.realpath(__file__)) + '/../')
import server.application as autokpi_app
from server.adapters.mysql_adapter import MysqlAdapter
from server.common import get_auth_context, log_error, log_exception
from server.config.config import Config
from server.domain import Milestone, Project
from server.exceptions import *
from server.handlers import (Context, JsonApiHandler, ProjectHandler,
                             ResponseHandler, UserHandler)
from server.utils import get_version


# Flask requirements


'''APP CONFIG'''
PARSER = argparse.ArgumentParser(description='TESLAB API')
PARSER.add_argument('-p', '--port', dest='port',
                    type=int, help='Port', default=1996)
PARSER.add_argument('-d', '--development', dest='environ',
                    help='Force development environment',
                    action='store_true')
ARGS = PARSER.parse_args()

CONFIG = Config.Development() if (ARGS.environ) else Config.get()
logging.config.dictConfig(CONFIG.LOG_CONFIG)
LOGGER = logging.getLogger('autokpi')
LOGGER.info("Starting AutoKPI Application")

# Version 1 Route
version_route = 'v1'


def get_handlers():
    context = Context()
    adapter = MysqlAdapter(CONFIG.DB_CONN)
    context.project = ProjectHandler(adapter)
    context.json = JsonApiHandler()
    context.response = ResponseHandler()
    context.user = UserHandler(adapter)
    return context


# Set global handlers to prevent too many connections
HANDLER = get_handlers()

app = Flask(__name__,
            static_folder="../static/dist",
            template_folder="../static")

app.secret_key = CONFIG.APP_SECRET_KEY
app.config['JSONIFY_MIMETYPE'] = 'application/json'

'''@app.after_request
def add_jsonapi(response):
    response.headers['Content-Type'] = 'application/vnd.api+json'
    return response'''

AUTH = get_auth_context(
    CONFIG.SSO_CLIENT_ID,
    CONFIG.SSO_CLIENT_SECRET,
    CONFIG.SSO_URLS
)

# @app.route('/',methods=['GET'])
# @app.route('/index.html',methods=['GET']) #@login_required


def get_index():
    return render_template("index.html")


def login_required(function):
    @wraps(function)
    def wrap(*args, **kwargs):
        if CONFIG.BYPASS_SSO:
            return function(*args, **kwargs)
        try:
            ntid = AUTH.login(request)
            user_ntid, user_fullname, user_email, oauth_code = AUTH.get_session()
            autokpi_app.check_user_auth(HANDLER, user_ntid)
            return function(*args, **kwargs)
        except UnauthorizedUserException, err:
            LOGGER.error(err)
            log_error()
            return unauthorized()
        except (AuthCodeMissingException,
                AuthCodeExpiredException,
                TokenExpiredException) as err:
            return login()
        except Exception as err:
            LOGGER.exception(err)
            log_exception()
    return wrap


@app.route('/login')
def login():
    if not CONFIG.BYPASS_SSO:
        AUTH.set_redirect_url(request.url)
        return redirect(AUTH.get_redirect_url())


@app.route('/logout')
def logout():
    try:
        if not CONFIG.BYPASS_SSO:
            AUTH.logout()
        resp = make_response(jsonify({
            'success': True,
            'url': CONFIG.SSO_URLS['logout'],
            'message': 'Logged out'
        }), 200)
        resp.set_cookie('code', '', expires=0)
        return resp
    except Exception as err:
        LOGGER.exception(err)
        log_exception()
        return jsonify({
            'success': False,
            'message': 'Could not log out'
        }), 500


@app.route('/unauthorized')
def unauthorized():
    if CONFIG.BYPASS_SSO:
        user_ntid = CONFIG.BYPASS_SSO_NTID
        user_fullname = CONFIG.BYPASS_SSO_USER
        user_email = CONFIG.BYPASS_SSO_EMAIL
        oauth_code = 'ABCD1234'
    else:
        user_ntid, user_fullname, user_email, oauth_code = AUTH.get_session()
    return render_template('unauthorized.html',
                           user_ntid=user_ntid,
                           user_fullname=user_fullname,
                           user_email=user_email)


@app.route('/' + version_route + '/projects', methods=['GET'])
@app.route('/' + version_route + '/project/<project_id>', methods=['GET'])
def get_project(project_id=None):
    try:
        results = dict()
        projects = autokpi_app.get_project(HANDLER, project_id)
        projects = autokpi_app.build_jsonapi_response(
            HANDLER, projects, request.url_root + version_route + '/')

        if project_id:
            results['data'] = projects[0]
        else:
            links = dict()
            links['self'] = request.url
            results['links'] = links
            results['data'] = projects

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/history/project/<project_id>', methods=['GET'])
def get_project_history(project_id):
    try:
        results = dict()
        projects = autokpi_app.get_project_history(
            HANDLER, project_id)
        projects = autokpi_app.build_jsonapi_response(
            HANDLER, projects, request.url_root + version_route + '/')
        if (len(projects) == 1):
            results['data'] = projects[0]
        else:
            links = dict()
            links['self'] = request.url
            results['links'] = links
            results['data'] = projects

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/history/milestone/<milestone_id>', methods=['GET'])
def get_milestone_history(milestone_id):
    try:
        results = dict()
        milestones = autokpi_app.get_milestone_history(
            HANDLER, milestone_id)
        milestones = autokpi_app.build_jsonapi_response(
            HANDLER, milestones, request.url_root + version_route + '/')

        if (len(milestones) == 1):
            results['data'] = milestones[0]
        else:
            links = dict()
            links['self'] = request.url
            results['links'] = links
            results['data'] = milestones

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/project/<project_id>/relationships/milestones', methods=['GET'])
def get_project_milestone_relationship(project_id):
    try:
        response = dict()
        projects = autokpi_app.get_project(HANDLER, project_id)
        projects = autokpi_app.build_jsonapi_response(
            HANDLER, projects, request.url_root + version_route + '/')
        if 'relationships' in projects[0]:
            response = projects[0]['relationships']['milestones']
        return autokpi_app.response(HANDLER, response, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/project/<project_id>/milestones', methods=['GET'])
def get_project_milestones(project_id):
    try:
        milestones = autokpi_app.get_project_milestones(
            HANDLER, project_id)
        milestones = autokpi_app.build_jsonapi_response(
            HANDLER, milestones, request.url_root + version_route + '/')
        links = dict()
        results = dict()
        links['self'] = request.url
        results['links'] = links
        results['data'] = milestones

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@deprecation.deprecated(
    deprecated_in='1.1',
    removed_in='2.0',
    current_version='1.1',
    details='Use Create or Update Project instead'
)
@app.route('/v0/project/<project_id>', methods=['PUT'])
def save_project(project_id=None):
    try:
        name = _get_param(request, 'Name')
        goal = _get_param(request, 'Goal', None)
        description = _get_param(request, 'Description', None)
        highlights = _get_param(request, 'Highlights', None)
        risks = _get_param(request, 'Risks', None)
        owner = _get_param(request, 'Owner', None)
        note = _get_param(request, 'Note', None)

        project = autokpi_app.map_data_to_obj(
            Project,
            id=project_id,
            name=name,
            goal=goal,
            description=description,
            highlights=highlights,
            risks=risks,
            owner=owner,
            note=note
        )

        results = autokpi_app.save_project(HANDLER, project)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/project/', methods=['POST'])
def create_project():
    try:
        name = _get_param(request, 'Name')
        goal = _get_param(request, 'Goal', None)
        description = _get_param(request, 'Description', None)
        highlights = _get_param(request, 'Highlights', None)
        risks = _get_param(request, 'Risks', None)
        owner = _get_param(request, 'Owner', None)
        note = _get_param(request, 'Note', None)
        username = _get_param(request, 'Username')
        fid = _get_param(request, 'Root_ID')

        project = autokpi_app.map_data_to_obj(
            Project,
            fid=fid,
            name=name,
            goal=goal,
            note=note,
            description=description,
            highlights=highlights,
            risks=risks,
            owner=owner
        )
        results = autokpi_app.create_project(
            HANDLER, project, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/project/<project_id>', methods=['PUT'])
def update_project(project_id):
    try:
        name = _get_param(request, 'Name')
        goal = _get_param(request, 'Goal', None)
        description = _get_param(request, 'Description', None)
        highlights = _get_param(request, 'Highlights', None)
        risks = _get_param(request, 'Risks', None)
        owner = _get_param(request, 'Owner', None)
        note = _get_param(request, 'Note', None)
        username = _get_param(request, 'Username', None)

        project = autokpi_app.map_data_to_obj(
            Project,
            id=project_id,
            name=name,
            goal=goal,
            description=description,
            highlights=highlights,
            risks=risks,
            owner=owner,
            note=note
        )
        results = autokpi_app.update_project(
            HANDLER, project, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/archive/project/<project_id>', methods=['PUT'])
def archive_project(project_id):
    try:
        username = _get_param(request, 'Username')

        results = autokpi_app.archive_project(
            HANDLER, project_id, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/restore/project/<project_id>', methods=['PUT'])
def restore_project(project_id):
    try:
        username = _get_param(request, 'Username')

        results = autokpi_app.restore_project(
            HANDLER, project_id, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/archive/projects', methods=['GET'])
def get_archived_projects():
    try:
        results = dict()
        projects = autokpi_app.get_archived_projects(HANDLER)
        projects = autokpi_app.build_jsonapi_response(
            HANDLER, projects, request.url_root + version_route + '/')

        if (len(projects) == 1):
            results['data'] = projects[0]
        else:
            links = dict()
            links['self'] = request.url
            results['links'] = links
            results['data'] = projects

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/all/projects', methods=['GET'])
def get_all_projects():
    try:
        results = dict()
        projects = autokpi_app.get_all_projects(HANDLER)
        projects = autokpi_app.build_jsonapi_response(
            HANDLER, projects, request.url_root + version_route + '/')

        if (len(projects) == 1):
            results['data'] = projects[0]
        else:
            links = dict()
            links['self'] = request.url
            results['links'] = links
            results['data'] = projects

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/projects', methods=['DELETE'])
def clean_projects():
    try:
        IDS = _get_param(request, 'IDs')
        results = autokpi_app.clean_projects(HANDLER, IDS)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'project')


@app.route('/' + version_route + '/milestones', methods=['GET'])
@app.route('/' + version_route + '/milestone/<milestone_id>', methods=['GET'])
def get_milestone(milestone_id=None):
    try:
        results = dict()
        milestones = autokpi_app.get_milestone(HANDLER, milestone_id)
        milestones = autokpi_app.build_jsonapi_response(
            HANDLER, milestones, request.url_root + version_route + '/')

        if milestone_id:
            results['data'] = milestones[0]

        else:
            links = dict()
            results['data'] = milestones
            links['self'] = request.url
            results['links'] = links

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/archive/milestones', methods=['GET'])
def get_archived_milestones():
    try:
        results = dict()
        milestones = autokpi_app.get_archived_milestones(HANDLER)
        milestones = autokpi_app.build_jsonapi_response(
            HANDLER, milestones, request.url_root + version_route + '/')

        if (len(milestones) == 1):
            results['data'] = milestones[0]

        else:
            links = dict()
            results['data'] = milestones
            links['self'] = request.url
            results['links'] = links

        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/milestone/<milestone_id>/relationships/project', methods=['GET'])
def get_milestone_relationship_project(milestone_id=None):
    try:
        milestone = autokpi_app.get_milestone(HANDLER, milestone_id)
        response = dict()
        milestones = autokpi_app.get_milestone(HANDLER, milestone_id)
        milestones = autokpi_app.build_jsonapi_response(
            HANDLER, milestones, request.url_root + version_route + '/')
        response = milestones[0]['relationships']['project']

        return autokpi_app.response(HANDLER, response, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@deprecation.deprecated(
    deprecated_in='1.1',
    removed_in='2.0',
    current_version='1.1',
    details='Use Create or Update Milestone instead'
)
@app.route('/v0/milestone/<milestone_id>', methods=['PUT'])
def save_milestone(milestone_id=None):
    try:
        project_ID = _get_param(request, 'Project_ID')
        name = _get_param(request, 'Name')
        status = _get_param(request, 'Status')
        startDate = _get_param(request, 'Start_Date')
        endDate = _get_param(request, 'End_Date')
        completionDate = _get_param(request, 'Completion_Date', None)
        deliverable = _get_param(request, 'Deliverables')
        currentStatus = _get_param(request, 'Current_Status', None)
        nextSteps = _get_param(request, 'Next_Steps', None)
        resources = _get_param(request, 'Resources', None)
        percent = _get_param(request, 'Percent', 0)

        milestone = autokpi_app.map_data_to_obj(
            Milestone,
            id=milestone_id,
            projectID=project_ID,
            name=name,
            status=status,
            startDate=startDate,
            endDate=endDate,
            completionDate=completionDate,
            deliverable=deliverable,
            currentStatus=currentStatus,
            nextSteps=nextSteps,
            resources=resources,
            percent=percent
        )

        results = autokpi_app.save_milestone(HANDLER, milestone)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/milestone/', methods=['POST'])
def create_milestone():
    try:
        project_root_id = _get_param(request, 'Project_Root_ID')
        name = _get_param(request, 'Name')
        status = _get_param(request, 'Status')
        startDate = _get_param(request, 'Start_Date')
        endDate = _get_param(request, 'End_Date')
        completionDate = _get_param(request, 'Completion_Date', None)
        deliverable = _get_param(request, 'Deliverables')
        currentStatus = _get_param(request, 'Current_Status', None)
        nextSteps = _get_param(request, 'Next_Steps', None)
        resources = _get_param(request, 'Resources', None)
        percent = _get_param(request, 'Percent', 0)
        username = _get_param(request, 'Username', None)

        milestone = autokpi_app.map_data_to_obj(
            Milestone,
            name=name,
            project_root_id=project_root_id,
            status=status,
            startDate=startDate,
            endDate=endDate,
            completionDate=completionDate,
            deliverable=deliverable,
            currentStatus=currentStatus,
            nextSteps=nextSteps,
            resources=resources,
            percent=percent
        )

        results = autokpi_app.create_milestone(
            HANDLER, milestone, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/milestone/<milestone_id>', methods=['PUT'])
def update_milestone(milestone_id):

    try:
        project_root_id = _get_param(request, 'Project_Root_ID')
        name = _get_param(request, 'Name')
        status = _get_param(request, 'Status')
        startDate = _get_param(request, 'Start_Date')
        endDate = _get_param(request, 'End_Date')
        completionDate = _get_param(request, 'Completion_Date', None)
        deliverable = _get_param(request, 'Deliverables')
        currentStatus = _get_param(request, 'Current_Status', None)
        nextSteps = _get_param(request, 'Next_Steps', None)
        resources = _get_param(request, 'Resources', None)
        percent = _get_param(request, 'Percent', 0)
        username = _get_param(request, 'Username', None)

        milestone = autokpi_app.map_data_to_obj(
            Milestone,
            id=milestone_id,
            name=name,
            project_root_id=project_root_id,
            status=status,
            startDate=startDate,
            endDate=endDate,
            completionDate=completionDate,
            deliverable=deliverable,
            currentStatus=currentStatus,
            nextSteps=nextSteps,
            resources=resources,
            percent=percent
        )

        results = autokpi_app.update_milestone(
            HANDLER, milestone, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/milestones', methods=['DELETE'])
def clean_milestones():
    try:
        IDS = _get_param(request, 'IDs')
        results = autokpi_app.clean_milestones(HANDLER, IDS)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/archive/milestone/<milestone_id>', methods=['PUT'])
def archive_milestone(milestone_id):
    try:
        username = _get_param(request, 'Username')
        results = autokpi_app.archive_milestone(
            HANDLER, milestone_id, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/restore/milestone/<milestone_id>', methods=['PUT'])
def restore_milestone(milestone_id):
    try:
        username = _get_param(request, 'Username')
        results = autokpi_app.restore_milestone(
            HANDLER, milestone_id, username)
        return autokpi_app.response(HANDLER, results, request.method, request.url)
    except GenericDatabaseException as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')
    except Exception as err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'milestone')


@app.route('/' + version_route + '/download/weekly/report', methods=['GET'])
def get_weekly_report():
    try:
        report = autokpi_app.get_weekly_report(HANDLER)
        date_time = datetime.datetime.now()
        return send_file(report,
                         attachment_filename='Weekly Full Report ' +
                         date_time.strftime(
                             "%m-%d-%Y %H %M %S") + '.xlsx',
                         as_attachment=True
                         )
    except GenericDatabaseException, err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'report')
    except Exception, err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'report')


@app.route('/' + version_route + '/download/leadership/report', methods=['GET'])
def get_leadership_report():
    try:
        report = autokpi_app.get_leadership_report(HANDLER)
        date_time = datetime.datetime.now()
        return send_file(report,
                         attachment_filename='Leadership Report ' +
                         date_time.strftime(
                             "%m-%d-%Y %H %M %S") + '.xlsx',
                         as_attachment=True)
    except GenericDatabaseException, err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'report')
    except Exception, err:
        LOGGER.exception(err)
        return autokpi_app.exception(HANDLER, GenericDatabaseException, request.method, 'report')


@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
@app.route('/<path:path>', methods=['GET', 'POST'])
@login_required
def index(path=None):
    if CONFIG.BYPASS_SSO:
        user_ntid = CONFIG.BYPASS_SSO_NTID
        user_fullname = CONFIG.BYPASS_SSO_USER
        user_email = CONFIG.BYPASS_SSO_EMAIL
        oauth_code = 'ABCD1234'
        try:
            autokpi_app.check_user_auth(HANDLER, user_ntid)
        except UnauthorizedUserException, err:
            LOGGER.error(err)
            log_error()
            return unauthorized()
    else:
        try:
            user_ntid, user_fullname, user_email, oauth_code = AUTH.get_session()
        except TokenExpiredException as err:
            return login()
        except Exception as err:
            LOGGER.exception(err)
            log_exception()
    if request.args.get('code', None):
        resp = make_response(redirect(request.script_root))
    else:
        resp = make_response(render_template(
            'index.html',
            user_ntid=user_ntid,
            user_fullname=user_fullname,
            user_email=user_email,
            rpm_ver=get_version()
        ))
    resp.headers.extend({'oauth_code': oauth_code,
                         'orig_url': request.url_root})
    resp.set_cookie('code', oauth_code)
    return resp


def _get_param(req, param, default=None):
    """ Return param from incoming payload """
    if req.method == 'GET':
        return req.args.get(param, default)
    else:
        return req.json.get(param, default)


if __name__ == "__main__":
    app.run(host='localhost', port=ARGS.port, debug=True)

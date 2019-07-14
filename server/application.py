'''Application Layer'''

import csv
import logging
import time
import deprecation


from server.exceptions import GenericDatabaseException
from server.exceptions import UnauthorizedUserException

LOGGER = logging.getLogger('autokpi')

def check_user_auth(handler, netid):
    try:
        results = handler.user.check_user_auth(netid)
        return results
    except UnauthorizedUserException as err:
        LOGGER.exception('Could not check user authorization {}'.format(err))
        raise UnauthorizedUserException(err)
    except GenericDatabaseException as err:
        LOGGER.exception('Could not check user authorization {}'.format(err))
        raise GenericDatabaseException(err)
    except Exception as err:
        LOGGER.exception('An error has occurred: {}'.format(err))

def get_project(handler,project_id=None):
	try:
		projects = handler.project.get_project(project_id)
		if len(projects) == 0:
			return[]
		return _serialize_list_of_obj(projects)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get_project for {}: {}'.format(
			project_id, err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_project_history(handler,project_id):
	try:
		projects = handler.project.get_project_history(project_id)
		if len(projects) == 0:
			return[]
		return _serialize_list_of_obj(projects)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get project for {}: {}'.format(
			project_id, err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_milestone_history(handler,milestone_id):
	try:
		milestones = handler.project.get_milestone_history(milestone_id)
		if len(milestones) == 0:
			return[]
		return _serialize_list_of_obj(milestones)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get milestone for {}: {}'.format(
			milestone_id, err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_all_projects(handler):
    try:
        projects = handler.project.get_all_projects()
        if len(projects) == 0:
            return[]
        return _serialize_list_of_obj(projects)
    except GenericDatabaseException as err:
        LOGGER.exception('Could not get_project for {}: {}'.format(
            project_id, err))
        raise GenericDatabaseException(err)
    except Exception as err:
        LOGGER.exception('An error has occurred: {}'.format(err))
        raise

def get_archived_projects(handler):
    try:
        projects = handler.project.get_archived_projects()
        if len(projects) == 0:
            return[]
        return _serialize_list_of_obj(projects)
    except GenericDatabaseException as err:
        LOGGER.exception('Could not get_project for {}: {}'.format(
            project_id, err))
        raise GenericDatabaseException(err)
    except Exception as err:
        LOGGER.exception('An error has occurred: {}'.format(err))
        raise


@deprecation.deprecated(
    deprecated_in='1.1',
    removed_in='2.0',
    current_version='1.1',
    details='Use Create or Update Project instead'
    )
def save_project(handler, data):
	try:
		return handler.project.save_project(data)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not save project {}'.format(data.id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def create_project(handler, data, username):
	try:
		return handler.project.create_project(data, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not create project {}'.format(data.id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise


def update_project(handler, data, username):
	try:
		return handler.project.update_project(data, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not update projects {}'.format(data.id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def archive_project(handler, project_id, username):
	try:
		return handler.project.archive_project(project_id, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not archive project {}'.format(project_id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def restore_project(handler, project_id, username):
	try:
		return handler.project.restore_project(project_id, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not restore project {}'.format(project_id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def clean_projects(handler, project_ids):
	try:
		return handler.project.clean_projects(project_ids)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not clean projects {}'.format(err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_milestone(handler,milestone_id = None):
	try:
		milestones = handler.project.get_milestone(milestone_id)
		if len(milestones) == 0:
			return[]
		return _serialize_list_of_obj(milestones)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get_milestone for {}: {}'.format(
			milestone_id, err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_archived_milestones(handler):
	try:
		milestones = handler.project.get_archived_milestones()
		if len(milestones) == 0:
			return[]
		return _serialize_list_of_obj(milestones)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get archived milestones {}'.format(err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_project_milestones(handler, project_id, IDS_ONLY = False):
	try:
		milestones = handler.project.get_project_milestones(project_id, IDS_ONLY)
		if len(milestones) == 0:
			return []
		if IDS_ONLY:
			return milestones
		else:
			return _serialize_list_of_obj(milestones)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get_milestones for {}: {}'.format(
			project_id, err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

@deprecation.deprecated(
    deprecated_in='1.1',
    removed_in='2.0',
    current_version='1.1',
    details='Use Create or Update Milestone instead'
    )
def save_milestone(handler, data):
	try:
		return handler.project.save_milestone(data)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not save milestone {}'.format(data.id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def create_milestone(handler, data, username):
	try:
		return handler.project.create_milestone(data, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not create milestone {}'.format(data.id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise


def update_milestone(handler, data, username):
	try:
		return handler.project.update_milestone(data, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not update milestone {}'.format(data.id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def archive_milestone(handler, milestone_id, username):
	try:
		return handler.project.archive_milestone(milestone_id, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not archive milestone {}'.format(milestone_id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def restore_milestone(handler, milestone_id, username):
	try:
		return handler.project.restore_milestone(milestone_id, username)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not restore milestone {}'.format(milestone_id))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def clean_milestones(handler, milestone_ids):
	try:
		return handler.project.clean_milestones(milestone_ids)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not clean milestones {}'.format(err))
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_weekly_report(handler):
	try:
		projects =get_project(handler)
		milestones =get_milestone(handler)
		return handler.project.get_weekly_report(projects,milestones)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get data for report {}'.format(err) )
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def get_leadership_report(handler):
	try:
		projects =get_project(handler)
		return handler.project.get_leadership_report(projects)
	except GenericDatabaseException as err:
		LOGGER.exception('Could not get data for report {}'.format(err) )
		raise GenericDatabaseException(err)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def build_jsonapi_response(handler, data, urlroot):
	try:
		return _jsonserialise_list_of_obj(handler,data,urlroot)
	except Exception as err:
		LOGGER.exception('An error has occurred: {}'.format(err))
		raise

def _jsonserialise_list_of_obj(handler,list_of_obj, urlroot):
	return [handler.json.jsonSerialize(obj,urlroot) for obj in list_of_obj]

def response(handler, result, method, request_url):
	return handler.response.response(result, method, request_url)

def exception(handler, exception, method, object):
	return handler.response.exception(exception, method, object)

def map_data_to_obj(cls, **kwargs):
    return cls(**kwargs)

def _serialize_list_of_obj(list_of_obj):
    '''Returns serialized list of domain objects'''
    return [obj.serialize() for obj in list_of_obj]

'''Domain Layer

This layer includes all objects that will be used by the application
and handler layers
'''

import logging

LOGGER = logging.getLogger('autokpi')


def _unsanitize_string(str):
    if(str):
        str = str.replace("\\'", "'")
        str = str.replace('\\"', '"')
    return str


class BaseObject(object):
    @classmethod
    def make(cls, data):
        return cls(*data)

    def serialize(self):
        return self.__dict__


class Project(BaseObject):
    '''Base Project Class'''

    def __init__(self, fid=None, id=None, name=None, goal=None, description=None, note=None,
                 highlights=None, risks=None, owner=None, milestone=[]):
        self.type = 'project'
        self.id = id  # To make sure we get the unique id
        self.fid = fid  # Get Friendly ID
        self.route = self.type
        self.name = _unsanitize_string(name)
        self.goal = _unsanitize_string(goal)
        self.description = _unsanitize_string(description)
        self.highlights = _unsanitize_string(highlights)
        self.risks = _unsanitize_string(risks)
        self.owner = _unsanitize_string(owner)
        self.note = _unsanitize_string(note)
        self.related = ['milestone']
        self.milestone = milestone

class ProjectHistoryInstance(Project):
    '''Base Project Class'''

    def __init__(self, fid=None, id=None, name=None, goal=None, description=None, note=None,
                 highlights=None, risks=None, owner=None, action=None, date_occured=None,
                 username=None, milestone=[], changes=[]):

        Project.__init__(self, fid, id, name, goal, description, note,
                     highlights, risks, owner, milestone)

        self.action = action
        self.date_occured = date_occured
        self.username = username



class Milestone(BaseObject):
    '''Base Milestone History Instance Class'''

    def __init__(self, fid=None, id=None, project_root_id=None, project_guid=None, name=None, status=None,
                 startDate=None, endDate=None, completionDate=None, deliverable=None,
                 currentStatus=None, nextSteps=None, resources=None, percent=None):
        self.type = 'milestone'
        self.id = id  # To make sure we get the unique ID
        self.fid = fid  # Get Friendly ID
        self.route = self.type
        self.parent = project_guid  # To make sure we get the unique Project ID
        self.project_root_id = project_root_id
        self.parentType = 'project'
        self.name = _unsanitize_string(name)
        self.status = status
        self.startDate = startDate
        self.endDate = endDate
        self.completionDate = completionDate
        self.deliverable = _unsanitize_string(deliverable)
        self.currentStatus = _unsanitize_string(currentStatus)
        self.nextSteps = _unsanitize_string(nextSteps)
        self.resources = _unsanitize_string(resources)
        self.percent = percent

class MilestoneHistoryInstance(Milestone):
    '''Base Milestone History Instance Class'''

    def __init__(self, fid=None, id=None, project_root_id=None, project_guid=None, name=None, status=None,
                 startDate=None, endDate=None, completionDate=None, deliverable=None,
                 currentStatus=None, nextSteps=None, resources=None, percent=None,
                 action=None, date_occured=None, username=None, changes=[]):

        Milestone.__init__(self, fid, id, project_root_id, project_guid, name, status,
                     startDate, endDate, completionDate, deliverable,
                     currentStatus, nextSteps, resources, percent)

        self.action = action
        self.date_occured = date_occured
        self.username = username

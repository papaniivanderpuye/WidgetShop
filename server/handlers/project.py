'''Handler Layer'''
import datetime
import logging
import deprecation
import StringIO
import xlsxwriter
import textwrap

from server.handlers import sql as queries
from server.domain import (
    Project,
    Milestone,
    ProjectHistoryInstance,
    MilestoneHistoryInstance
)
from server.exceptions import GenericDatabaseException
from server.utils import _sanitize_string

LOGGER = logging.getLogger('autokpi')


class ProjectHandler(object):
    def __init__(self, adapter):
        self.adapter = adapter

    def get_project(self, project_id=None):
        try:
            if project_id == None:
                results = self.adapter.execute_and_map(
                    Project, queries.GET_PROJECTS)
            else:
                query = queries.GET_PROJECT_BY_ID.format(project_id)
                results = self.adapter.execute_and_map(Project, query)
            if len(results) == 0:
                LOGGER.info(results)
                if project_id == None:
                    return []
                else:
                    msg = 'Error retrieving project by ID.'
                raise Exception(msg)
            for project in results:
                milestone_list = []
                milestones = self.get_project_milestones(project.id, True)
                for milestone in milestones:
                    milestone_list.append(milestone[0])
                project.milestone = milestone_list
            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not retrieve project: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_project_history(self, project_id=None):
        try:

            query = queries.GET_PROJECT_HISTORY.format(project_id)
            results = self.adapter.execute_and_map(ProjectHistoryInstance, query)

            for i in range(1,len(results)):
                result = results[i]
                if result.action == 'UPDATE':
                    prev_result = results[i-1]
                    result_dict = result.__dict__
                    prev_result_dict = prev_result.__dict__
                    changes = []
                    for key in result_dict:
                        if ( (key not in ['fid','id','username','date_occured','action']) and (result_dict[key] !=  prev_result_dict[key]) ):
                            changes.append(key)
                    result.changes = changes

            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not retrieve project: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_milestone_history(self, milestone_id=None):
        try:

            query = queries.GET_MILESTONE_HISTORY.format(milestone_id)
            results = self.adapter.execute_and_map(MilestoneHistoryInstance, query)

            for i in range(1,len(results)):
                result = results[i]
                if result.action == 'UPDATE':
                    prev_result = results[i-1]
                    result_dict = result.__dict__
                    prev_result_dict = prev_result.__dict__
                    changes = []
                    for key in result_dict:
                        if ( (key not in ['fid','id','username','date_occured','action']) and (result_dict[key] !=  prev_result_dict[key]) ):
                            changes.append(key)
                    result.changes = changes

            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not retrieve milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_all_projects(self):
        try:

            results = self.adapter.execute_and_map(
                    Project, queries.GET_ALL_PROJECTS)

            LOGGER.info(results)
            for project in results:
                milestone_list = []
                milestones = self.get_project_milestones(project.id, True)
                for milestone in milestones:
                    milestone_list.append(milestone[0])
                project.milestone = milestone_list
            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not retrieve archived projects: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_archived_projects(self):
        try:

            results = self.adapter.execute_and_map(
                    Project, queries.GET_ARCHIVED_PROJECTS)

            LOGGER.info(results)
            for project in results:
                milestone_list = []
                milestones = self.get_project_milestones(project.id, IDS_ONLY=True, all_milestones=True)
                for milestone in milestones:
                    milestone_list.append(milestone[0])
                project.milestone = milestone_list
            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not retrieve archived projects: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    @deprecation.deprecated(
        deprecated_in='1.1',
        removed_in='2.0',
        current_version='1.1',
        details='Use Create or Update Project instead'
    )
    def save_project(self, data):
        try:
            query = queries.SAVE_PROJECT.format(
                data.id,
                _sanitize_string(data.name),
                _sanitize_string(data.goal),
                _sanitize_string(data.note),
                _sanitize_string(data.description),
                _sanitize_string(data.highlights),
                _sanitize_string(data.risks),
                _sanitize_string(data.owner)
            )
            self.adapter.execute(query)
            return [0, 'complete']
        except GenericDatabaseException as err:
            LOGGER.exception(
                'Could not save project: {}  {}'.format(err, query))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

        try:
            # Get project id and return it
            query = queries.GET_PROJECT_ID.format(data.name)
            results = self.adapter.execute(query, fetch_one=True)
            if len(results) == 0:
                LOGGER.info(results)
                raise Exception('Error retrieving project ID.')
            return results[0]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not save project: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def create_project(self, data, username):
        try:
            output = 0
            output_msg = None
            args = (
                output,
                output_msg,
                _sanitize_string(data.fid),
                _sanitize_string(data.name),
                _sanitize_string(data.goal),
                _sanitize_string(data.note),
                _sanitize_string(data.description),
                _sanitize_string(data.highlights),
                _sanitize_string(data.risks),
                _sanitize_string(data.owner),
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("CREATE_PROJECT", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not create project: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def update_project(self, data, username):
        try:
            output = 0
            output_msg = None

            args = (
                output,
                output_msg,
                data.id,
                _sanitize_string(data.name),
                _sanitize_string(data.goal),
                _sanitize_string(data.note),
                _sanitize_string(data.description),
                _sanitize_string(data.highlights),
                _sanitize_string(data.risks),
                _sanitize_string(data.owner),
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("UPDATE_PROJECT", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not update project: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)



    @deprecation.deprecated(
        deprecated_in='1.1',
        removed_in='2.0',
        current_version='1.1',
        details='Should be able to Archive Projects in UI'
    )
    def clean_projects(self, project_ids):
        try:
            # Get List of completed projects to not delete them
            clist = []
            completed_list = self.adapter.execute(
                queries.GET_COMPLETED_PROJECT_IDS, fetch_many=True)
            for pid in completed_list:
                clist += pid
            plist = "','".join(project_ids)
            plist = plist + "','".join(clist)
            plist = "'" + plist + "'"
            query = queries.CLEAN_PROJECTS.format(plist)
            self.adapter.execute(query)
            return [0, 'complete']
        except GenericDatabaseException as err:
            LOGGER.exception('Could not clean project: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_milestone(self, milestone_id=None):
        try:
            if milestone_id == None:
                results = self.adapter.execute_and_map(
                    Milestone, queries.GET_MILESTONES)
            else:
                query = queries.GET_MILESTONE_BY_ID.format(milestone_id)
                results = self.adapter.execute_and_map(Milestone, query)
            if len(results) == 0:
                LOGGER.info(results)
                if milestone_id == None:
                    msg = 'Error retrieving milestones'
                else:
                    msg = 'Error retrieving milestone by ID'
                raise Exception(msg)
            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not get milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_archived_milestones(self, milestone_id=None):
        try:

            results = self.adapter.execute_and_map(
                Milestone, queries.GET_ARCHIVED_MILESTONES)
            LOGGER.info(results)
            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not get milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_project_milestones(self, project_id, IDS_ONLY=False, all_milestones=False):
        try:
            if IDS_ONLY:
                if all_milestones:
                    results = self.adapter.execute(
                    queries.GET_PROJECT_ALL_MILESTONES_IDS.format(project_id), fetch_many=True)
                else:
                    results = self.adapter.execute(
                    queries.GET_PROJECT_MILESTONES_IDS.format(project_id), fetch_many=True)
            elif all_milestones:
                query = queries.GET_ALL_MILESTONES + \
                    "WHERE PROJECT_GUID = '{}'".format(project_id)
                results = self.adapter.execute_and_map(Milestone, query)
            else:
                query = queries.GET_MILESTONES + \
                    "AND PROJECT_GUID = '{}'".format(project_id)
                results = self.adapter.execute_and_map(Milestone, query)
            if len(results) == 0:
                return []
            return results
        except GenericDatabaseException as err:
            LOGGER.exception('Could not get milestones: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    @deprecation.deprecated(
        deprecated_in='1.1',
        removed_in='2.0',
        current_version='1.1',
        details='Use Create or Update Milestone instead'
    )
    def save_milestone(self, data):
        try:
            query = queries.SAVE_MILESTONE.format(
                data.id,
                data.parent,
                _sanitize_string(data.name),
                data.status,
                data.startDate,
                data.endDate,
                "'" + data.completionDate + "'" if data.completionDate else 'NULL',
                _sanitize_string(data.deliverable),
                _sanitize_string(data.currentStatus),
                _sanitize_string(data.nextSteps),
                _sanitize_string(data.resources),
                data.percent
            )
            self.adapter.execute(query)
            return [0, 'complete']
        except GenericDatabaseException as err:
            LOGGER.exception('Could not save milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def create_milestone(self, data, username):
        try:
            output = 0
            output_msg = None
            args = (
                output,
                output_msg,
                _sanitize_string(data.name),
                data.project_root_id,
                data.status,
                data.startDate,
                data.endDate,
                data.completionDate if data.completionDate else None,
                _sanitize_string(data.deliverable),
                _sanitize_string(data.currentStatus),
                _sanitize_string(data.nextSteps),
                _sanitize_string(data.resources),
                data.percent,
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("CREATE_MILESTONE", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not create milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def update_milestone(self, data, username):
        try:
            output = 0
            output_msg = None
            args = (
                output,
                output_msg,
                data.id,
                _sanitize_string(data.name),
                data.project_root_id,
                data.status,
                data.startDate,
                data.endDate,
                data.completionDate if data.completionDate else None,
                _sanitize_string(data.deliverable),
                _sanitize_string(data.currentStatus),
                _sanitize_string(data.nextSteps),
                _sanitize_string(data.resources),
                data.percent,
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("UPDATE_MILESTONE", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not update milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    @deprecation.deprecated(
        deprecated_in='1.1',
        removed_in='2.0',
        current_version='1.1',
        details='Should be able to Archive Milestone in UI'
    )
    def clean_milestones(self, milestone_ids):
        try:
            mlist = "','".join(milestone_ids)
            mlist = "'" + mlist + "'"
            query = queries.CLEAN_MILESTONES.format(mlist)
            self.adapter.execute(query)
            return [0, 'complete']
        except GenericDatabaseException as err:
            LOGGER.exception('Could not clean milestones: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def archive_milestone(self, id, username):
        try:
            output = 0
            output_msg = None

            args = (
                output,
                output_msg,
                id,
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("ARCHIVE_MILESTONE", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not archive milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def restore_milestone(self, id, username):
        try:
            output = 0
            output_msg = None

            args = (
                output,
                output_msg,
                id,
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("RESTORE_MILESTONE", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not restore milestone: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def archive_project(self, project_id, username):
        try:
            milestones_to_delete_ids = self.adapter.execute(
                queries.GET_PROJECT_MILESTONES_IDS.format(project_id), fetch_many=True)

            for milestone_id_result in  milestones_to_delete_ids:
                milestone_id =_sanitize_string(milestone_id_result[0])
                milestone_output = 0
                milestone_output_msg = None
                milestone_args = (
                    milestone_output,
                    milestone_output_msg,
                    milestone_id,
                    _sanitize_string(username) if username else None
                )
                self.archive_milestone(milestone_id, username)


            output = 0
            output_msg = None
            args = (
                output,
                output_msg,
                project_id,
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("ARCHIVE_PROJECT", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not archive project and linked milestones: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def restore_project(self, project_id, username):
        try:
            output = 0
            output_msg = None
            args = (
                output,
                output_msg,
                project_id,
                _sanitize_string(username) if username else None
            )

            results = self.adapter.call_proc("RESTORE_PROJECT", args)
            return results[:2]
        except GenericDatabaseException as err:
            LOGGER.exception('Could not restore project: {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception as err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise Exception(err)

    def get_leadership_report(self, projects):
        try:
            report = StringIO.StringIO()
            workbook = xlsxwriter.Workbook(report)
            worksheet = workbook.add_worksheet()
            row_index = 0

            # Fill in and Format Title
            table_title = 'TES Automation & Strategy Leadership Report'
            title_format = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'font_size': 24,
                'bg_color': '#9180ff',
                'font_color': 'white',
                'bold': True,
            })
            worksheet.merge_range(
                row_index,
                0,
                row_index,
                2,
                table_title,
                title_format,
            )
            worksheet.set_row(row_index, 70)

            # Fill in Leadership Data
            row_index += 2
            row_index = self._populate_weekly_progress(
                worksheet,
                workbook,
                projects,
                row_index
            )

            workbook.close()
            report.seek(0)

            return report
        except GenericDatabaseException, err:
            LOGGER.exception(
                'Could not create leadership report {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception, err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise

    def get_weekly_report(self, projects, milestones):
        try:
            report = StringIO.StringIO()
            workbook = xlsxwriter.Workbook(report)
            id_to_name = {}
            worksheet = workbook.add_worksheet()
            row_index = 0

            # Preparing Dictionary for filling in Milestone Data
            for project in projects:
                id_to_name[project['id']] = project['name']

            # Fill in and Format Title
            table_title = 'TES Automation & Strategy Weekly Status'
            title_format = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'font_size': 24,
                'bg_color': '#9180ff',
                'font_color': 'white',
                'bold': True,
            })
            worksheet.merge_range(
                row_index,
                0,
                row_index,
                2,
                table_title,
                title_format,
            )
            worksheet.set_row(row_index, 70)

            # Fill in Leadership Data
            row_index += 2
            row_index = self._populate_weekly_progress(
                worksheet,
                workbook,
                projects,
                row_index
            )

            # Fill in Project Data
            row_index += 2
            row_index = self._populate_projects(
                worksheet,
                workbook,
                projects,
                row_index
            )

            # Fill in Milestone Data
            row_index += 2
            self._populate_milestones(
                worksheet,
                workbook,
                milestones,
                id_to_name,
                row_index
            )

            workbook.close()
            report.seek(0)

            return report
        except GenericDatabaseException, err:
            LOGGER.exception('Could not create  weekly report {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception, err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise

    def _populate_weekly_progress(
            self,
            worksheet,
            workbook,
            projects,
            row_index,
    ):
        try:
            column_names = ['Goal', 'Project', 'Note']
            table_title = 'Weekly Progress'
            row_index = self._create_table_format(
                worksheet,
                workbook,
                table_title,
                column_names,
                len(projects),
                row_index,
            )

            for project in projects:
                # Modify Key referrals for efficient data filling
                project['project'] = project['name']

                # Fill in Data
                worksheet.set_row(row_index, 70)
                self._populate_in_xlsx(
                    worksheet,
                    workbook,
                    project,
                    column_names,
                    row_index
                )
                row_index += 1

            return row_index
        except GenericDatabaseException, err:
            LOGGER.exception('Could not create report {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception, err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise

    def _populate_projects(
            self,
            worksheet,
            workbook,
            projects,
            row_index,
    ):
        try:
            column_names = [
                'ID',
                'Name',
                'Goal',
                'Note',
                'Description',
                'Highlights',
                'Risks',
                'Product Owner',
            ]
            table_title = 'Project Defintition'
            row_index = self._create_table_format(
                worksheet,
                workbook,
                table_title,
                column_names,
                len(projects),
                row_index,
            )

            for project in projects:
                # Modify Key referrals for efficient data filling
                project['productowner'] = project.pop('owner', None)
                project['id'] = project.pop('fid', None)

                # Fill in Data
                worksheet.set_row(row_index, 70)
                self._populate_in_xlsx(
                    worksheet,
                    workbook,
                    project,
                    column_names,
                    row_index
                )
                row_index += 1

            return row_index
        except GenericDatabaseException, err:
            LOGGER.exception(
                'Could not Could not create report {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception, err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise

    def _populate_milestones(
            self,
            worksheet,
            workbook,
            milestones,
            id_to_name,
            row_index,
    ):
        try:
            column_names = [
                'Percent Complete',
                'ID',
                'Project',
                'Milestone',
                'Status',
                'Deliverable',
                'Start Date',
                'End Date',
                'Completion Date',
                'Current Status',
                'Next Steps',
                'Resources',
            ]
            table_title = 'Milestones'
            row_index = self._create_table_format(
                worksheet,
                workbook,
                table_title,
                column_names,
                len(milestones),
                row_index,
            )

            for milestone in milestones:
                # Modify Key referrals for efficient data filling
                milestone['project'] = id_to_name[milestone.pop(
                    'parent', None)]
                milestone['milestone'] = milestone.pop('name', None)
                milestone['percentcomplete'] = milestone.pop('percent', None)
                milestone['id'] = milestone.pop('fid', None)

                # Fill in Data
                worksheet.set_row(row_index, 70)
                self._populate_in_xlsx(
                    worksheet,
                    workbook,
                    milestone,
                    column_names,
                    row_index
                )
                row_index += 1

            return worksheet
        except GenericDatabaseException, err:
            LOGGER.exception('Could not create report {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception, err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise

    def _populate_in_xlsx(
            self,
            worksheet,
            workbook,
            data_dict,
            column_names,
            row_index,
    ):

        try:
            # Set Up Date Formatting
            date_format = workbook.add_format({
                'num_format': 'mm/dd/yy',
                'align': 'top',
                'align': 'left',
                'valign': 'vjustify',
                'font_size': 14,
            })

            # Set Up General Cell Format
            cell_format = workbook.add_format({
                'align': 'top',
                'valign': 'vjustify',
                'font_size': 14
            })

            # Standardize keys
            for key in data_dict.keys():
                standardized_key = key.lower()
                data_dict[standardized_key] = data_dict.pop(key, None)

            #Fill in data
            for i in range(len(column_names)):
                item = column_names[i].lower().replace(' ', '')
                data = data_dict[item]

                if 'date' in item:
                    worksheet.write(row_index, i, data, date_format)

                elif 'percent' in item:
                    worksheet.conditional_format(row_index, i, row_index, i,
                                                 {
                                                     'type': 'data_bar',
                                                     'bar_color': '#63C384',
                                                     'min_type': 'num',
                                                     'max_type': 'num',
                                                     'min_value': 0,
                                                     'max_value': 100,
                                                     'bar_solid': True,
                                                 }
                                                 )
                    worksheet.write(row_index, i, data)

                else:
                    worksheet.write(row_index, i, data, cell_format)

            return worksheet
        except GenericDatabaseException, err:
            LOGGER.exception('Could not create report {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception, err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise

    def _create_table_format(
            self,
            worksheet,
            workbook,
            worksheet_title,
            column_names,
            table_height,
            row_index,
    ):
        try:
            title_format = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'font_size': 20,
                'bg_color': '#b0e2ff',
            })
            column_header_format = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'font_size': 16
            })

            # Fill In Title
            worksheet.merge_range(
                row_index,
                0,
                row_index,
                len(column_names) - 1,
                worksheet_title,
                title_format,
            )
            worksheet.set_row(row_index, 70)
            worksheet.set_column(0, len(column_names) - 1, 35)

            # Fill in Column Names.
            row_index += 1
            header_list = []
            for i in range(len(column_names)):
                header_list.append({
                    'header': column_names[i],
                    'header_format': column_header_format
                })

            worksheet.add_table(
                row_index,
                0,
                row_index + table_height,
                len(column_names) - 1,
                {
                    'columns': header_list,
                    'banded_rows': False,
                    'style': 'Table Style Medium 16'
                }
            )
            worksheet.set_row(row_index, 70)
            next_row_index = row_index + 1

            return next_row_index
        except GenericDatabaseException, err:
            LOGGER.exception('Could not create report {}'.format(err))
            raise GenericDatabaseException(err)
        except Exception, err:
            LOGGER.exception('An error has occurred: {}'.format(err))
            raise

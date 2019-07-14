/**Milestones**/

import React from "react";
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  PageHeader,
  Table,
  ProgressBar,
  ButtonGroup,
  ButtonToolbar,
  Modal
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Pagination from "react-js-pagination";
import ReactLoading from "react-loading";
import { Article, Section } from "./Common";

var $ = require("jquery");
const USER_FULL_NAME = document
  .getElementById("content")
  .getAttribute("user_fullname");

export default class Milestones extends React.Component {
  constructor(props) {
    super(props);

    this.loadProjects = this.loadProjects.bind(this);
    this.loadMilestones = this.loadMilestones.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.getEditMilestoneButton = this.getEditMilestoneButton.bind(this);
    this.getProjectDict = this.getProjectDict.bind(this);
    this.handleFilterTermChange = this.handleFilterTermChange.bind(this);
    this.getFilteredMilestones = this.getFilteredMilestones.bind(this);
    this.getMilestoneTimelineButton = this.getMilestoneTimelineButton.bind(
      this
    );
    this.sendArchive = this.sendArchive.bind(this);
    this.handleArchiveModalShow = this.handleArchiveModalShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.showArchiveResult = this.showArchiveResult.bind(this);
    this.sendArchive = this.sendArchive.bind(this);

    this.state = {
      id: props.match.params.projectId,
      projectNameDict: {},
      milestones: [],
      showLoading: false,
      activePage: 1,
      rowsPerPage: 5,
      filterTerm: "",
      showArchiveModal: false,
      showArchiveSend: false,
      showArchiveLoading: false,
      archiveResult: false,
      currentMilestoneId: ""
    };
  }

  componentDidMount() {
    this.loadProjects();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  handleArchiveModalShow(id) {
    this.setState({
      showArchiveModal: true,
      currentMilestoneId: id
    });
  }

  sendArchive() {
    var data = {};
    var submitUrl = "/v1/archive/milestone/";
    var httpMethod = "PUT";
    var actionTaken = "archived";

    // Prepare payload
    data.Username = USER_FULL_NAME;

    $.ajax({
      url: submitUrl + this.state.currentMilestoneId,
      type: httpMethod,
      contentType: "application/json",
      data: JSON.stringify(data),
      beforeSend: function() {
        this.setState({
          showArchiveModal: false,
          showArchiveSend: true,
          showArchiveLoading: true
        });
      }.bind(this),
      success: function(results) {
        this.setState({
          archiveResult: "Milestone Archived!"
        });
      }.bind(this),
      error: function(xhr, textStatus, error) {
        this.setState({
          archiveLoading: false,
          archiveResult: "A Database Error Occured, Please Contact Support"
        });
      }.bind(this),

      complete: function() {
        this.setState({ showArchiveLoading: false });
      }.bind(this)
    });
  }

  handleClose() {
    this.setState({
      showArchiveModal: false,
      showArchiveSend: false
    });
  }

  handleArchiveClose() {
    window.location.reload();
  }

  handleFilterTermChange(e) {
    this.setState({ filterTerm: e.target.value });
  }

  getFilteredMilestones(milestones) {
    var filteredMilestones = [];
    var searchString = this.state.filterTerm.toLowerCase();
    var searchAttributes = [
      "name",
      "currentStatus",
      "nextSteps",
      "deliverable"
    ];

    for (var i = 0; i < this.state.milestones.length; i++) {
      var containsString = false;
      var milestone = milestones[i];
      for (var j = 0; j < searchAttributes.length; j++) {
        var key = searchAttributes[j];
        var data = milestone[key];
        if (data && !containsString) {
          containsString = data.toLowerCase().includes(searchString);
        }
      }
      if (containsString) {
        filteredMilestones.push(milestone);
      }
    }
    return filteredMilestones;
  }

  getArchiveMilestoneButton(projectId, milestoneId) {
    var archiveMilestonButton = (
      <Button
        onClick={() => this.handleArchiveModalShow(milestoneId)}
        className="edit-milestone-btn btn btn-danger btn-sm"
      >
        <span className="glyphicon glyphicon-folder-close" />
        &nbsp; Archive Milestone
      </Button>
    );
    return archiveMilestonButton;
  }

  getMilestoneTimelineButton(milestoneId) {
    var milestoneTimelineButton = (
      <Link
        to={"/timeline/milestone/" + milestoneId}
        className=" btn btn-default btn-sm align-left"
      >
        <span className="glyphicon glyphicon-time" />
        &nbsp; View Timeline
      </Link>
    );
    return milestoneTimelineButton;
  }

  showArchiveResult() {
    if (true) {
      return (
        <div>
          <Modal.Body>
            <h4>{this.state.archiveResult}</h4>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.handleArchiveClose}>Close</Button>
          </Modal.Footer>
        </div>
      );
    }
  }

  loadProjects() {
    $.ajax({
      url: "/v1/projects",
      type: "GET",
      contentType: "application/json",
      beforeSend: function() {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(data) {
        var projects = data.data;
        projects = Array.isArray(projects) ? projects : [projects];
        this.setState({ projectNameDict: this.getProjectDict(projects) });
        this.loadMilestones();
      }.bind(this)
    });
  }

  loadMilestones() {
    $.ajax({
      url: "/v1/milestones",
      type: "GET",
      contentType: "application/json",
      success: function(data) {
        var milestones = data.data;
        milestones = Array.isArray(milestones) ? milestones : [milestones];
        this.setState({ milestones: this.flattenResults(milestones) });
      }.bind(this),
      complete: function() {
        this.setState({ showLoading: false });
      }.bind(this)
    });
  }

  flattenResults(results) {
    for (var i = 0; i < results.length; i++) {
      results[i] = this.flattenMilestone(results[i]);
    }
    return results;
  }

  getProjectDict(projects) {
    var projectNameDict = {};
    for (var i = 0; i < projects.length; i++) {
      var name = projects[i].attributes.name;
      var fid = projects[i].attributes.fid;
      projectNameDict[fid] = name;
    }
    return projectNameDict;
  }

  flattenMilestone(result) {
    var attributeKeys = Object.keys(result.attributes);
    attributeKeys.forEach(function(key) {
      result[key] = result.attributes[key];
    });
    result.project_id = result.relationships.project.data.id;

    delete result.attributes;
    return result;
  }

  handlePageChange(pageNumber) {
    this.setState({ activePage: pageNumber });
  }

  handleResultsPageChange(e) {
    this.setState({ rowsPerPage: e.target.value });
  }

  getEditMilestoneButton(projectId, milestoneId) {
    var milestoneEditLink = "/milestone/edit/" + projectId + "/" + milestoneId;
    var editMilestonButton = (
      <Link
        to={milestoneEditLink}
        className="edit-milestone-btn btn btn-primary btn-sm"
      >
        <span className="glyphicon glyphicon-pencil" />
        &nbsp; Edit Milestone
      </Link>
    );

    return editMilestonButton;
  }

  sendMilestone() {
    var data = {};
    var submitUrl = "/v1/milestone/";
    var httpMethod = "POST";
    var actionTaken = "archived";

    $.ajax({
      url: submitUrl,
      type: httpMethod,
      contentType: "application/json",
      //data: JSON.stringify(data),
      beforeSend: function() {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(results) {
        this.setState({
          archiveLoading: false,
          archiveResult: "A Database Error has Occured please Contact Support"
        });
      }.bind(this),
      error: function(xhr, textStatus, error) {
        this.setState({
          archiveLoading: false,
          archiveResult: "Milestone Has Succesfully Been archived!"
        });
      }.bind(this)
    });
  }

  render() {
    var milestones = this.state.milestones;
    var milestones = this.getFilteredMilestones(this.state.milestones);
    var project = this.state.project;
    var totalResults = milestones.length;
    var rowsMax = this.state.activePage * this.state.rowsPerPage; // page 2: 20
    var rowsMin = rowsMax - this.state.rowsPerPage + 1; // page 2: 11
    milestones = milestones.slice(rowsMin - 1, rowsMax);

    var pages = (
      <div className="text-center">
        <Pagination
          activePage={this.state.activePage}
          itemsCountPerPage={this.state.rowsPerPage}
          totalItemsCount={totalResults}
          pageRangeDisplayed={5}
          onChange={this.handlePageChange}
        />
      </div>
    );

    var addNewMilestoneLink = "#";
    if (this.state.id) {
      addNewMilestoneLink = "/milestone/edit/" + this.state.id + "/";
    }

    var addMilestoneButton = (
      <Link
        to={addNewMilestoneLink}
        className="add-milestone-btn btn btn-primary btn-sm"
        style={{
          align: "pull-right",
          float: "right"
        }}
      >
        <span className="glyphicon glyphicon-plus" />
        Add Milestone
      </Link>
    );

    var resultsPage = (
      <div className="text-center btn">
        <FormGroup
          controlId="formResultsPage"
          className="results-per-page-container"
        >
          <ControlLabel>Results per page:</ControlLabel>
          <FormControl
            className="results-per-page "
            componentClass="select"
            placeholder={5}
            onChange={this.handleResultsPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </FormControl>
          <div className="results-stats">
            {" "}
            [ {this.state.milestones.length} total results ]
          </div>
        </FormGroup>
      </div>
    );

    var projectEditLink = "/project/edit/" + this.state.id;

    var editProjectButton = (
      <Link to={projectEditLink} className="btn btn-primary btn-sm">
        <span className="glyphicon glyphicon-pencil" />
        Edit Project
      </Link>
    );

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left">
          <PageHeader>
            <small>Milestones</small>
          </PageHeader>
          <p>Select a Milestone to edit or to view it's parent Project</p>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>TES Automation & Strategy Milestones</PageHeader>
          <form>
            <FormGroup controlId="formFilter">
              <FormControl
                type="text"
                value={this.state.filterTerm}
                placeholder="Type to filter milestones"
                onChange={this.handleFilterTermChange}
                onKeyPress={e => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
            </FormGroup>
          </form>
          {project != null ? (
            <div>
              <div>
                <h3>Highlights</h3>
              </div>

              <p>
                {project.highlights.match(/^\s*$/)
                  ? "No Highlights"
                  : project.highlights}
              </p>
              <br />
              <h4>Notes</h4>
              <p>{project.note.match(/^\s*$/) ? "No Notes" : project.note}</p>
              <br />
            </div>
          ) : null}

          {resultsPage}

          {pages}
          {this.state.showLoading ? (
            <div className="loading-screen">
              <Section>
                <Article>
                  <ReactLoading
                    type="spin"
                    color="#000000"
                    height={50}
                    width={50}
                  />
                  <div>Loading..</div>
                </Article>
              </Section>
            </div>
          ) : null}
          {!this.state.showLoading && milestones.length > 0 ? (
            <Table bordered={true} responsive={true} hover={true}>
              <thead>
                <tr>
                  <th>Progress</th>
                  <th>Name</th>
                  <th>Project Name</th>
                  <th>Deliverable</th>
                  <th width={"14%"}>Note</th>
                  <th width={"14%"}>Start Date</th>
                  <th width={"14%"}>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map(
                  function(row) {
                    var percent = parseInt(row.percent);
                    var status = row.status.toLowerCase();
                    var barStyle = "";
                    var startDate = row.startDate.replace("00:00:00 GMT", "");
                    var endDate = row.endDate.replace("00:00:00 GMT", "");

                    if (status == "Complete".toLowerCase()) {
                      barStyle = "success";
                    } else if (status == "At Risk".toLowerCase()) {
                      barStyle = "warning";
                    } else if (status == "Blocked".toLowerCase()) {
                      barStyle = "danger";
                    } else {
                      barStyle = "info";
                    }

                    return (
                      <tr
                        className="animated animatedFadeInUp fadeInUp"
                        key={row.id + this.state.filterTerm}
                      >
                        <td>
                          <ProgressBar
                            bsStyle={barStyle}
                            now={percent}
                            label={row.percent}
                          />
                        </td>
                        <td>
                          <div className="cell-display-scroll">{row.name}</div>
                        </td>
                        <td>
                          <div className="cell-display-scroll ">
                            <Link
                              className="hvr-fade"
                              to={"project/view/" + row.project_id}
                            >
                              {this.state.projectNameDict[row.project_root_id]}
                            </Link>
                          </div>
                        </td>
                        <td>
                          <div className="cell-display-scroll ">
                            {row.deliverable}
                          </div>
                        </td>
                        <td>
                          {" "}
                          <div className="cell-display-scroll">
                            Current Status:
                            <br /> {row.currentStatus}
                            <br />
                            <br />
                            Next Steps:
                            <br /> {row.nextSteps}
                          </div>
                        </td>
                        <td>{startDate}</td>
                        <td>{endDate}</td>
                        <td>
                          <div className="cell-display-scroll">
                            {row.status}
                          </div>
                        </td>
                        <td>
                          <ButtonGroup vertical={true}>
                            {this.getEditMilestoneButton(
                              row.project_id,
                              row.id
                            )}
                            <br />{" "}
                            {this.getArchiveMilestoneButton(
                              row.project_id,
                              row.id
                            )}
                            <br /> {this.getMilestoneTimelineButton(row.id)}
                          </ButtonGroup>
                        </td>
                      </tr>
                    );
                  }.bind(this)
                )}
              </tbody>
            </Table>
          ) : (
            <div className="text-center">
              {!this.state.showLoading ? "No Current Milestones" : null}
            </div>
          )}
          {pages}
        </div>
        <Modal show={this.state.showArchiveModal} onHide={this.handleClose}>
          <Modal.Body>
            <h4>Are you sure you want to archive this Milestone?</h4>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.sendArchive}>Archive Milestone</Button>
            <Button onClick={this.handleClose}>Cancel</Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showArchiveSend} onHide={this.handleClose}>
          {this.state.showArchiveLoading ? (
            <div>
              <Modal.Body>
                <div className="loading-screen text-center">
                  <ReactLoading
                    type="cylon"
                    color="#000000"
                    height={50}
                    width={50}
                  />
                  Loading
                </div>
              </Modal.Body>
            </div>
          ) : (
            this.showArchiveResult()
          )}
        </Modal>
      </div>
    );
  }
}

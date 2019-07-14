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
  Label,
  ListGroup,
  ListGroupItem,
  Badge,
  OverlayTrigger,
  Tooltip,
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

export default class ArchivedMilestones extends React.Component {
  constructor(props) {
    super(props);

    this.loadProjects = this.loadProjects.bind(this);
    this.loadArchivedMilestones = this.loadArchivedMilestones.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.getEditMilestoneButton = this.getEditMilestoneButton.bind(this);
    this.getProjectDict = this.getProjectDict.bind(this);
    this.handleFilterTermChange = this.handleFilterTermChange.bind(this);
    this.getFilteredMilestones = this.getFilteredMilestones.bind(this);
    this.getRestoreMilestoneButton = this.getRestoreMilestoneButton.bind(this);
    this.handleRestoreModalShow = this.handleRestoreModalShow.bind(this);
    this.sendRestore = this.sendRestore.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.showRestoreResult = this.showRestoreResult.bind(this);

    this.state = {
      id: props.match.params.projectId,
      projectNameDict: {},
      milestones: [],
      showLoading: false,
      activePage: 1,
      rowsPerPage: 5,
      filterTerm: "",
      showAchiveModal: false,
      showAchiveSend: false,
      showRestoreLoading: false,
      restoreResult: false,
      currentId: "",
      objectType: "",
      projectRestored: false
    };
  }

  componentDidMount() {
    this.loadProjects();
  }

  sendRestore() {
    var data = {};
    var submitUrl = "/v1/restore/project/";
    var httpMethod = "PUT";
    var actionTaken = "restored";

    //Changing to Milestone URL if Archiving Milestone
    if (this.state.objectType == "milestone") {
      submitUrl = "/v1/restore/milestone/";
    }

    // Prepare payload
    data.Username = USER_FULL_NAME;

    $.ajax({
      url: submitUrl + this.state.currentId,
      type: httpMethod,
      contentType: "application/json",
      data: JSON.stringify(data),
      beforeSend: function() {
        this.setState({
          showAchiveModal: false,
          showAchiveSend: true,
          showRestoreLoading: true
        });
      }.bind(this),
      success: function(results) {
        var changeResult = {
          restoreResult: "Milestone Restored!"
        };
        if (this.state.objectType == "project") {
          changeResult = {
            restoreResult: "Project Restored!",
            projectRestored: true
          };
        }
        this.setState(changeResult);
      }.bind(this),
      error: function(xhr, textStatus, error) {
        this.setState({
          restoreLoading: false,
          restoreResult: "A Database Error Occured, Please Contact Support"
        });
      }.bind(this),

      complete: function() {
        this.setState({ showRestoreLoading: false });
      }.bind(this)
    });
  }

  showRestoreResult() {
    if (true) {
      return (
        <div>
          <Modal.Body>
            <h4>{this.state.restoreResult}</h4>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleRestoreClose}>Close</Button>
          </Modal.Footer>
        </div>
      );
    }
  }

  handleClose() {
    this.setState({
      showAchiveModal: false,
      showAchiveSend: false
    });
  }

  handleRestoreClose() {
    window.location.reload();
  }

  handleRestoreModalShow(id, objectType) {
    this.setState({
      showAchiveModal: true,
      currentId: id,
      objectType: objectType
    });
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

  loadProjects() {
    $.ajax({
      url: "/v1/all/projects",
      type: "GET",
      contentType: "application/json",
      beforeSend: function() {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(data) {
        var projects = data.data;
        this.setState({ projectNameDict: this.getProjectDict(projects) });
        this.loadArchivedMilestones();
      }.bind(this)
    });
  }

  loadArchivedMilestones() {
    $.ajax({
      url: "/v1/archive/milestones",
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

  getEditMilestoneButton(id, milestoneId) {
    var milestoneEditLink = "/milestone/edit/" + id + "/" + milestoneId;
    var editMilestonButton = (
      <Link
        to={milestoneEditLink}
        className="edit-milestone-btn btn btn-default btn-sm"
      >
        <span className="glyphicon glyphicon-pencil" />
        &nbsp; Edit Milestone
      </Link>
    );

    return editMilestonButton;
  }

  getRestoreMilestoneButton(id, milestoneId) {
    var milestoneRestoreLink = "/milestone/restore/" + id + "/" + milestoneId;
    var milestoneRestoreLink = "#";
    var restoreMilestonButton = (
      <Link
        to={milestoneRestoreLink}
        className="edit-milestone-btn btn btn-danger btn-sm"
      >
        <span className="glyphicon glyphicon-folder-close" />
        &nbsp; Restore Milestone
      </Link>
    );
    return restoreMilestonButton;
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
          <p>
            Click a Tool Button to Restore a Milestone or View it's Timeline.
          </p>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>Archived Milestones</PageHeader>
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

          {!this.state.showLoading && milestones.length === 0 ? (
            <div className="text-center">No Current Milestones</div>
          ) : (
            resultsPage
          )}

          {milestones.length > 0 ? pages : null}
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
          {milestones.length > 0 ? (
            <ListGroup>
              {milestones.map(
                function(row) {
                  const restoreTooltip = (
                    <Tooltip id="tooltip">
                      <strong>Restore</strong> Milestone.
                    </Tooltip>
                  );

                  const timeLineTooltip = (
                    <Tooltip id="tooltip">
                      <strong>View</strong> Milestone timeline.
                    </Tooltip>
                  );
                  return (
                    <div key={row.id}>
                      <ListGroupItem
                        header={row.name}
                        className="red-line animated animatedFadeInUp fadeInUp"
                        key={row.id + this.state.filterTerm}
                      >
                        For{" "}
                        <Label bsStyle="warning">
                          {this.state.projectNameDict[row.project_root_id]}
                        </Label>{" "}
                        Project
                        <br />
                        <br />
                        <OverlayTrigger
                          placement="bottom"
                          overlay={restoreTooltip}
                        >
                          <Button
                            onClick={() =>
                              this.handleRestoreModalShow(row.id, "milestone")
                            }
                            className="btn btn-default btn-lg"
                          >
                            <span className="glyphicon glyphicon-retweet" />
                          </Button>
                        </OverlayTrigger>
                        &nbsp;
                        <OverlayTrigger
                          placement="bottom"
                          overlay={timeLineTooltip}
                        >
                          <Link
                            to={"/timeline/milestone/" + row.id}
                            className=" btn btn-default btn-lg"
                          >
                            <span className="glyphicon glyphicon-time" />
                          </Link>
                        </OverlayTrigger>
                      </ListGroupItem>
                      <br />
                    </div>
                  );
                }.bind(this)
              )}
            </ListGroup>
          ) : null}
          {milestones.length > 0 ? pages : null}
        </div>
        <Modal show={this.state.showAchiveModal} onHide={this.handleClose}>
          <Modal.Body>
            {this.state.objectType == "milestone" ? (
              <h4>Are you sure you want to restore this Milestone?</h4>
            ) : null}
            {this.state.objectType == "project" ? (
              <h4>Are you sure you want to restore this Project?</h4>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.sendRestore}>
              {this.state.objectType == "milestone" ? (
                <div>Restore Milestone</div>
              ) : null}
              {this.state.objectType == "project" ? (
                <div>Restore Project</div>
              ) : null}
            </Button>
            <Button onClick={this.handleClose}>Cancel</Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showAchiveSend} onHide={this.handleClose}>
          {this.state.showRestoreLoading ? (
            <div>
              <Modal.Body>
                <div className="loading-screen text-center">
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
              </Modal.Body>
            </div>
          ) : (
            this.showRestoreResult()
          )}
        </Modal>
      </div>
    );
  }
}

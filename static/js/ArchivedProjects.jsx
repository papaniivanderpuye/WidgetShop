/** Projects **/

import React from "react";
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  PageHeader,
  Table,
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

export default class ArchivedProjects extends React.Component {
  constructor(props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.handleFilterTermChange = this.handleFilterTermChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.getFilteredProjects = this.getFilteredProjects.bind(this);
    this.handleRestoreModalShow = this.handleRestoreModalShow.bind(this);
    this.sendRestore = this.sendRestore.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.showRestoreResult = this.showRestoreResult.bind(this);

    this.state = {
      showLoading: false,
      projects: [],
      errMsg: "",
      activePage: 1,
      rowsPerPage: 5,
      filterTerm: "",
      showRestoreModal: false,
      showRestoreSend: false,
      showRestoreLoading: false,
      restoreResult: false,
      currentId: "",
      objectType: "",
      projectRestored: false
    };
  }

  componentDidMount() {
    $.ajax({
      url: "/v1/archive/projects",
      type: "GET",
      contentType: "application/json",
      beforeSend: function(xhr) {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(data) {
        var results = data.data;
        results = Array.isArray(results) ? results : [results];
        results = this.flattenResults(results);
        this.setState({ projects: results });
      }.bind(this),
      complete: function() {
        this.setState({ showLoading: false, errMsg: "" });
      }.bind(this)
    });
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
          showRestoreModal: false,
          showRestoreSend: true,
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
      showRestoreModal: false,
      showRestoreSend: false
    });
  }

  handleRestoreClose() {
    window.location.reload();
  }

  handleRestoreModalShow(id, objectType) {
    this.setState({
      showRestoreModal: true,
      currentId: id,
      objectType: objectType
    });
  }

  flattenResults(results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i].type == "project") {
        results[i] = this.flattenProject(results[i]);
      }
    }
    return results;
  }

  flattenProject(results) {
    results.name = results.attributes.name;
    results.highlights = results.attributes.highlights;
    results.goal = results.attributes.goal;
    results.description = results.attributes.description;
    results.note = results.attributes.note;
    results.owner = results.attributes.owner;
    results.fid = results.attributes.fid;
    if (
      typeof results.relationships != "undefined" ||
      results.relationships != null
    ) {
      results.milestoneCount = results.relationships.milestones.data.length;
    } else {
      results.milestoneCount = 0;
    }
    delete results.attributes;
    return results;
  }

  getFilteredProjects() {
    var projects = [];
    for (var i = 0; i < this.state.projects.length; i++) {
      if (this.state.filterTerm.length > 0) {
        var filterFields = [];
        var searchString = this.state.filterTerm.toLowerCase();

        if (this.state.projects[i].name !== null) {
          filterFields.push(this.state.projects[i].name.toLowerCase());
        }

        if (this.state.projects[i].highlights != null) {
          filterFields.push(this.state.projects[i].highlights.toLowerCase());
        }

        if (this.state.projects[i].note != null) {
          filterFields.push(this.state.projects[i].note.toLowerCase());
        }

        if (this.state.projects[i].goal != null) {
          filterFields.push(this.state.projects[i].goal.toLowerCase());
        }

        for (var si = 0; si < filterFields.length; si++) {
          if (filterFields[si].indexOf(searchString) !== -1) {
            projects.push(this.state.projects[i]);
            break;
          }
        }
      } else {
        projects.push(this.state.projects[i]);
      }
    }
    return projects;
  }

  handlePageChange(pageNumber) {
    this.setState({ activePage: pageNumber });
  }

  handleResultsPageChange(e) {
    this.setState({ rowsPerPage: e.target.value });
  }

  handleFilterTermChange(e) {
    this.setState({ filterTerm: e.target.value });
  }

  clearFilter() {
    this.setState({ filterTerm: "" });
  }

  render() {
    var projects = this.getFilteredProjects();
    var allProjects = projects;
    var totalResults = projects.length;
    var rowsMax = this.state.activePage * this.state.rowsPerPage; // page 2: 20
    var rowsMin = rowsMax - this.state.rowsPerPage + 1; // page 2: 11
    projects = projects.slice(rowsMin - 1, rowsMax);

    var addNewProjectButton = (
      <Link to={"/project/edit/"} className=" btn btn-default ">
        <span className="glyphicon glyphicon-plus" />
        Add New Project
      </Link>
    );

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

    var resultsPage = (
      <div className="text-center">
        <FormGroup
          controlId="formResultsPage"
          className="results-per-page-container"
        >
          <ControlLabel>Results per page:</ControlLabel>
          <FormControl
            className="results-per-page"
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
            [ {this.state.projects.length} total results{" "}
            {this.state.filterTerm.length > 0 ? (
              <small>
                > {totalResults}
                with filter{" "}
                <Button
                  bsStyle="link"
                  bsSize="xsmall"
                  className="btn-remove-filter"
                  onClick={this.clearFilter}
                >
                  <Glyphicon glyph="remove" />
                  Remove Filter
                </Button>
              </small>
            ) : null}]
          </div>
        </FormGroup>
      </div>
    );

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left ">
          <PageHeader>
            <small>Projects</small>
          </PageHeader>
          <p>Click a Tool Button to Restore a Project or View it's Timeline.</p>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>Archived Projects</PageHeader>
          <form>
            <FormGroup controlId="formFilter">
              <FormControl
                type="text"
                value={this.state.filterTerm}
                placeholder="Type to filter projects"
                onChange={this.handleFilterTermChange}
                onKeyPress={e => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
            </FormGroup>
          </form>

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
          {projects.length > 0 ? (
            <ListGroup>
              {projects.map(
                function(row) {
                  const restoreTooltip = (
                    <Tooltip id="tooltip">
                      <strong>Restore</strong> Project.
                    </Tooltip>
                  );

                  const timeLineTooltip = (
                    <Tooltip id="tooltip">
                      <strong>View</strong> Project timeline.
                    </Tooltip>
                  );
                  return (
                    <div key={row.id}>
                      <ListGroupItem
                        header={row.name}
                        className="red-line animated animatedFadeInUp fadeInUp"
                        key={row.id + this.state.filterTerm}
                      >
                        <Label bsStyle="danger">{row.milestoneCount}</Label>&nbsp;
                        Milestones
                        <br />
                        <br />
                        <OverlayTrigger
                          placement="bottom"
                          overlay={restoreTooltip}
                        >
                          <Button
                            onClick={() =>
                              this.handleRestoreModalShow(row.id, "project")
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
                            to={"/timeline/project/" + row.id}
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
          {pages}
        </div>
        <Modal show={this.state.showRestoreModal} onHide={this.handleClose}>
          <Modal.Body>
            {this.state.objectType == "milestone" ? (
              <h4>Are you sure you want to restore this Milestone?</h4>
            ) : null}
            {this.state.objectType == "project" ? (
              <h4>
                Are you sure you want to restore this Project?
                <br />
                <br />
                None of its milestones will be restored.
              </h4>
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
        <Modal show={this.state.showRestoreSend} onHide={this.handleClose}>
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

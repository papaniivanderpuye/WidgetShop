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
import { Timeline, TimelineItem } from "vertical-timeline-component-for-react";
import { difference, Article, Section } from "./Common";
import styled from "tachyons-components";

var $ = require("jquery");

export default class ProjectTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.handleFilterTermChange = this.handleFilterTermChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.getFilteredProjects = this.getFilteredProjects.bind(this);
    this.handleStateModalShow = this.handleStateModalShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      id: props.match.params.projectId,
      showLoading: false,
      projects: [],
      errMsg: "",
      activePage: 1,
      rowsPerPage: 5,
      filterTerm: "",
      showStateModal: false,
      selectedProject: null
    };
  }

  componentDidMount() {
    $.ajax({
      url: "/v1/history/project/" + this.state.id,
      type: "GET",
      contentType: "application/json",
      beforeSend: function(xhr) {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(data) {
        var results = data.data;
        results = Array.isArray(results) ? results : [results];
        var resultsFlattened = this.flattenResults(results);
        var resultsInOrder = resultsFlattened.reverse();
        this.setState({ projects: resultsInOrder });
      }.bind(this),
      complete: function() {
        this.setState({ showLoading: false, errMsg: "" });
      }.bind(this)
    });
  }

  handleClose() {
    this.setState({
      showStateModal: false,
      selectedProject: null
    });
  }

  handleStateModalShow(project) {
    this.setState({
      showStateModal: true,
      selectedProject: project
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

  flattenProject(result) {
    var attributeKeys = Object.keys(result.attributes);
    attributeKeys.forEach(function(key) {
      result[key] = result.attributes[key];
    });
    delete result.attributes;
    return result;
  }

  getFilteredProjects() {
    var projects = [];
    var searchString = this.state.filterTerm.toLowerCase();
    var searchAttributes = ["name", "highlights", "note", "goal"];

    for (var i = 0; i < this.state.projects.length; i++) {
      var containsString = false;
      var project = this.state.projects[i];
      for (var j = 0; j < searchAttributes.length; j++) {
        var key = searchAttributes[j];
        var data = project[key];
        if (data && !containsString) {
          containsString = data.toLowerCase().includes(searchString);
        }
      }
      if (containsString) {
        projects.push(project);
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
    var projects = this.state.projects;

    var projectName =
      projects !== undefined && projects.length > 0 ? projects[0].name : null;
    var actionColor = {
      CREATE: "#76bb7f",
      ARCHIVE: "#e86971",
      UPDATE: "#2ea1ff",
      RESTORE: "#76bb7f"
    };
    var displayAction = {
      CREATE: "Created",
      ARCHIVE: "Archived",
      UPDATE: "Updated",
      RESTORE: "Restored"
    };
    var selectedProject = this.state.selectedProject;

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left ">
          <PageHeader>
            <small>Project</small>
            <br />
            <small>Timeline</small>
          </PageHeader>
          <p>
            This is page shows the history of all changes made to the Project.
          </p>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>{projectName}</PageHeader>
          {projects.length ? (
            <Timeline lineColor={"#ddd"}>
              {projects.map(
                function(row) {
                  var action = row.action;

                  return (
                    <TimelineItem
                      key={row.id + row.date_occured}
                      dateText={row.date_occured}
                      style={{ color: actionColor[action] }}
                      dateInnerStyle={{ background: actionColor[action] }}
                      bodyContainerStyle={
                        action === "UPDATE"
                          ? {
                              background: "#ddd",
                              padding: "20px",
                              borderRadius: "8px",
                              boxShadow:
                                "0.5rem 0.5rem 2rem 0 rgba(0, 0, 0, 0.2)"
                            }
                          : null
                      }
                    >
                      <h3
                        style={
                          action === "UPDATE"
                            ? { color: actionColor[action] }
                            : null
                        }
                      >
                        {displayAction[action]}
                      </h3>
                      <br />
                      <p>
                        {displayAction[action]} by {row.username}.<br /> Edited:{" "}
                        {row.changes ? row.changes.join(", ") : null}
                      </p>
                      <Button
                        bsStyle="primary"
                        bsSize="small"
                        onClick={() => this.handleStateModalShow(row)}
                      >
                        View State
                      </Button>
                    </TimelineItem>
                  );
                }.bind(this)
              )}
            </Timeline>
          ) : (
            <div className="full-page loading-screen  text-center loading-logo">
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
          )}
        </div>
        <Modal show={this.state.showStateModal} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <h3>{selectedProject ? selectedProject.name : null}</h3>
          </Modal.Header>
          <Modal.Body>
            {selectedProject ? (
              <div>
                <div>
                  <div>
                    <p className="show-new-lines project-text-width">
                      {selectedProject.description.match(/^\s*$/)
                        ? "No Description Currently"
                        : selectedProject.description.replace(/"<br>"/g, "\n")}
                    </p>
                  </div>
                  <br />
                  <div>
                    <h4>Product Owner</h4>
                    <p>
                      {selectedProject.owner.match(/^\s*$/)
                        ? "No Owner Currently"
                        : selectedProject.owner}
                    </p>
                  </div>
                  <br />
                  <div>
                    <h4>Goal</h4>
                    <p className="show-new-lines">
                      {selectedProject.goal.match(/^\s*$/)
                        ? "No Goal Currently"
                        : selectedProject.goal.replace(/"<br>"/g, "\n")}
                    </p>
                  </div>
                  <br />
                  <div>
                    <h4>Risks</h4>
                    <p className="show-new-lines">
                      {selectedProject.risks.match(/^\s*$/)
                        ? "No Risks Currently"
                        : selectedProject.risks.replace(/"<br>"/g, "\n")}
                    </p>
                  </div>
                </div>
                <br />
                <div>
                  <h4>Highlights</h4>
                </div>

                <p className="show-new-lines">
                  {selectedProject.highlights.match(/^\s*$/)
                    ? "No Highlights"
                    : selectedProject.highlights.replace(/"<br>"/g, "\n")}
                </p>
                <br />
                <h4>Notes</h4>
                <p className="show-new-lines">
                  {selectedProject.note.match(/^\s*$/)
                    ? "No Notes"
                    : selectedProject.note.replace(/"<br>"/g, "\n")}
                </p>
              </div>
            ) : null}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

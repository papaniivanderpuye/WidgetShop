/** Milestones **/

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

var $ = require("jquery");

export default class MilestoneTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.handleFilterTermChange = this.handleFilterTermChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.getFilteredMilestones = this.getFilteredMilestones.bind(this);
    this.handleStateModalShow = this.handleStateModalShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      id: props.match.params.milestoneId,
      showLoading: false,
      milestones: [],
      errMsg: "",
      activePage: 1,
      rowsPerPage: 5,
      filterTerm: "",
      showStateModal: false,
      selectedMilestone: null
    };
  }

  componentDidMount() {
    $.ajax({
      url: "/v1/history/milestone/" + this.state.id,
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
        this.setState({ milestones: resultsInOrder });
      }.bind(this),
      complete: function() {
        this.setState({ showLoading: false, errMsg: "" });
      }.bind(this)
    });
  }

  handleClose() {
    this.setState({
      showStateModal: false,
      selectedMilestone: null
    });
  }

  handleStateModalShow(project) {
    this.setState({
      showStateModal: true,
      selectedMilestone: project
    });
  }

  flattenResults(results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i].type == "milestone") {
        results[i] = this.flattenMilestone(results[i]);
      }
    }
    return results;
  }

  flattenMilestone(result) {
    var attributeKeys = Object.keys(result.attributes);
    attributeKeys.forEach(function(key) {
      result[key] = result.attributes[key];
    });
    delete result.attributes;
    return result;
  }

  getFilteredMilestones() {
    var milestones = [];
    var searchString = this.state.filterTerm.toLowerCase();
    var searchAttributes = ["name", "highlights", "note", "goal"];

    for (var i = 0; i < this.state.milestones.length; i++) {
      var containsString = false;
      var milestone = this.state.milestones[i];
      for (var j = 0; j < searchAttributes.length; j++) {
        var key = searchAttributes[j];
        var data = milestone[key];
        if (data && !containsString) {
          containsString = data.toLowerCase().includes(searchString);
        }
      }
      if (containsString) {
        milestones.push(milestone);
      }
    }
    return milestones;
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
    var milestones = this.state.milestones;

    var milestoneName =
      milestones !== undefined && milestones.length > 0
        ? milestones[0].name
        : null;
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

    var selectedMilestone = this.state.selectedMilestone;

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left ">
          <PageHeader>
            <small>Milestone</small>
            <br />
            <small>Timeline</small>
          </PageHeader>
          <p>
            This is page shows the history of all changes made to the Milestone.
          </p>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>{milestoneName}</PageHeader>
          {(milestones.length) ? (
            <Timeline lineColor={"#ddd"}>
              {milestones.map(
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
                        {displayAction[action]} by {row.username}.<br />
                        Edited: {row.changes ? row.changes.join(", ") : null}
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
            <div className="full-page loading-screen text-center">
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
            <h3>{selectedMilestone ? selectedMilestone.name : null}</h3>
          </Modal.Header>
          <Modal.Body>
            {selectedMilestone ? (
              <div>
                <div>
                  <h4>Deliverable</h4>
                  <p>
                    {selectedMilestone.deliverable.match(/^\s*$/)
                      ? "No Deliverable Currently"
                      : selectedMilestone.deliverable}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Completion Date</h4>
                  <p>
                    {(selectedMilestone.completionDate && !selectedMilestone.completionDate.match(/^\s*$/))
                      ? selectedMilestone.completionDate
                      : "No Date Currently"}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Current Status Details</h4>
                  <p>
                    {selectedMilestone.currentStatus.match(/^\s*$/)
                      ? "No Details Currently"
                      : selectedMilestone.currentStatus}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Next Steps</h4>
                  <p>
                    {selectedMilestone.nextSteps.match(/^\s*$/)
                      ? "No Steps Currently"
                      : selectedMilestone.nextSteps}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Resources</h4>
                  <p>
                    {selectedMilestone.resources.match(/^\s*$/)
                      ? "None noted currently"
                      : selectedMilestone.resources}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Start Date</h4>
                  <p>
                    {(selectedMilestone.startDate && !selectedMilestone.startDate.match(/^\s*$/))
                      ? selectedMilestone.startDate
                      : "No Date Currently"}
                  </p>
                </div>
                <br />
                <div>
                  <h4>End Date</h4>
                  <p>
                    {(selectedMilestone.endDate && !selectedMilestone.endDate.match(/^\s*$/))
                      ? selectedMilestone.endDate
                      : "No Date Currently"}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Percent Done</h4>
                  <p>
                    {selectedMilestone.percent
                      ? "No Percentage Currently"
                      : selectedMilestone.percent}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Status</h4>
                  <p>
                    {selectedMilestone.status.match(/^\s*$/)
                      ? "No Status Currently"
                      : selectedMilestone.status}
                  </p>
                </div>
                <br />
              </div>
            ) : null}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

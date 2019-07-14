/**Project View**/

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
import {Article, Section } from "./Common";

var $ = require("jquery");
const USER_FULL_NAME = document
  .getElementById("content")
  .getAttribute("user_fullname");

export default class ProjectView extends React.Component {
  constructor(props) {
    super(props);

    this.loadProject = this.loadProject.bind(this);
    this.loadMilestones = this.loadMilestones.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.getEditMilestoneButton = this.getEditMilestoneButton.bind(this);
    this.getArchiveMilestoneButton = this.getArchiveMilestoneButton.bind(this);
    this.handleArchiveModalShow = this.handleArchiveModalShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.showArchiveResult = this.showArchiveResult.bind(this);
    this.sendArchive = this.sendArchive.bind(this);

    this.state = {
      id: props.match.params.projectId,
      project: null,
      milestones: [],
      showLoading: false,
      activePage: 1,
      rowsPerPage: 5,
      showArchiveModal: false,
      showArchiveSend: false,
      showArchiveLoading: false,
      archiveResult: false,
      currentId: "",
      objectType: "",
      projectArchived: false
    };
  }

  componentDidMount() {
    this.loadProject();
  }

  handleArchiveModalShow(id, objectType) {
    this.setState({
      showArchiveModal: true,
      currentId: id,
      objectType: objectType
    });
  }

  sendArchive() {
    var data = {};
    var submitUrl = "/v1/archive/project/";
    var httpMethod = "PUT";
    var actionTaken = "archived";

    //Changing to Milestone URL if Archiving Milestone
    if (this.state.objectType == "milestone") {
      submitUrl = "/v1/archive/milestone/";
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
          showArchiveModal: false,
          showArchiveSend: true,
          showArchiveLoading: true
        });
      }.bind(this),
      success: function(results) {
        var changeResult = {
          archiveResult: "Milestone Archived!"
        };
        if (this.state.objectType == "project") {
          changeResult = {
            archiveResult: "Project Archived!",
            projectArchived: true
          };
        }
        this.setState(changeResult);
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

  getArchiveMilestoneButton(id, milestoneId) {
    var archiveMilestonButton = (
      <Button
        onClick={() => this.handleArchiveModalShow(milestoneId, "milestone")}
        className="edit-milestone-btn btn btn-danger btn-sm"
      >
        <span className="glyphicon glyphicon-folder-close" />
        &nbsp; Archive Milestone
      </Button>
    );
    return archiveMilestonButton;
  }

  showArchiveResult() {
    if (true) {
      return (
        <div>
          <Modal.Body>
            <h4>{this.state.archiveResult}</h4>
          </Modal.Body>
          <Modal.Footer>
            {this.state.projectArchived ? (
              <Link className="btn btn-primary btn-sm" to={"/projects"}>
                Go To Projects
              </Link>
            ) : (
              <Button onClick={this.handleArchiveClose}>Close</Button>
            )}
          </Modal.Footer>
        </div>
      );
    }
  }

  loadProject() {
    $.ajax({
      url: "/v1/project/" + this.state.id,
      type: "GET",
      contentType: "application/json",
      beforeSend: function() {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(data) {
        var project = data.data;
        this.setState({ project: this.flattenProject(project) });
        this.loadMilestones();
      }.bind(this)
    });
  }

  loadMilestones() {
    if (this.state.project.milestoneCount > 0) {
      $.ajax({
        url: this.state.project.relationships.milestones.links.related,
        type: "GET",
        contentType: "application/json",
        success: function(data) {
          var milestones = data.data;
          this.setState({ milestones: this.flattenResults(milestones) });
        }.bind(this),
        complete: function() {
          this.setState({ showLoading: false });
        }.bind(this)
      });
    } else {
      this.setState(
        {
          milestones: []
        },
        () => {
          this.setState({ showLoading: false });
        }
      );
    }
  }

  flattenResults(results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i].type == "project") {
        results[i] = this.flattenProject(results[i]);
      } else if (results[i].type == "milestone") {
        results[i] = this.flattenMilestone(results[i]);
      }
    }
    return results;
  }

  flattenProject(result) {
    result.name = result.attributes.name;
    result.highlights = this.addLineBreak(result.attributes.highlights);
    result.goal = result.attributes.goal;
    result.description = result.attributes.description;
    result.note = result.attributes.note;
    result.owner = result.attributes.owner;
    result.risks = result.attributes.risks;
    result.fid = result.attributes.fid;
    if (
      typeof result.relationships != "undefined" ||
      result.relationships != null
    ) {
      result.milestoneCount = result.relationships.milestones.data.length;
    } else {
      result.milestoneCount = 0;
    }
    delete result.attributes;
    return result;
  }

  flattenMilestone(result) {
    result.name = result.attributes.name;
    result.completionDate = result.attributes.completionDate;
    result.deliverable = result.attributes.deliverable;
    result.endDate = result.attributes.endDate;
    result.currentStatus = result.attributes.currentStatus;
    result.nextSteps = result.attributes.nextSteps;
    result.percent = result.attributes.percent;
    result.resources = result.attributes.resources;
    result.startDate = result.attributes.startDate;
    result.status = result.attributes.status;
    delete result.attributes;
    return result;
  }

  addLineBreak(string) {
    return string.replace(/ -/g, '"<br>"-');
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
        className="edit-milestone-btn btn btn-primary btn-sm align-left"
      >
        <span className="glyphicon glyphicon-pencil" />
        &nbsp; Edit Milestone
      </Link>
    );
    return editMilestonButton;
  }

  render() {
    var milestones = this.state.milestones;
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
        <span className="glyphicon glyphicon-plus" />&nbsp; Add Milestone
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
            [ {this.state.milestones.length}{" "}total results ]
          </div>

          {addMilestoneButton}
        </FormGroup>
      </div>
    );

    var editProjectButton = (
      <Link
        to={"/project/edit/" + this.state.id}
        className="btn btn-primary btn-sm"
      >
        <span className="glyphicon glyphicon-pencil" />&nbsp; Edit Project
      </Link>
    );

    var viewProjectTimeLineButton = (
      <Link
        to={"/timeline/project/" + this.state.id}
        className="btn btn-default btn-sm"
      >
        <span className="glyphicon glyphicon-time" />&nbsp; View Timeline
      </Link>
    );

    var archiveProjectButton = (
      <Button
        onClick={() => this.handleArchiveModalShow(this.state.id, "project")}
        className="edit-milestone-btn btn btn-danger btn-sm"
      >
        <span className="glyphicon glyphicon-folder-close" />
        &nbsp; Archive Project
      </Button>
    );

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left">
          {project != null ? (
            <div>
              <div>
                <h2>{project.name}</h2>
              </div>
              <hr />
              <div>
                <div>
                  <p className="show-new-lines project-text-width">
                    {project.description.match(/^\s*$/)
                      ? "No Description Currently"
                      : project.description.replace(/"<br>"/g, "\n")}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Product Owner</h4>
                  <p>
                    {project.owner.match(/^\s*$/)
                      ? "No Owner Currently"
                      : project.owner}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Goal</h4>
                  <p className="show-new-lines">
                    {project.goal.match(/^\s*$/)
                      ? "No Goal Currently"
                      : project.goal.replace(/"<br>"/g, "\n")}
                  </p>
                </div>
                <br />
                <div>
                  <h4>Risks</h4>
                  <p className="show-new-lines">
                    {project.risks.match(/^\s*$/)
                      ? "No Risks Currently"
                      : project.risks.replace(/"<br>"/g, "\n")}
                  </p>
                </div>
                <div>
                  <br />
                  <ButtonGroup vertical>
                    {project != null ? editProjectButton : null}
                    <br />
                    {project != null ? viewProjectTimeLineButton : null}
                    <br />
                    {project != null ? archiveProjectButton : null}
                  </ButtonGroup>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="main-right stretch-page">
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
          {project != null ? (
            <div>
              <div>
                <h3>Highlights</h3>
              </div>

              <p className="show-new-lines">
                {project.highlights.match(/^\s*$/)
                  ? "No Highlights"
                  : project.highlights.replace(/"<br>"/g, "\n")}
              </p>
              <br />
              <h4>Notes</h4>
              <p className="show-new-lines">
                {project.note.match(/^\s*$/)
                  ? "No Notes"
                  : project.note.replace(/"<br>"/g, "\n")}
              </p>
              <br />
            </div>
          ) : null}

          {milestones.length > 0 ? (
            resultsPage
          ) : (
            <div className="text-center btn">
                {!this.state.showLoading ? "No Current Milestones":null}
                {addMilestoneButton}
            </div>
          )}

          {milestones.length > 0 ? pages : null}

          {milestones.length > 0 ? (
            <Table
              bordered={true}
              responsive={true}
              hover={true}
              className="fadeIn"
            >
              <thead>
                <tr>
                  <th>Progress</th>
                  <th>Name</th>
                  <th>Deliverable</th>
                  <th>Note</th>
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

                    var milestoneTimelineButton = (
                      <Link
                        to={"/timeline/milestone/" + row.id}
                        className=" btn btn-default btn-sm align-left"
                      >
                        <span className="glyphicon glyphicon-time" />
                        &nbsp; View Timeline
                      </Link>
                    );

                    return (
                      <tr key={row.id + this.state.filterTerm}>
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
                          <div className="cell-display-scroll">
                            {row.deliverable}
                          </div>
                        </td>
                        <td>
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
                        <td>{row.status}</td>
                        <td>
                          <ButtonGroup vertical>
                            {this.getEditMilestoneButton(project.id, row.id)}
                            <br />
                            {this.getArchiveMilestoneButton(project.id, row.id)}
                            <br />
                            {milestoneTimelineButton}
                          </ButtonGroup>
                        </td>
                      </tr>
                    );
                  }.bind(this)
                )}
              </tbody>
            </Table>
          ) : null}
          {milestones.length > 0 ? pages : null}
        </div>
        <Modal show={this.state.showArchiveModal} onHide={this.handleClose}>
          <Modal.Body>
            {this.state.objectType == "milestone" ? (
              <h4>Are you sure you want to archive this Milestone?</h4>
            ) : null}
            {this.state.objectType == "project" ? (
              <h4>
                Are you sure you want to archive this Project?
                <br />
                This will Archive all its Milestones
              </h4>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.sendArchive}>
              {this.state.objectType == "milestone" ? (
                <div>Archive Milestone</div>
              ) : null}
              {this.state.objectType == "project" ? (
                <div>Archive Project</div>
              ) : null}
            </Button>
            <Button onClick={this.handleClose}>Cancel</Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showArchiveSend} onHide={this.handleClose}>
          {this.state.showArchiveLoading ? (
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
            this.showArchiveResult()
          )}
        </Modal>
      </div>
    );
  }
}

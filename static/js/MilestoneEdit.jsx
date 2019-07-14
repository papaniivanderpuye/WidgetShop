/**Milestone Edit**/

import React from "react";
import ReactDOM from "react-dom";
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ProgressBar,
  Nav,
  NavItem,
  Alert,
  Col,
  HelpBlock,
  Label,
  Modal,
  Row,
  Well
} from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactLoading from "react-loading";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

var $ = require("jquery");
const USER_FULL_NAME = document
  .getElementById("content")
  .getAttribute("user_fullname");

export default class MilestoneEdit extends React.Component {
  constructor(props) {
    super(props);
    this.loadMilestone = this.loadMilestone.bind(this);
    this.loadProject = this.loadProject.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.getEditingPanel = this.getEditingPanel.bind(this);
    this.handleFormNext = this.handleFormNext.bind(this);
    this.handleChangePercent = this.handleChangePercent.bind(this);
    this.handleSelectNavItem = this.handleSelectNavItem.bind(this);
    this.renderBarStyle = this.renderBarStyle.bind(this);
    this.sendMilestone = this.sendMilestone.bind(this);
    this.titleCase = this.titleCase.bind(this);
    this.validateUserName = this.validateUserName.bind(this);
    this.validateProjectName = this.validateProjectName.bind(this);

    this.state = {
      id: props.match.params.milestoneId,
      projectId: props.match.params.projectId,
      milestone: null,
      showLoading: false,
      selectedKey: 1,
      name: "",
      completionDate: null,
      deliverable: "",
      endDate: null,
      currentStatus: "",
      nextSteps: "",
      percent: 0,
      resources: "",
      startDate: null,
      status: "",
      showFormErrors: [],
      showModal: false,
      isSaving: false,
      userName: USER_FULL_NAME
    };
  }

  componentDidMount() {
    this.loadProject();
    if (this.state.id) {
      this.loadMilestone();
    }
  }

  loadMilestone() {
    $.ajax({
      url: "/v1/milestone/" + this.state.id,
      type: "GET",
      contentType: "application/json",
      success: function(data) {
        var milestone = data.data;
        milestone = this.flattenMilestone(milestone);
        var milestoneKeys = Object.keys(milestone);
        var change = {};
        change.milestone = milestone;

        milestoneKeys.forEach(function(key) {
          change[key] = milestone[key];
          if (key.toLowerCase().includes("date")) {
            if (change[key]) {
              change[key] = new Date(milestone[key]);
            }
          }
        });

        this.setState(change);
      }.bind(this),
      complete: function() {
        this.setState({ showLoading: false });
      }.bind(this)
    });
  }

  loadProject() {
    $.ajax({
      url: "/v1/project/" + this.state.projectId,
      type: "GET",
      contentType: "application/json",
      beforeSend: function() {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(data) {
        var project = data.data;

        this.setState({ project: this.flattenProject(project) });
      }.bind(this)
    });
  }

  titleCase(str) {
    str = str.toLowerCase().split(" ");
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(" ");
  }

  flattenProject(result) {
    var attributeKeys = Object.keys(result.attributes);
    attributeKeys.forEach(function(key) {
      result[key] = result.attributes[key];
    });

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
    var attributeKeys = Object.keys(result.attributes);
    attributeKeys.forEach(function(key) {
      result[key] = result.attributes[key];
    });
    delete result.attributes;
    return result;
  }

  addLineBreak(string) {
    return string.replace(/ -/g, '"<br>"-');
  }

  handleSelectNavItem(selectedKey) {
    this.setState({ selectedKey: selectedKey });
  }

  handleChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  handleChangeDate(e, name) {
    let change = {};
    change[name] = e;
    this.setState(change);
  }

  handleChangePercent(e) {
    let change = {};
    change.percent = e;
    this.setState(change);
  }

  getValidationState() {
    const length = this.state.userName.length;
    if (length > 5) return "success";
    else if (length > 0) return "error";
    return null;
  }

  renderBarStyle() {
    var barStyle = "info";
    var status = this.state.status.toLowerCase();

    if (status == "Complete".toLowerCase()) {
      barStyle = "success";
    } else if (status == "At Risk".toLowerCase()) {
      barStyle = "warning";
    } else if (status == "Blocked".toLowerCase()) {
      barStyle = "danger";
    } else if (status == "On Track".toLowerCase()) {
      barStyle = null;
    }

    return barStyle;
  }

  validateUserName() {
    const length = this.state.userName.length;

    if (length > 5) return "success";
    else if (length > 0) return "error";
    return null;
  }

  validateProjectName() {
    const length = this.state.name.length;

    if (length > 0) return "success";
    else if (length == 0) return "error";
    return null;
  }

  getEditingPanel(fieldTitle, fieldName, fieldType, fieldValue) {
    var currentForm = null;

    switch (fieldType) {
      case "progress":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle[0]} Done So Far</ControlLabel>
            <ProgressBar
              active={true}
              now={fieldValue[0]}
              label={`${fieldValue[0]}%`}
              bsStyle={this.renderBarStyle()}
            />

            <Slider value={fieldValue[0]} onChange={this.handleChangePercent} />

            <hr />

            <ControlLabel>Enter the Milestone {fieldTitle[1]}</ControlLabel>
            <FormControl
              name={fieldName[1]}
              componentClass="select"
              value={fieldValue[1] ? fieldValue[1] : "Select"}
              onChange={this.handleChange}
            >
              <option value="Select">Select</option>
              <option value="Complete">Complete</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Blocked">Blocked</option>
            </FormControl>
          </FormGroup>
        );

        break;
      case "text":
        if (fieldName === "userName") {
          currentForm = (
            <FormGroup
              key={1}
              validationState={this.validateUserName()}
              className="animated animatedFadeInUp fadeInUp"
            >
              <ControlLabel>Enter the {fieldTitle}</ControlLabel>
              <FormControl
                readOnly
                className="form-registration fadeIn"
                id={fieldName + "_" + fieldType}
                name={fieldName}
                type={fieldType}
                placeholder={fieldTitle}
                onChange={this.handleChange}
                value={fieldValue !== null ? fieldValue : ""}
                maxLength={400}
              />

              <FormControl.Feedback />
              <HelpBlock>
                {this.validateUserName() === "error"
                  ? "Must be Full Name"
                  : null}
              </HelpBlock>
            </FormGroup>
          );
        } else if (fieldName === "name") {
          currentForm = (
            <FormGroup
              key={2}
              validationState={this.validateProjectName()}
              className="animated animatedFadeInUp fadeInUp"
            >
              <ControlLabel>Enter the {fieldTitle}</ControlLabel>
              <FormControl
                id={fieldName + "_" + fieldType}
                name={fieldName}
                type={fieldType}
                placeholder={fieldTitle}
                onChange={this.handleChange}
                value={fieldValue !== null ? fieldValue : ""}
                maxLength={400}
              />
              <FormControl.Feedback />
              <HelpBlock>
                {this.validateProjectName() === "error"
                  ? "Must have a Name"
                  : null}
              </HelpBlock>
            </FormGroup>
          );
        } else {
          currentForm = (
            <FormGroup className="animated animatedFadeInUp fadeInUp">
              <ControlLabel>Enter the Milestone {fieldTitle}</ControlLabel>
              <FormControl
                id={fieldName + "_" + fieldType}
                name={fieldName}
                type={fieldType}
                placeholder={fieldTitle}
                onChange={this.handleChange}
                value={fieldValue !== null ? fieldValue : ""}
                maxLength={400}
              />
            </FormGroup>
          );
        }
        break;
      case "time_line":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <Row className="show-grid">
              <Col xm={1} sm={3} md={6}>
                <ControlLabel>Enter the {fieldTitle[0]}</ControlLabel>
                &nbsp;
                <DatePicker
                  id={fieldName[0] + "_" + fieldType}
                  name={fieldName[0]}
                  selected={fieldValue[0] ? fieldValue[0] : new Date()}
                  onChange={e => this.handleChangeDate(e, fieldName[0])}
                />
              </Col>

              <Col xm={1} sm={3} md={6}>
                <ControlLabel>Enter the {fieldTitle[1]}</ControlLabel>
                &nbsp;
                <DatePicker
                  id={fieldName[1] + "_" + fieldType}
                  name={fieldName[1]}
                  selected={fieldValue[1] ? fieldValue[1] : new Date()}
                  onChange={e => this.handleChangeDate(e, fieldName[1])}
                />
              </Col>
            </Row>
          </FormGroup>
        );
        break;
      case "completion_date":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            &nbsp;
            <DatePicker
              id={fieldName + "_" + fieldType}
              name={fieldName}
              selected={fieldValue}
              onChange={e => this.handleChangeDate(e, fieldName)}
              isClearable={true}
              placeholderText={"None"}
            />
          </FormGroup>
        );
        break;
      case "resources":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            <FormControl
              style={{
                height: 200
              }}
              id={fieldName + "_" + fieldType}
              name={fieldName}
              componentClass={fieldType}
              placeholder={fieldTitle}
              onChange={this.handleChange}
              value={fieldValue !== null ? fieldValue : ""}
              maxLength={400}
            />
          </FormGroup>
        );

      default:
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            <FormControl
              style={{
                height: 200
              }}
              id={fieldName + "_" + fieldType}
              name={fieldName}
              componentClass={fieldType}
              placeholder={fieldTitle}
              onChange={this.handleChange}
              value={fieldValue !== null ? fieldValue : ""}
            />
          </FormGroup>
        );
    }

    var editType = (
      <div className="animated fadeIn">
        <Well
          className="form-well"
          id="project-info"
          style={{
            height: 400,
            width: 800
          }}
        >
          <h3 className="offset-3">
            {Array.isArray(fieldTitle)
              ? fieldTitle[fieldTitle.length - 1]
              : fieldTitle}
          </h3>
          <hr />
          <div className="input-well">{currentForm}</div>
        </Well>
      </div>
    );

    return editType;
  }

  sendMilestone() {
    var data = {};
    var submitUrl = "/v1/milestone/";
    var httpMethod = "POST";
    var actionTaken = "created";

    // Prepare payload
    data.Project_Root_ID = this.state.project.fid;
    data.Name = this.state.name;
    data.Status = this.state.status;
    data.Start_Date = this.state.startDate
      ? moment(this.state.startDate).format("YYYY-MM-DD HH:mm:ss")
      : moment().format("YYYY-MM-DD HH:mm:ss");
    data.End_Date = this.state.endDate
      ? moment(this.state.endDate).format("YYYY-MM-DD HH:mm:ss")
      : moment().format("YYYY-MM-DD HH:mm:ss");
    data.Completion_Date = this.state.completionDate
      ? moment(this.state.completionDate).format("YYYY-MM-DD HH:mm:ss")
      : null;
    data.Deliverables = this.state.deliverable;
    data.Current_Status = this.state.currentStatus;
    data.Next_Steps = this.state.nextSteps;
    data.Resources = this.state.resources;
    data.Percent = this.state.percent;
    data.Username = this.state.userName;

    var errorList = [];

    // For updates
    if (this.state.id) {
      submitUrl = submitUrl + this.state.id;
      httpMethod = "PUT";
      actionTaken = "updated";
    }

    $.ajax({
      url: submitUrl,
      type: httpMethod,
      contentType: "application/json",
      data: JSON.stringify(data),
      beforeSend: function() {
        this.setState({ isSaving: true });
      }.bind(this),
      success: function(results) {
        this.setState({ showModal: true });
      }.bind(this),
      error: function(xhr, textStatus, error) {
        var errorMessageDict = {
          id: 503,
          msg: "A Database Error Occured, Please Contact Support"
        };

        var errMsg = JSON.parse(xhr.responseText)["title"];
        var errCode = JSON.parse(xhr.responseText)["code"];
        if (errMsg) {
          errorMessageDict = {
            id: errCode,
            msg: this.titleCase(errMsg.replace("[ERROR]", ""))
          };
        }

        errorList.push(errorMessageDict);
      }.bind(this),

      complete: function() {
        this.setState({ isSaving: false, showFormErrors: errorList });
      }.bind(this)
    });
  }

  handleFormNext() {
    var newSelectedKey = this.state.selectedKey + 1;
    this.setState({ selectedKey: newSelectedKey });
  }

  render() {
    function propName(prop, value) {
      for (var i in prop) {
        if (prop[i] == value) {
          return i;
        }
      }
      return false;
    }
    var milestones = this.state.milestones;
    var project = this.state.project;
    var stateDict = this.state;
    var project = this.state.project;

    var goToProjectsButton = (
      <Link to={"/projects"}>
        <Button bsStyle="success">Go To Projects</Button>
      </Link>
    );

    var goToMilestonesButton = (
      <Link to={"/milestones"}>
        <Button bsStyle="primary">Go To Milestones</Button>
      </Link>
    );

    var viewProjectButton = (
      <Link to={project ? "/project/view/" + project.id : "#"}>
        <Button bsStyle="default">View Parent Project</Button>
      </Link>
    );
    var loadingMessage = (
      <div>
        Saving Project. Please wait...
        <ProgressBar active={true} now={45} />
      </div>
    );

    var errorAlert = (
      <Alert bsStyle="danger" className="form-errors animated shake">
        <strong>The following errors occured:</strong>
        <br />
        <ul>
          {this.state.showFormErrors.map(
            function(row) {
              return <li key={row.id}>{row.msg}</li>;
            }.bind(this)
          )}
        </ul>
      </Alert>
    );

    var navigationItems = [
      "Milestone Name",
      "Deliverable",
      "Completion Date",
      "Current Status",
      "Next Steps",
      "Resources",
      "Time Line",
      "Progress",
      "Editing User"
    ];

    var navInstance = (
      <Nav
        bsStyle="pills"
        stacked={true}
        onSelect={this.handleSelectNavItem}
        activeKey={this.state.selectedKey}
      >
        {navigationItems.map(function(item, i) {
          return (
            <NavItem key={i} eventKey={i + 1} title={item}>
              {item}
            </NavItem>
          );
        })}
      </Nav>
    );

    var succesPopup = (
      <Modal show={this.state.showModal} onHide={this.handleClose}>
        <Modal.Header closeButton={false}>
          <Modal.Title>Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Milestone has been {this.state.id ? "updated" : "created"}{" "}
            succesfully!
          </p>
        </Modal.Body>
        <Modal.Footer>
          {viewProjectButton}
          <div className="divider" /> {goToProjectsButton}
          <div className="divider" /> {goToMilestonesButton}
        </Modal.Footer>
      </Modal>
    );

    var editingPanelConfig = [
      {
        fieldTitle: "Name",
        fieldName: "name",
        fieldType: "text",
        fieldValue: stateDict.name
      },
      {
        fieldTitle: "Deliverable",
        fieldName: "deliverable",
        fieldType: "textarea",
        fieldValue: stateDict.deliverable
      },
      {
        fieldTitle: "Completion Date",
        fieldName: "completionDate",
        fieldType: "completion_date",
        fieldValue: stateDict.completionDate
      },
      {
        fieldTitle: "Current Status",
        fieldName: "currentStatus",
        fieldType: "textarea",
        fieldValue: stateDict.currentStatus
      },
      {
        fieldTitle: "Next Steps",
        fieldName: "nextSteps",
        fieldType: "textarea",
        fieldValue: stateDict.nextSteps
      },
      {
        fieldTitle: "Resources",
        fieldName: "resources",
        fieldType: "textarea",
        fieldValue: stateDict.resources
      },
      {
        fieldTitle: ["Start Date", "End Date", "Time Line"],
        fieldName: ["startDate", "endDate"],
        fieldType: "time_line",
        fieldValue: [stateDict.startDate, stateDict.endDate]
      },
      {
        fieldTitle: ["Percent", "Status", "Progress"],
        fieldName: ["percent", "status"],
        fieldType: "progress",
        fieldValue: [stateDict.percent, stateDict.status]
      },
      {
        fieldTitle: "User Name",
        fieldName: "userName",
        fieldType: "text",
        fieldValue: stateDict.userName
      }
    ];

    var editingPanelList = [];

    var i;
    for (i = 0; i < editingPanelConfig.length; i++) {
      var panel = editingPanelConfig[i];
      editingPanelList.push(
        this.getEditingPanel(
          panel.fieldTitle,
          panel.fieldName,
          panel.fieldType,
          panel.fieldValue
        )
      );
    }

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        {navInstance}
        <div className="main-right stretch-page">
          <h4>
            Editing{" "}
            <Label bsStyle={this.state.name ? "primary" : "info"}>
              {this.state.name ? this.state.name : "New"}
            </Label>{" "}
            Milestone For{" "}
            <Label bsStyle="success">{project ? project.name : null}</Label>
          </h4>
          <br />

          <form className="form-registration">
            {this.state.isSaving ? (
              <div>
                Saving Milestone..
                <ReactLoading
                  type="cylon"
                  color="#000000"
                  height={50}
                  width={50}
                />
              </div>
            ) : null}
            {this.state.showFormErrors.length > 0 ? errorAlert : null}
            <div key={this.state.selectedKey - 1}>
              {editingPanelList[this.state.selectedKey - 1]}
            </div>
            <Button
              bsStyle={
                this.state.selectedKey < editingPanelList.length
                  ? "default"
                  : "primary"
              }
              type="button"
              name="next/submit"
              onClick={
                this.state.selectedKey < editingPanelList.length
                  ? this.handleFormNext
                  : this.sendMilestone
              }
            >
              {this.state.selectedKey < editingPanelList.length
                ? "Next"
                : "Submit"}
            </Button>
            &nbsp;&nbsp;
            {this.state.selectedKey < editingPanelList.length ? (
              <Button
                bsStyle={"primary"}
                type="button"
                name="submit"
                onClick={this.sendMilestone}
              >
                Submit
              </Button>
            ) : null}
          </form>
          {succesPopup}
        </div>
      </div>
    );
  }
}

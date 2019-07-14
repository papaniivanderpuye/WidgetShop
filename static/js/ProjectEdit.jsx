/**Project Edit**/

import React from "react";
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ProgressBar,
  Nav,
  NavItem,
  Alert,
  HelpBlock,
  Label,
  Modal,
  Well
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Pagination from "react-js-pagination";
import ReactLoading from "react-loading";

var $ = require("jquery");
const USER_FULL_NAME = document
  .getElementById("content")
  .getAttribute("user_fullname");

export default class ProjectEdit extends React.Component {
  constructor(props) {
    super(props);

    this.loadProject = this.loadProject.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getEditingPanel = this.getEditingPanel.bind(this);
    this.handleFormNext = this.handleFormNext.bind(this);
    this.sendProject = this.sendProject.bind(this);
    this.validateUserName = this.validateUserName.bind(this);
    this.validateProjectName = this.validateProjectName.bind(this);
    this.handleSelectNavItem = this.handleSelectNavItem.bind(this);
    this.titleCase = this.titleCase.bind(this);

    this.state = {
      id: props.match.params.projectId,
      project: null,
      showLoading: false,
      selectedKey: 1,
      name: "",
      goal: "",
      note: "",
      description: "",
      highlights: "",
      risks: "",
      owner: "",
      fid: "",
      showFormErrors: [],
      showModal: false,
      isSaving: false,
      userName: USER_FULL_NAME,
      editingPanel: null
    };
  }

  titleCase(str) {
    str = str.toLowerCase().split(" ");
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(" ");
  }

  componentDidMount() {
    if (this.state.id) {
      this.loadProject();
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
        project = this.flattenProject(project);
        var projectKeys = Object.keys(project);
        var change = {};
        change.project = project;
        projectKeys.forEach(function(key) {
          change[key] = project[key];
        });

        this.setState(change);
      }.bind(this)
    });
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

  handleSelectNavItem(selectedKey) {
    this.setState({ selectedKey: selectedKey });
  }

  handleChange(e) {
    let change = {};
    change[e.target.name] = e.target.value;
    if (e.target.name == "fid") {
      change[e.target.name] = e.target.value.toUpperCase();
    }
    this.setState(change);
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
            <FormGroup key={2} className="animated animatedFadeInUp fadeInUp">
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
            </FormGroup>
          );
        }
        break;
      default:
        currentForm = (
          <FormGroup key={3} className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            <FormControl
              className="form-registration fadeIn"
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
            height: 350
          }}
        >
          <h3>{fieldTitle}</h3>
          <div className="input-well">{currentForm}</div>
        </Well>
      </div>
    );

    return editType;
  }

  sendProject() {
    var data = {};
    var submitUrl = "/v1/project/";
    var httpMethod = "POST";
    var actionTaken = "created";

    // Prepare payload
    data.Name = this.state.name;
    data.Goal = this.state.goal;
    data.Description = this.state.description;
    data.Highlights = this.state.highlights;
    data.Risks = this.state.risks;
    data.Owner = this.state.owner;
    data.Note = this.state.note;
    data.Username = this.state.userName;
    data.Root_ID = this.state.fid;

    var errorList = [];

    // For updates
    if (this.state.id) {
      submitUrl =  submitUrl + this.state.id;
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
        if (!this.state.id) {
          var link = results.links.self;
          var linkList = link.split("/");
          var generatedID = linkList.slice(-1)[0];
          this.setState({ id: generatedID });
        }
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
    var milestones = this.state.milestones;
    var project = this.state.project;
    var rowsMax = this.state.activePage * this.state.rowsPerPage; // page 2: 20
    var rowsMin = rowsMax - this.state.rowsPerPage + 1; // page 2: 11

    var viewProjectsLink = "/projects";
    var stateDict = this.state;
    var goToProjectsButton = (
      <Link to={viewProjectsLink}>
        <Button className="btn btn-primary btn-sm">Go To Projects</Button>
      </Link>
    );

    //var addMilestoneLink = {project ? ("/milestone/edit/"+ project.id): "#"};

    var addMilestoneButton = (
      <Link to={this.state.id ? "/milestone/edit/" + this.state.id : "#"}>
        <Button className="btn btn-sm">Add Milestone</Button>
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
        <strong>The following errors were found:</strong>
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
      "Project Name",
      "Goal",
      "Notes",
      "Description",
      "Highlights",
      "Risks",
      "Product Owner",
      "Editing User"
    ];

    if (!this.state.id) {
      navigationItems.splice(1, 0, "Project Root ID");
    }

    const navInstance = (
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
            Project has been {this.state.id ? "updated" : "created"}{" "}
            succesfully!
          </p>
        </Modal.Body>
        <Modal.Footer>
          {addMilestoneButton}
          {goToProjectsButton}
        </Modal.Footer>
      </Modal>
    );

    var editingPanelConfig = [
      {
        fieldTitle: "Project Name",
        fieldName: "name",
        fieldType: "text",
        fieldValue: stateDict.name
      },
      {
        fieldTitle: "Goal",
        fieldName: "goal",
        fieldType: "textarea",
        fieldValue: stateDict.goal
      },
      {
        fieldTitle: "Notes",
        fieldName: "note",
        fieldType: "textarea",
        fieldValue: stateDict.note
      },
      {
        fieldTitle: "Description",
        fieldName: "description",
        fieldType: "textarea",
        fieldValue: stateDict.description
      },
      {
        fieldTitle: "Highlights",
        fieldName: "highlights",
        fieldType: "textarea",
        fieldValue: stateDict.highlights
      },
      {
        fieldTitle: "Risks",
        fieldName: "risks",
        fieldType: "textarea",
        fieldValue: stateDict.risks
      },
      {
        fieldTitle: "Product Owner",
        fieldName: "owner",
        fieldType: "text",
        fieldValue: stateDict.owner
      },
      {
        fieldTitle: "Editing User",
        fieldName: "userName",
        fieldType: "text",
        fieldValue: stateDict.userName
      }
    ];

    if (!this.state.id) {
      editingPanelConfig.splice(1, 0, {
        fieldTitle: "Project Root ID",
        fieldName: "fid",
        fieldType: "text",
        fieldValue: stateDict.fid
      });
    }

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
            <Label bsStyle={this.state.name ? "success" : "info"}>
              {this.state.name ? this.state.name : "New"}
            </Label>{" "}
            Project
          </h4>
          <hr />

          <form className="form-registration fadeIn">
            {this.state.isSaving ? (
              <div>
                Saving Project..
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
                  : this.sendProject
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
                onClick={this.sendProject}
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

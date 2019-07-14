/**Widget Order**/

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
import NumericInput from "react-numeric-input";

var $ = require("jquery");
const USER_FULL_NAME = document
  .getElementById("content")
  .getAttribute("user_fullname");

export default class OrderWidget extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.getEditingPanel = this.getEditingPanel.bind(this);
    this.handleFormNext = this.handleFormNext.bind(this);
    this.handleSelectNavItem = this.handleSelectNavItem.bind(this);

    this.state = {
      widgetType: null,
      widgetColor: null,
      widgetQuantity: null,
      dateNeededBy: null,
      showLoading: false,
      selectedKey: 1
    };
  }

  handleSelectNavItem(selectedKey) {
    this.setState({
      selectedKey: selectedKey
    });
  }
  handleChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
  handleChangeDate(e, name) {
    let change = {};
    change[name] = e;
    this.setState(change);
  }
  getEditingPanel(fieldTitle, fieldName, fieldType, fieldValue) {
    var currentForm = null;

    switch (fieldType) {
      case "widget_type":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            <FormControl
              name={fieldName}
              componentClass="select"
              value={fieldValue !== null ? fieldValue : "Select"}
              onChange={this.handleChange}
            >
              <option value="Select">Select</option>
              <option value="Widget">Widget</option>
              <option value="Widget Pro">Widget Pro</option>
              <option value="Widget Xtreme">Widget Xtreme</option>
            </FormControl>
          </FormGroup>
        );
        break;
      case "widget_color":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the Milestone {fieldTitle}</ControlLabel>
            <FormControl
              name={fieldName}
              componentClass="select"
              value={fieldValue !== null ? fieldValue : "Select"}
              onChange={this.handleChange}
            >
              <option value="Select">Select</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Yellow">Yellow</option>
            </FormControl>
          </FormGroup>
        );
        break;
      case "widget_quantity":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            <NumericInput className="form-control" strict />
          </FormGroup>
        );
        break;
      case "date":
        currentForm = (
          <FormGroup className="animated animatedFadeInUp fadeInUp">
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            &nbsp;
            <DatePicker
              id={fieldName + "_" + fieldType}
              name={fieldName}
              selected={fieldValue ? fieldValue : new Date()}
              onChange={e => this.handleChangeDate(e, fieldName)}
            />
          </FormGroup>
        );
        break;
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
  handleFormNext() {
    var newSelectedKey = this.state.selectedKey + 1;
    this.setState({
      selectedKey: newSelectedKey
    });
  }


  render() {
    var stateDict = this.state;
    var editingPanelConfig = [
      {
        fieldTitle: "Widget Type",
        fieldName: "widgetType",
        fieldType: "widget_type",
        fieldValue: stateDict.widgetType
      },
      {
        fieldTitle: "Widget Color",
        fieldName: "widgetColor",
        fieldType: "widget_color",
        fieldValue: stateDict.widgetColor
      },
      {
        fieldTitle: "Widget Quantity",
        fieldName: "widgetQuantity",
        fieldType: "widget_quantity",
        fieldValue: stateDict.widgetQuantity
      },
      {
        fieldTitle: "Date needed by",
        fieldName: "dateNeededBy",
        fieldType: "date",
        fieldValue: stateDict.dateNeededBy
      }
    ];
    var editingPanelList = [];
    var navInstanceList = [];
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
      navInstanceList.push(panel.fieldTitle);
    }
    var navInstance = (
      <Nav
        bsStyle="pills"
        stacked={true}
        onSelect={this.handleSelectNavItem}
        activeKey={this.state.selectedKey}
      >
        {navInstanceList.map(function(item, i) {
          return (
            <NavItem key={i} eventKey={i + 1} title={item}>
              {item}
            </NavItem>
          );
        })}
      </Nav>
    );

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        {navInstance}
        <div className="main-right stretch-page">
          <h4>Order a Widget</h4>
          <br />
          <form className="form-registration">
            {this.state.isSaving ? (
              <div>
                Ordering Widget..
                <ReactLoading
                  type="cylon"
                  color="#000000"
                  height={50}
                  width={50}
                />
              </div>
            ) : null}
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
        </div>
      </div>
    );
  }
}

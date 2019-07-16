/**Widget Order**/

import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Nav,
  NavItem,
  Alert,
  Modal,
  Well
} from 'react-bootstrap';
import ReactLoading from 'react-loading';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import NumericInput from 'react-numeric-input';
import { lazyload } from 'react-lazyload';
import { addDays} from './Common';
var $ = require('jquery');

@lazyload({
  height: 200,
  once: true,
  offset: 100
})

export default class OrderWidget extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeNoTarget = this.handleChangeNoTarget.bind(this);
    this.getEditingPanel = this.getEditingPanel.bind(this);
    this.handleFormNext = this.handleFormNext.bind(this);
    this.handleSelectNavItem = this.handleSelectNavItem.bind(this);
    this.sendWidget = this.sendWidget.bind(this);
    this.refreshPage = this.refreshPage.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.state = {
      widgetType: null,
      widgetColor: null,
      widgetQuantity: null,
      dateNeededBy: null,
      showLoading: false,
      selectedKey: 1,
      showFormErrors: [],
      isSaving: false,
      widget_order_id: null,
      showModal: false
    };
  }

  closeModal() {
      this.setState({showModal: false});
  }

  validateForm() {
    var errorList = [];
    var widgetType = this.state.widgetType;
    var widgetColor = this.state.widgetColor;
    var widgetQuantity = this.state.widgetQuantity;
    var dateNeededBy = this.state.dateNeededBy;

    if (!(widgetType) || widgetType == 'Select'){
        errorList.push('Please Select Widget Type(Must be Widget, Widget Pro, or Widget Xtreme)');
    }

    if (!(widgetColor) || widgetColor == 'Select'){
        errorList.push('Please Select Widget Color(Must be red, blue, or yellow)');
    }

    if (!(widgetQuantity) || widgetQuantity == 0){
        errorList.push('Please Select Widget Quantity (Must be greater than zero)');
    }

    if (!(dateNeededBy)){
        errorList.push('Please Select a Date to Deliver By (Must be at least a week from today)');
    }

    if (errorList.length > 0 ) {
        this.setState({showFormErrors: errorList });
    }
    else {
        this.sendWidget();
    }
  }

  sendWidget() {
    var data = {};
    var submitUrl = 'api/v1/widget_order';
    var httpMethod = 'POST';
    var actionTaken = 'created';

    // Prepare payload
    data.type = this.state.widgetType;
    data.color = this.state.widgetColor;
    data.quantity = this.state.widgetQuantity;
    data.date_needed_by = this.state.dateNeededBy
      ? moment(this.state.dateNeededBy).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');
    var errorList = [];

    $.ajax({
      url: submitUrl,
      type: httpMethod,
      contentType: 'application/json',
      data: JSON.stringify(data),
      beforeSend: function() {
        this.setState({ isSaving: true });
      }.bind(this),
      success: function(results) {
        this.setState({ showModal: true, widget_order_id: results.id });
      }.bind(this),
      error: function(xhr, textStatus, error) {
        var errorList = [];
        var defaultMsg = 'A Database Error Occured, Please Contact Support';
        errorList.push(defaultMsg);
      }.bind(this),
      complete: function() {
        this.setState({ isSaving: false, showFormErrors: errorList });
      }.bind(this)
    });
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
  handleChangeNoTarget(e, name) {
    let change = {};
    change[name] = e;
    this.setState(change);
  }
  handleChangeQuantity(e, name) {
    let change = {};
    if (e < 0){
        e = 0;
    }
    change[name] = e;
    this.setState(change);
  }
  getEditingPanel(fieldTitle, fieldName, fieldType, fieldValue) {
    var currentForm = null;

    switch (fieldType) {
      case 'widget_type':
        currentForm = (
          <FormGroup className='animated animatedFadeInUp fadeInUp'>
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            <FormControl
              name={fieldName}
              componentClass='select'
              value={fieldValue !== null ? fieldValue : 'Select'}
              onChange={this.handleChange}
            >
              <option value='Select'>Select</option>
              <option value='Widget'>Widget</option>
              <option value='Widget Pro'>Widget Pro</option>
              <option value='Widget Xtreme'>Widget Xtreme</option>
            </FormControl>
          </FormGroup>
        );
        break;
      case 'widget_color':
        currentForm = (
          <FormGroup className='animated animatedFadeInUp fadeInUp'>
            <ControlLabel>Enter the Milestone {fieldTitle}</ControlLabel>
            <FormControl
              name={fieldName}
              componentClass='select'
              value={fieldValue !== null ? fieldValue : 'Select'}
              onChange={this.handleChange}
            >
              <option value='Select'>Select</option>
              <option value='red'>red</option>
              <option value='blue'>blue</option>
              <option value='yellow'>yellow</option>
            </FormControl>
          </FormGroup>
        );
        break;
      case 'widget_quantity':
        currentForm = (
          <FormGroup className='animated animatedFadeInUp fadeInUp'>
            <ControlLabel>Enter the {fieldTitle} (Must be greater than zero)</ControlLabel>
            <br/>
            <NumericInput
              className='form-control'
              strict
              value={fieldValue !== null ? fieldValue : 0}
              onChange={e => this.handleChangeQuantity(e, fieldName)}
            />
          </FormGroup>
        );
        break;
      case 'date':
        currentForm = (
          <FormGroup className='animated animatedFadeInUp fadeInUp'>
            <ControlLabel>Enter the {fieldTitle} (Must be at least 1 week from today)</ControlLabel>
            <br/>
            &nbsp;
            <DatePicker
              id={fieldName + '_' + fieldType}
              name={fieldName}
              selected={fieldValue}
              onChange={e => this.handleChangeNoTarget(e, fieldName)}
              minDate={addDays(new Date(), 7)}
              placeholderText='Click to select a date'
            />
          </FormGroup>
        );
        break;
      default:
        currentForm = (
          <FormGroup className='animated animatedFadeInUp fadeInUp'>
            <ControlLabel>Enter the {fieldTitle}</ControlLabel>
            <FormControl
              style={{
                height: 200
              }}
              id={fieldName + '_' + fieldType}
              name={fieldName}
              componentClass={fieldType}
              placeholder={fieldTitle}
              onChange={this.handleChange}
              value={fieldValue !== null ? fieldValue : ''}
            />
          </FormGroup>
        );
    }

    var editType = (
      <div className='animated fadeIn'>
        <Well
          className='form-well'
          id='project-info'
          style={{
            height: 400,
            width: 800
          }}
        >
          <h3 className='offset-3'>
            {Array.isArray(fieldTitle)
              ? fieldTitle[fieldTitle.length - 1]
              : fieldTitle}
          </h3>
          <hr />
          <div className='input-well'>{currentForm}</div>
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

  refreshPage() {
    window.location.reload();
  }

  render() {
    var stateDict = this.state;
    var editingPanelConfig = [
      {
        fieldTitle: 'Widget Type',
        fieldName: 'widgetType',
        fieldType: 'widget_type',
        fieldValue: stateDict.widgetType
      },
      {
        fieldTitle: 'Widget Color',
        fieldName: 'widgetColor',
        fieldType: 'widget_color',
        fieldValue: stateDict.widgetColor
      },
      {
        fieldTitle: 'Widget Quantity',
        fieldName: 'widgetQuantity',
        fieldType: 'widget_quantity',
        fieldValue: stateDict.widgetQuantity
      },
      {
        fieldTitle: 'Date needed by',
        fieldName: 'dateNeededBy',
        fieldType: 'date',
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
        bsStyle='pills'
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

    var errorAlert = (
      <Alert bsStyle='danger' className='form-errors animated shake'>
        <strong>The following errors occured:</strong>
        <br />
        <ul>
          {this.state.showFormErrors.map(
            function(row) {
              return <li key={row}>{row}</li>;
            }.bind(this)
          )}
        </ul>
      </Alert>
    );

    var orderAgainButton = (
      <Button bsStyle='default' onClick={this.refreshPage}>
        Order Again
      </Button>
    );

    var closeModalButton = (
      <Button bsStyle='default' onClick={this.closeModal}>
        Close Popup
      </Button>
    );

    var successPopup = (
      <Modal show={this.state.showModal}>
        <Modal.Header closeButton>
          <Modal.Title>Widget Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Widget has been orderd succesfully!</p>
          <p>Your Order ID: {this.state.widget_order_id}</p>
        </Modal.Body>
        <Modal.Footer>
            <div className="divider" /> {closeModalButton}
            <div className="divider" /> {orderAgainButton}
        </Modal.Footer>

      </Modal>
    );

    return (
      <div className='main-container animated animatedFadeInUp fadeInUp'>
        {navInstance}
        <div className='main-right stretch-page'>
          <h4>Welcome! Use the below form to order a Widget</h4>
          <br />
          <form className='form-registration'>
            {this.state.isSaving ? (
              <div>
                Ordering Widget..
                <ReactLoading
                  type='cylon'
                  color='#000000'
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
                  ? 'default'
                  : 'primary'
              }
              type='button'
              name='next/submit'
              onClick={
                this.state.selectedKey < editingPanelList.length
                  ? this.handleFormNext
                  : this.validateForm
              }
            >
              {this.state.selectedKey < editingPanelList.length
                ? 'Next'
                : 'Submit'}
            </Button>
            &nbsp;&nbsp;
            {this.state.selectedKey < editingPanelList.length ? (
              <Button
                bsStyle={'primary'}
                type='button'
                name='submit'
                onClick={this.validateForm}
              >
                Submit
              </Button>
            ) : null}
          </form>
          {successPopup}
        </div>
      </div>
    );
  }
}

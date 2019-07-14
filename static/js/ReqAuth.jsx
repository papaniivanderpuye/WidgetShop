import React from "react";
import {BrowserRouter, Route, Link} from "react-router-dom";
import { MenuItem,
    Nav,
    Navbar,
    NavItem,
    NavDropdown,
    Button,
    Glyphicon,
    PageHeader,
    ControlLabel,
    FormControl,
    FormGroup,
    Table,
    Modal
} from "react-bootstrap";
import ReactLoading from "react-loading";
import '../css/fullstack.css';
import '../css/animate.css';

var $ = require('jquery');
var username = document.getElementById("content").getAttribute("user_ntid");
var fullname = document.getElementById("content").getAttribute("user_fullname");
var email = document.getElementById("content").getAttribute("user_email");

export default class ReqAuth extends React.Component {
    constructor(props) {
        super(props);

        this.submitRequest = this.submitRequest.bind(this);

        this.state={
            submitted: false,
            showLoading: false
        }
    }


    submitRequest(){
        var data={netid:username, name:fullname, email:email}
        $.ajax({
            url: Config.default.apiVersion + '/mail/user_request',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            beforeSend: function(xhr) {
                this.setState({
                    showLoading: true
                });
                xhr.setRequestHeader('Token', Config.default.token);
            }.bind(this),
            success: function(){
                this.setState({
                    submitted: true
                });
            }.bind(this),
            complete: function(){
                this.setState({
                    showLoading: false
                });
            }.bind(this)
        });
    }

    render() {
        return (
        <BrowserRouter>
            <div>
                <Navbar collapseOnSelect fluid className="top-bar" bsStyle="inverse">
                    <Navbar.Header>
                        <Navbar.Brand>
                            TES | Automation KPI
                        </Navbar.Brand>


                    </Navbar.Header>
                </Navbar>
                <Modal show={true} >
                    <Modal.Header>
                        <h4>You are not authorized to view this site.</h4>
                    </Modal.Header>
                  <Modal.Body>
                    <h4>
                        Please contact TES Automation Team to authorize you.
                    </h4>
                    <br/>
                    <h4>Full Name: <small>{fullname}</small></h4>
                    <h4>Username: <small>{username}</small></h4>
                    <h4>Email: <small>{email}</small></h4>
                  </Modal.Body>
                  <Modal.Footer>
                    <a href={
                            "mailto:TES_Automation_and_Strategy@comcast.com?subject=TES%20Automation%20KPI%20Access%20Request"
                                + "%0D%0A" + "&body=Hi,%20I%20am%20requesting%20access%20to%20Automation%20KPI"
                                + "%0D%0A" + "%0D%0A" + "Full%20Name:%20" + fullname
                                + "%0D%0A" + "Username:%20" + username
                                + "%0D%0A" + "Email:%20" + email
                        }

                        >
                        <Button>
                            <span className="glyphicon glyphicon-envelope" />
                            &nbsp; Email TES Automation
                        </Button>
                    </a>
                  </Modal.Footer>
                </Modal>
            </div>
        </BrowserRouter>
        );
    }
}

import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
var RPM_VERSION = document.getElementById("content").getAttribute("rpm_ver");
if (RPM_VERSION === "Unknown") {
  RPM_VERSION = "null";
}

export default class AppRouter extends React.Component {
  constructor(props) {
    super(props);
    this.handleApiClick = this.handleApiClick.bind(this);
  }

  handleApiClick() {
    var url = "http://tesautomation.comcast.com";
    window.open(url, "_blank");
  }

  render() {
    return (
      <div>
        <div className="text-center site-logo">
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
        <div className="footer">
          <div className="footer-branding text-center">
            <p>© TES Automation & Strategy KPI v {RPM_VERSION}</p>
          </div>
        </div>
      </div>
    );
  }
}

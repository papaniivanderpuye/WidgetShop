/** Home **/

import React from "react";
import {
  Button,
  Glyphicon,
  Thumbnail,
  Grid,
  Row,
  Col,
  PageHeader
} from "react-bootstrap";
import { Link } from "react-router-dom";

const USER_FULL_NAME = document
  .getElementById("content")
  .getAttribute("user_fullname");

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.downloadLeadershipReport = this.downloadLeadershipReport.bind(this);
    this.downloadFullReport = this.downloadFullReport.bind(this);
  }

  downloadLeadershipReport() {
    var time = new Date().getTime();
    var url = "/v1/download/leadership/report";
    window.open(url + "?version=" + time);
  }

  downloadFullReport() {
    var time = new Date().getTime();
    var url = "/v1/download/weekly/report";
    window.open(url + "?version=" + time);
  }

  render() {
    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left">
          <h3>
            Welcome to
            <br />
            TES AutoKPI!
          </h3>
          <hr />
          <p>
            TES Automation & Strategy KPI is an interactive platform engineered
            by the TES Automation team to display metrics on team/ individual
            velocity and efficiency on items completed using agile development
            and reporting.
          </p>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>What would you like to do today?</PageHeader>
          <div>
              <Link
                to="/order_widget"
                className="btn btn-primary btn-lg hvr-float home-buttons"
              >
                <Glyphicon glyph="th-list" />
                &nbsp; Order Widget
                <hr />
                Order widgtes you need.
              </Link>{" "}
            <Link
              to="/projects"
              className="btn btn-primary btn-lg hvr-float home-buttons"
            >
              <Glyphicon glyph="th-list" />
              &nbsp; View Projects
              <hr />
              View and edit projects.
            </Link>{" "}
            <Link
              to="/milestones"
              className="btn btn-primary btn-lg hvr-float home-buttons"
            >
              <Glyphicon glyph="th-list" />
              &nbsp; View Milestones
              <hr />
              <p>View and edit Milestones.</p>
            </Link>{" "}
            <Link
              to="#"
              onClick={this.downloadLeadershipReport}
              className="btn btn-success btn-lg hvr-float home-buttons"
            >
              <Glyphicon glyph="download" />
              &nbsp; Report
              <hr />
              Download Our Leadership Report.
            </Link>{" "}
            <Link
              to="#"
              onClick={this.downloadFullReport}
              className="btn btn-success btn-lg hvr-float home-buttons"
            >
              <Glyphicon glyph="download" />
              &nbsp; Full Report
              <hr />
              <p>Download Our Full Report.</p>
            </Link>{" "}
            <br />
            <Link
              to="/tableau_weekly_status"
              className="btn btn-primary btn-lg hvr-float home-buttons view-tableau-button"
            >
              <Glyphicon glyph="stats" />
              &nbsp; View Tableau
              <hr />
              <p>View TES Automation Tableau.</p>
            </Link>{" "}
          </div>
        </div>
      </div>
    );
  }
}

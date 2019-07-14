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
  Label
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Pagination from "react-js-pagination";
import ReactLoading from "react-loading";
import { difference, Article, Section } from "./Common";

var $ = require("jquery");

export default class Projects extends React.Component {
  constructor(props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.handleFilterTermChange = this.handleFilterTermChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleResultsPageChange = this.handleResultsPageChange.bind(this);
    this.getFilteredProjects = this.getFilteredProjects.bind(this);

    this.state = {
      showLoading: false,
      projects: [],
      errMsg: "",
      activePage: 1,
      rowsPerPage: 5,
      filterTerm: ""
    };
  }

  componentDidMount() {
    $.ajax({
      url: "/v1/projects",
      type: "GET",
      contentType: "application/json",
      beforeSend: function(xhr) {
        this.setState({ showLoading: true });
      }.bind(this),
      success: function(data) {
        var results = data.data;
        results = Array.isArray(results) ? results : [results];
        results = this.flattenResults(results);
        this.setState({ projects: results });
      }.bind(this),
      complete: function() {
        this.setState({ showLoading: false, errMsg: "" });
      }.bind(this)
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  flattenResults(results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i].type == "project") {
        results[i] = this.flattenProject(results[i]);
      }
    }
    return results;
  }

  flattenProject(results) {
    results.name = results.attributes.name;
    results.highlights = results.attributes.highlights;
    results.goal = results.attributes.goal;
    results.description = results.attributes.description;
    results.note = results.attributes.note;
    results.owner = results.attributes.owner;
    results.fid = results.attributes.fid;
    if (
      typeof results.relationships != "undefined" ||
      results.relationships != null
    ) {
      results.milestoneCount = results.relationships.milestones.data.length;
    } else {
      results.milestoneCount = 0;
    }
    delete results.attributes;
    return results;
  }

  getFilteredProjects() {
    var projects = [];
    for (var i = 0; i < this.state.projects.length; i++) {
      if (this.state.filterTerm.length > 0) {
        var filterFields = [];
        var searchString = this.state.filterTerm.toLowerCase();

        if (this.state.projects[i].name !== null) {
          filterFields.push(this.state.projects[i].name.toLowerCase());
        }

        if (this.state.projects[i].highlights != null) {
          filterFields.push(this.state.projects[i].highlights.toLowerCase());
        }

        if (this.state.projects[i].note != null) {
          filterFields.push(this.state.projects[i].note.toLowerCase());
        }

        if (this.state.projects[i].goal != null) {
          filterFields.push(this.state.projects[i].goal.toLowerCase());
        }

        for (var si = 0; si < filterFields.length; si++) {
          if (filterFields[si].indexOf(searchString) !== -1) {
            projects.push(this.state.projects[i]);
            break;
          }
        }
      } else {
        projects.push(this.state.projects[i]);
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
    var projects = this.getFilteredProjects();
    var totalResults = projects.length;
    var rowsMax = this.state.activePage * this.state.rowsPerPage; // page 2: 20
    var rowsMin = rowsMax - this.state.rowsPerPage + 1; // page 2: 11
    projects = projects.slice(rowsMin - 1, rowsMax);

    var addNewProjectButton = (
      <Link to={"/project/edit/"} className=" btn btn-default ">
        <span className="glyphicon glyphicon-plus" />
        Add New Project
      </Link>
    );

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

    var resultsPage = (
      <div className="text-center">
        <FormGroup
          controlId="formResultsPage"
          className="results-per-page-container"
        >
          <ControlLabel>Results per page:</ControlLabel>
          <FormControl
            className="results-per-page"
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
            [ {this.state.projects.length} total results{" "}
            {this.state.filterTerm.length > 0 ? (
              <small>
                > {totalResults}
                with filter{" "}
                <Button
                  bsStyle="link"
                  bsSize="xsmall"
                  className="btn-remove-filter"
                  onClick={this.clearFilter}
                >
                  <Glyphicon glyph="remove" />
                  Remove Filter
                </Button>
              </small>
            ) : null}]
          </div>
        </FormGroup>
      </div>
    );

    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left ">
          <PageHeader>
            <small>Projects</small>
          </PageHeader>
          <h3>{addNewProjectButton}</h3>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>TES Automation & Strategy Projects</PageHeader>
          <form>
            <FormGroup controlId="formFilter">
              <FormControl
                type="text"
                value={this.state.filterTerm}
                placeholder="Type to filter projects"
                onChange={this.handleFilterTermChange}
                onKeyPress={e => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
            </FormGroup>
          </form>
          {resultsPage}
          {pages}
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

          {projects.length > 0 ? (
            <Table
              bordered={true}
              condensed={true}
              hover={true}
              className="fadeIn"
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Highlights</th>
                  <th>Goal</th>
                  <th>Owner</th>
                  <th>Notes</th>
                  <th>Milestone Count</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(
                  function(row) {
                    var viewLink = "/project/view/" + row.id;
                    return (
                      <tr
                        className="animated animatedFadeInUp fadeInUp"
                        key={row.id + this.state.filterTerm}
                      >
                        <td align="center">
                          <Link className="hvr-fade" to={viewLink}>
                            <h3>{row.name}</h3>
                          </Link>
                        </td>
                        <td>
                          <div className="cell-display-scroll show-new-lines">
                            {row.highlights}
                          </div>
                        </td>
                        <td>{row.goal}</td>
                        <td>{row.owner}</td>
                        <td>
                          <div className="cell-display-scroll show-new-lines">
                            {row.note}
                          </div>
                        </td>
                        <td>{row.milestoneCount}</td>
                      </tr>
                    );
                  }.bind(this)
                )}
              </tbody>
            </Table>
          ) : null}
          {pages}
        </div>
      </div>
    );
  }
}

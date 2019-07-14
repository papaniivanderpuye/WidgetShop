import React from "react";
import { MenuItem, Nav, Navbar, NavItem, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
const USER_FULL_NAME = document
  .getElementById("content")
  .getAttribute("user_fullname");
var isAdmin = null;

export default class TopMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Navbar collapseOnSelect fluid className="top-bar" bsStyle="inverse">
        <Navbar.Header>
          <Navbar.Brand>TES Automation & Strategy</Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav>
            <NavItem eventKey={1} componentClass={Link} href="/" to="/">
              Home
            </NavItem>
          </Nav>
          <Nav>
            <NavItem
              eventKey={2}
              componentClass={Link}
              href="/projects"
              to="/projects"
            >
              Projects
            </NavItem>
          </Nav>
          <Nav>
            <NavItem
              eventKey={3}
              componentClass={Link}
              href="/milestones"
              to="/milestones"
            >
              Milestones
            </NavItem>
          </Nav>
          <Nav>
            <NavDropdown eventKey={4} title="Archived" id="basic-nav-dropdown">
              <MenuItem
                eventKey={4.1}
                componentClass={Link}
                href="/archive/projects"
                to="/archive_projects"
              >
                Archived Projects
              </MenuItem>
              <MenuItem
                eventKey={4.2}
                componentClass={Link}
                href="/archive/milestones"
                to="/archive_milestones"
              >
                Archived Milestones
              </MenuItem>
            </NavDropdown>
          </Nav>
          <Nav pullRight>
            <NavDropdown
              pullRight
              title={"Hello, " + USER_FULL_NAME + "!"}
              id="basic-nav-dropdown"
            >
              {isAdmin ? (
                <MenuItem
                  eventKey={1}
                  componentClass={Link}
                  href="/admin"
                  to="/admin"
                >
                  Admin
                </MenuItem>
              ) : null}
              <MenuItem
                eventKey={3}
                componentClass={Link}
                href="/logoff"
                to="/logoff"
              >
                Log Off
              </MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

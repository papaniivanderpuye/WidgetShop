import React from "react";
import { HashRouter, BrowserRouter, Route, Link } from "react-router-dom";

/** App Pages **/
import Footer from "./Footer";
import Home from "./Home";
import TopMenu from "./TopMenu";
import OrderWidget from "./OrderWidget";
import Projects from "./Projects";
import Milestones from "./Milestones";
import ProjectView from "./ProjectView";
import ProjectEdit from "./ProjectEdit";
import MilestoneEdit from "./MilestoneEdit";
import ArchivedProjects from "./ArchivedProjects";
import ArchivedMilestones from "./ArchivedMilestones";
import MilestoneTimeline from "./MilestoneTimeline";
import ProjectTimeLine from "./ProjectTimeLine";
import WeeklyTableauView from "./WeeklyTableauView";
import Logout from "./Logout";

export default class AppRouter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <TopMenu />
          <div className="page-body">
            <Route exact path="/" component={Home} />
            <Route exact path="/projects" component={Projects} />
            <Route exact path="/milestones" component={Milestones} />
            <Route exact path="/order_widget" component={OrderWidget} />
            <Route
              exact
              path="/project/view/:projectId"
              component={ProjectView}
            />
            <Route
              exact
              path="/project/edit/:projectId"
              component={ProjectEdit}
            />
            <Route exact path="/project/edit/" component={ProjectEdit} />
            <Route
              exact
              path="/milestone/edit/:projectId/:milestoneId"
              component={MilestoneEdit}
            />
            <Route
              exact
              path="/milestone/edit/:projectId/"
              component={MilestoneEdit}
            />
            <Route
              exact
              path="/archive_projects"
              component={ArchivedProjects}
            />
            <Route
              exact
              path="/archive_milestones"
              component={ArchivedMilestones}
            />
            <Route
              exact
              path="/timeline/milestone/:milestoneId"
              component={MilestoneTimeline}
            />
            <Route
              exact
              path="/timeline/project/:projectId"
              component={ProjectTimeLine}
            />
            <Route
              exact
              path="/tableau_weekly_status"
              component={WeeklyTableauView}
            />
            <Route exact path="/logoff" component={Logout} />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

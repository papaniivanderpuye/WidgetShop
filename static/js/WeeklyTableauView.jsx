/** Weekly Tableau View **/

import React from "react";
import { PageHeader, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default class WeeklyTableauView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left-tableau">
          <PageHeader>
            <small>Tableau - TES A&S Team​</small>
          </PageHeader>
          <p>
            This Tableau shows the progress of the TES Automation and Strategy
            Team.
          </p>
        </div>
        <div className="main-right stretch-page">
          <PageHeader>Weekly Status Report</PageHeader>
          <a
            href="https://ts3.comcast.com/#/site/TESBusinessIntelligence/views/TESAutomationKPIs/TESAutomation"
            target="_blank"
          >
            <Button>View on Tableu Site</Button>
          </a>
          <br />
          <br />
          <iframe
            width="1204"
            height="836"
            frameBorder="0"
            src="https://ts3.comcast.com/t/TESBusinessIntelligence/views/TESAutomationKPIs/TESAutomation?iframeSizedToWindow=true&:retry=yes&:embed=y&:showAppBanner=false&:display_count=no&:showVizHome=no"
          />​​​​​
        </div>

      </div>
    );
  }
}

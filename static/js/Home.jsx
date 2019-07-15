/** Home **/

import React from "react";
import {
  Glyphicon,
  PageHeader
} from "react-bootstrap";
import { Link } from "react-router-dom";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="main-container animated animatedFadeInUp fadeInUp">
        <div className="main-left">
          <h3>
            Welcome to
            <br />
            Widgy!
          </h3>
          <hr />
          <p>
            Widgy is an interactive platform engineered
            by Papa Nii Vanderpuye to allow users to order widgets they
            need
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
              </Link>
          </div>
        </div>
      </div>
    );
  }
}

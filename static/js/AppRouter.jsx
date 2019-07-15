/** AppRouter **/
import React from "react";
import { BrowserRouter, Route} from "react-router-dom";

/** App Pages **/
import Footer from "./Footer";
import Home from "./Home";
import TopMenu from "./TopMenu";
import OrderWidget from "./OrderWidget";

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
            <Route exact path="/order_widget" component={OrderWidget} />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

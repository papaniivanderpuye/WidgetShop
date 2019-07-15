/** Footer **/
import React from "react";

export default class AppRouter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="footer">
          <div className="footer-branding text-center">
            <p>© Widgy v 1.0</p>
          </div>
        </div>
      </div>
    );
  }
}

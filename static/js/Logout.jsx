import React from "react";

var $ = require('jquery');

export default class Logout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showLoading: true
        };
    }

    logoutUser() {
        $.ajax({
            url: '/logout',
            type: 'GET',
            contentType: 'application/json',
            success: function(data) {
                var url = data.url;
                this.setState({
                    showLoading: false
                });
                window.open(url, '_self');
            }.bind(this),
        });
    }

    componentDidMount() {
        this.logoutUser();
    }

    render() {
        return (
            <div>
                Logging Out
            </div>
        );
    }
}

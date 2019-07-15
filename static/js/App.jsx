/** App **/

import React from "react";
import AppRouter from "./AppRouter";

import '../css/fullstack.css';
import '../css/animate.css';


export default class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <AppRouter />
        );
    }
}

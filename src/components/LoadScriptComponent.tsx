/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import { LoadScriptNext } from "@react-google-maps/api";
import { Libraries } from "@react-google-maps/api/dist/utils/make-load-script-url";
import React, { createElement } from "react";

export interface LoadScriptComponentInterface {
    apiKey: string;
    libraries: Libraries;
    children: any;
}

interface LoadScriptComponentState {
    // googleScriptRef : React.RefObject<LoadScript>
    isLoaded: boolean;
}

// define outside of component, else it will trigger warnings in browser
// places API needed for SearchBox
const libaries = ["drawing", "places"] as Libraries;

export class LoadScriptComponent extends React.Component<LoadScriptComponentInterface, LoadScriptComponentState> {
    logNode: string;
    constructor(props: LoadScriptComponentInterface) {
        super(props);
        this.logNode = "Google Maps Custom Marker (React) widget: LoadScriptComponent: ";
        this.state = {
            isLoaded: false
        };
    }
    componentDidMount() {
        if (!this.state.isLoaded) {
            console.debug(this.logNode + "componentDidMount: Updating state to isLoaded=true");
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({ isLoaded: true });
        }
    }
    shouldComponentUpdate(_nextProps: any, nextState: any) {
        if ((nextState.isLoaded === this.state.isLoaded) === true) {
            // triggered when widget is reloaded because of on click of MVC Object, need to reload to show infowindow
            console.debug(
                this.logNode +
                    "shouldComponentUpdate: Load Script loaded Google Maps API before! nextState.isLoaded: " +
                    nextState.isLoaded +
                    " this.state.isLoaded: " +
                    this.state.isLoaded
            );
            return true;
        } else if (window.google && window.google.maps) {
            console.debug(
                this.logNode +
                    "shouldComponentUpdate: Load Script loaded Google Maps API before! nextState.isLoaded: " +
                    nextState.isLoaded +
                    " this.state.isLoaded: " +
                    this.state.isLoaded
            );
            return false;
        } else if (nextState.isLoaded !== this.state.isLoaded) {
            console.debug(
                this.logNode +
                    "shouldComponentUpdate: Load Script loaded Google Maps API first time! nextState.isLoaded: " +
                    nextState.isLoaded +
                    " this.state.isLoaded: " +
                    this.state.isLoaded
            );
            return false;
        } else {
            console.debug(
                this.logNode +
                    "shouldComponentUpdate: Load Script not loaded yet, loading...! nextState.isLoaded: " +
                    nextState.isLoaded +
                    " this.state.isLoaded: " +
                    this.state.isLoaded
            );
            return true;
        }
    }
    render() {
        // if not loaded yet, add script
        if (!this.state.isLoaded) {
            return (
                <div id="loadScriptWrapper">
                    <LoadScriptNext
                        googleMapsApiKey={this.props.apiKey}
                        libraries={libaries}
                        id={"_com.mendix.widget.custom.Maps.Maps"}
                    >
                        <div className="loadScriptChildrenWrapper">{this.props.children}</div>
                    </LoadScriptNext>
                </div>
            );
        }
        // else just return children (map + infowindow + objects)
        else {
            return (
                <div id="loadScriptWrapper">
                    <div className="loadScriptChildrenWrapper">{this.props.children}</div>
                </div>
            );
        }
    }
}

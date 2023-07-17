/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import { Component, createElement } from "react";
import { InfoWindow } from "@react-google-maps/api";

import { ListWidgetValue, ObjectItem } from "mendix";
import { PositionProps } from "./MarkerUtils";
import React from "react";

export interface InfoWindowProps extends InfoWindowExposedProps {
    pixelOffset?: google.maps.Size;
    position?: PositionProps;
    onCloseClick?: any;
}

export interface InfoWindowExposedProps {
    name: string;  
    infoWindowWidget?: ListWidgetValue;
    mxObject?: ObjectItem;
}

export default class InfoWindowComponent extends Component<InfoWindowProps> {
    logNode: string;
    constructor(props: InfoWindowProps) {
        super(props);
        this.logNode = "Google Maps Custom Marker (React) widget: InfoWindow Component: ";
    }
    componentDidUpdate(prevProps: any) {
        if (prevProps) {
            console.debug(this.logNode + "componentDidUpdate");
        }
    }
    render(){  
        let innerWidget: React.ReactNode;
        if (this.props.infoWindowWidget && this.props.mxObject) {
            innerWidget = this.props.infoWindowWidget.get(this.props.mxObject);
        }
        return (  <InfoWindow
        position={this.props.position}
        onCloseClick={this.props.onCloseClick}
        options={{ pixelOffset: this.props.pixelOffset }}
    >
        <div>
            {innerWidget}
        </div>
    </InfoWindow>)
    }
}

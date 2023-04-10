/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import React, { createElement } from "react";

interface SearchBoxProps {
    placeholder?: string;
    width: number;
    height: number;
}

export default class SearchBox extends React.Component<SearchBoxProps> {
    logNode: string;
    constructor(props: SearchBoxProps) {
        super(props);
        this.logNode = "Google Maps Custom Marker (React) widget: SearchBox Component: ";
    }
    render() {
        console.debug(this.logNode + " rendering SearchBox!");

        const imgStyle = { height: this.props.height + "px", width: this.props.width + "px" };

        return (
            <input
                id="pac-input"
                data-dojo-attach-point="searchBoxContainer"
                className="gm-searchbox-input"
                type="text"
                placeholder={this.props.placeholder}
                style={imgStyle}
            ></input>
        );
    }
}

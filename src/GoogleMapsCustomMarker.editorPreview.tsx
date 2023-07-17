import { Component, ReactNode, createElement } from "react";

import GoogleMapsContainer from "./components/GoogleMapsContainer";

import { GoogleMapsCustomMarkerContainerProps } from "../typings/GoogleMapsCustomMarkerProps.d";

export class preview extends Component<GoogleMapsCustomMarkerContainerProps> {
    render(): ReactNode {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mx = window.mx;
        const viewerProps = {
            ...this.props,
            mx
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return <GoogleMapsContainer {...viewerProps} />;
    }
}

export function getPreviewCss(): string {
    return require("./ui/GoogleMapsCustomMarker.css");
}

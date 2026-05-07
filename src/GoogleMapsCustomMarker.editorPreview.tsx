import { createElement } from "react";

export function preview() {
    return <div>Google Maps Custom Marker Widget</div>;
}

export function getPreviewCss() {
    return require("./ui/GoogleMapsCustomMarker.css").toString();
}

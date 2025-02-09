/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import { EditableValue } from "mendix";
import { MarkerProps } from "./Marker";
import { Big } from "big.js";
import { LegendEntryIconEnum } from "typings/GoogleMapsCustomMarkerProps";
import { sizeEnum } from "./Marker"

export interface IconProps {
    path: string | google.maps.SymbolPath;
    fillOpacity?: number;
    strokeOpacity?: number;
    scale: number;
    strokeWeight: number;
}

export interface PositionProps {
    lat: number;
    lng: number;
}

const logNode = "Google Maps Custom Marker (React) widget: Marker Utils: ";

export function onDragEnd(
    latLng: google.maps.LatLng,
    latAttrUpdate?: EditableValue<Big | string>,
    lngAttrUpdate?: EditableValue<Big | string>,
    formattedAddressAttr?: EditableValue<string>
) {

    const lat = latAttrUpdate?.value;
    const lng = lngAttrUpdate?.value;

    if (lat && lng) {
        console.debug(logNode + " old lat / lng: " + lat + " / " + lng);
    }

    if (latLng && latAttrUpdate && lngAttrUpdate) {
        const newLat = latLng.lat();
        const newLng = latLng.lng();
        if (newLat && newLng) {
            updateAttribute(newLat, "lat", latAttrUpdate);
            updateAttribute(newLng, "lng", lngAttrUpdate);
        }
    }

    // store the formatted address of the location if attribute selected in modeler
    if (formattedAddressAttr) {
        try {
            // reverse geocode and do not commit
            geocodePosition(latLng, formattedAddressAttr);
        } catch (e) {
            console.error(logNode + e);
        }
    }
}

export function geocodePosition(latLng: google.maps.LatLng, formattedAddressAttr: EditableValue<string>) {
    const geocoder = new google.maps.Geocoder();

    if (latLng) {
        geocoder.geocode({ location: latLng }, (results: any, status: any) => {
            console.debug(logNode + "results: ");
            console.dir(results);
            console.debug(logNode + "status: " + status);
            if (status === "OK" && results.length > 0) {
                formattedAddressAttr.setValue(JSON.stringify(results));
            } else {
                console.debug("Cannot determine address at this location for the following reason: " + status);
            }
        });
    }
}
export function updateAttribute(coordinate: number, type: string, attrUpdate?: EditableValue<Big | string>) {
    // let coordinateParsed : Big | string;
    if (attrUpdate && isAttributeEditable(type + "AttrUpdate", attrUpdate)) {
        // parse number returned from Google to correct type based on Mendix attribute
        if (typeof attrUpdate.value === "string") {
            console.debug(logNode + "parsing coordinate number to string..");
            attrUpdate.setValue(String(coordinate));
        } // else means Big / Decimal
        else {
            console.debug(logNode + "parsing coordinate number to Big..");
            attrUpdate.setValue(new Big(coordinate.toFixed(8)));
        }
    }
}

export function setLineStyleOptions(lineType: string, strokeWeight: number) {
    let lineSymbol = {} as IconProps;
    if (lineType === "Dotted") {
        lineSymbol = {
            path: 0, // google not loaded yet, but should be: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            scale: 3,
            strokeWeight
        };
    } else if (lineType === "Dashed") {
        lineSymbol = {
            path: "M 0,-1 0,1",
            strokeOpacity: 1,
            scale: 4,
            strokeWeight
        };
    }
    return lineSymbol;
}

export function isAttributeEditable(propName: string, prop: EditableValue): boolean {
    let editable = false;
    if (prop && prop.status === "available" && !prop.readOnly) {
        editable = true;
        console.debug(logNode + propName + " is editable.");
    }
    return editable;
}

export function pinSymbol(color: string, symbol: LegendEntryIconEnum, size: sizeEnum) {
    // define pathsymbol to be by default a marker
    let symbolScale = 0.8;
    switch (size) {
        case "L":
            symbolScale = 1;
            break;
        case "M":
            symbolScale = 0.8;
            break;
        case "S":
            symbolScale = 0.5;
            break;
        case "XS":
            symbolScale = 0.3;
            break;
        case "XXS":
            symbolScale = 0.1;
            break;
    }
    const pathSymbol = pinSymbolPath(symbol);

    const googleSymbol: google.maps.Symbol = {
        path: pathSymbol,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#FFF",
        strokeWeight: 1,
        scale: symbolScale
    };

    return googleSymbol;
}

export function pinSymbolPath(symbol: LegendEntryIconEnum): string {
    // define pathsymbol to be by default a marker
    let pathSymbol =
        "M 0,0 C -2,-10 -10,-12 -10,-15 A 10,10 0 1,1 10,-15 C 10,-12 2,-10 0,0 z M -2,-15 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0";
    switch (symbol) {
        case "CIRCLE":
            pathSymbol = "M 0, 0 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0";
            break;
        case "STAR":
            pathSymbol = "M 0,-8 6,2 12,2 6,10 10,20 0,15 -10,20 -6,10 -12,2 -6,2 z";
            break;
        case "CROSS":
            pathSymbol = "M -5 -15 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 v-10 h10 z";
            break;
        case "TRIANGLE":
            pathSymbol = "M -15 15 L 15 15 L 0 -15 z";
            break;
        case "DIAMOND":
            pathSymbol = "M 0 -15 15 0 0 15 -15 0 Z";
            break;
    }

    return pathSymbol;
}

export function createSymbol(location: MarkerProps): string {
    let symbol: string;
    if (location.iconImage && location.iconImage.value) {
        symbol = location.iconImage.value.uri;
    } else {
        symbol = pinSymbolPath(location.symbol ?? "MARKER");
    }
    return symbol;
}   

export { MarkerProps };

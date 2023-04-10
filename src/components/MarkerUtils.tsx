/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import { EditableValue } from "mendix";
import { Big } from "big.js";
import { MarkerProps } from "./Marker";

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

export function addMarkerDragEvent(
    marker: google.maps.Marker,
    latAttrUpdate?: EditableValue<Big | string>,
    lngAttrUpdate?: EditableValue<Big | string>,
    formattedAddressAttr?: EditableValue<string>
) {
    google.maps.event.addListener(marker, "dragend", () => {
        const lat = latAttrUpdate?.value;
        const lng = lngAttrUpdate?.value;

        if (lat && lng) {
            console.debug(logNode + " old lat / lng: " + lat + " / " + lng);
        }

        if (marker && marker.getPosition()) {
            const newLat = marker.getPosition()?.lat();
            const newLng = marker.getPosition()?.lng();
            if (newLat && newLng) {
                updateAttribute(newLat, "lat", latAttrUpdate);
                updateAttribute(newLng, "lng", lngAttrUpdate);
            }
        }

        // store the formatted address of the location if attribute selected in modeler
        if (formattedAddressAttr) {
            try {
                // reverse geocode and do not commit
                geocodePosition(marker, formattedAddressAttr);
            } catch (e) {
                console.error(logNode + e);
            }
        }
    });
}

export function geocodePosition(marker: google.maps.Marker, formattedAddressAttr: EditableValue<string>) {
    const geocoder = new google.maps.Geocoder();

    const position = marker.getPosition();

    if (position) {
        geocoder.geocode({ location: position }, (results: any, status: any) => {
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

export function pinSymbol(color: string, symbol: string, size: string) {
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

export function pinSymbolPath(symbol: string): string {
    // define pathsymbol to be by default a marker
    let pathSymbol =
        "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0";
    switch (symbol) {
        case "CIRCLE":
            pathSymbol = "M 0, 0 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0";
            // pathSymbol =  "M 15,15 L 15,1 a 14,14 1 0,1 15,29 a 14,14 1 0,1 1,15 a 14,14 1 0,1 29,15 z";
            break;
        case "STAR":
            // pathSymbol = 'M 25,1 31,18 49,18 35,29 40,46 25,36 10,46 15,29 1,18 19,18 z';
            pathSymbol = "M 0,-15 6,2 25,2 10,13 15,30 0,20 -15,30 -10,13 -24,2 -6,2 z";
            break;
        case "CROSS":
            pathSymbol = "M -10 -20 h15 v15 h15 v15 h-15 v15 h-15 v-15 h-15 v-15 h15 z";
            break;
        case "TRIANGLE":
            pathSymbol = "M -15 15 L 15 15 L 0 -15 z";
            break;
        case "DIAMOND":
            pathSymbol = "M 0 -15 12 0 0 15 -12 0 Z";
            break;
    }

    return pathSymbol;
}

export function createSymbol(location: MarkerProps) {
    let symbol: google.maps.Symbol | string;
    if (location.iconImage && location.iconImage.value) {
        symbol = location.iconImage.value.uri;
    } else {
        symbol = pinSymbol(location.color, location.symbol, location.size);
    }
    return symbol;
}

/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import React from "react";
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { ObjectItem, EditableValue, DynamicValue, WebImage } from "mendix";
import { onDragEnd, pinSymbolPath } from "./MarkerUtils";
import { LegendEntryIconEnum } from "typings/GoogleMapsCustomMarkerProps";

export type sizeEnum = "XXS" | "XS" | "S" | "M" | "L" | "XL";

export interface Location {
    formattedAddress?: string;
    position: {
        lat: number;
        lng: number;
    };
    name: string;
}

export interface MarkerProps extends Location {
    guid: string;
    isNew: boolean;
    mxObject: ObjectItem;
    draggable: boolean;
    editable?: boolean;
    clusterer?: any;
    visible: boolean;
    iconImage?: DynamicValue<WebImage>;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    latAttrUpdate?: EditableValue<Big | string>;
    lngAttrUpdate?: EditableValue<Big | string>;
    formattedAddressAttr?: EditableValue<string>;
    url?: string;
    size?: sizeEnum;
    color?: string;
    symbol?: LegendEntryIconEnum;
    opacity?: number;
}

export interface MarkerState {
    marker: google.maps.Marker;
}

const MarkerComponent: React.FC<MarkerProps> = (props) => {
    
    const logNode = "Google Maps Custom Marker (React) widget: MarkerComponent: ";
    const sizeMap = {
        XXS: { scale: 0.333, dim: 10 },
        XS: { scale: 0.666, dim: 20 },
        S: { scale: 1, dim: 30 },
        M: { scale: 1.333, dim: 40 },
        L: { scale: 1.666, dim: 50 },
        XL: { scale: 2, dim: 60 }
    };
    
    const defaultSize = { scale: 1.333, dim: 40 };
    const { scale, dim } = sizeMap[props.size ?? "M"] || defaultSize;

    let enumBasedSymbol = false;
    let enumSymbolUri: string = "",
    path: string = "";

    if (props.iconImage && props.iconImage.value) {
        enumBasedSymbol = true;
        enumSymbolUri = props.iconImage.value.uri;
    } else {
        path = pinSymbolPath(props.symbol ?? "MARKER");
    }

    return (
        <AdvancedMarker
            key={props.guid}
            position={props.position}
            onClick={(e: google.maps.MapMouseEvent) => {
                console.debug(logNode + 'marker clicked');
                if (props.onClick) {
                    props.onClick(e);
                }
            }}
            draggable={props.draggable}
            onDragEnd={(e: google.maps.MapMouseEvent) => {
                console.dir(e);
                if (e.latLng) {
                    onDragEnd(e.latLng, props.latAttrUpdate, props.lngAttrUpdate, props.formattedAddressAttr);
                }
            }}
            >

                <div
                    title={props.name }
                >
                    {!enumBasedSymbol ? (
                    <svg
                        width={dim * 2}
                        height={dim * 2}
                        transform={`scale(${scale})`}
                        fill={props.color}
                    >
                        <path
                            d={path}
                            width={`${dim}px`}
                            height={`${dim}px`}
                            transform={`translate(${dim}, ${(3/2) * dim})`}
                        ></path>
                    </svg>) : 
                    <img
                        src={enumSymbolUri}
                    ></img>}
                </div>
        </AdvancedMarker>
    );
}

export default MarkerComponent;

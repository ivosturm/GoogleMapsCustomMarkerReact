/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import React, { createElement, useMemo, useState } from "react";
import { AdvancedMarker, AdvancedMarkerAnchorPoint } from '@vis.gl/react-google-maps';
import { ObjectItem, EditableValue, DynamicValue, WebImage } from "mendix";
import { Big } from "big.js";
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
    isSelected?: boolean;
    enableSelectedStyle?: boolean;
    selectedScalePercent?: number;
    selectedZIndexBoost?: number;
    onPositionChanged?: (guid: string, previousPosition: { lat: number; lng: number }, nextPosition: { lat: number; lng: number }) => void;
}

export interface MarkerState {
    marker: google.maps.Marker;
}

const MarkerComponent: React.FC<MarkerProps> = (props) => {

    const sizeMap = {
        XXS: { scale: 0.333, dim: 10 },
        XS: { scale: 0.666, dim: 20 },
        S: { scale: 1, dim: 30 },
        M: { scale: 1.333, dim: 40 },
        L: { scale: 1.666, dim: 50 },
        XL: { scale: 2, dim: 60 }
    };
    
    const defaultSize = { scale: 1.333, dim: 40 };
    const { dim } = sizeMap[props.size ?? "M"] || defaultSize;

    const enumBasedSymbol = Boolean(props.iconImage?.value);
    const enumSymbolUri = props.iconImage?.value?.uri || "";
    const symbol = props.symbol ?? "MARKER";
    const path = pinSymbolPath(symbol);
    const fill = props.color || "#E11D24";

    // Pin anchored at bottom tip; all other shapes centered so drag uses shape center
    const anchorPoint = !enumBasedSymbol && symbol === "MARKER"
        ? AdvancedMarkerAnchorPoint.BOTTOM_CENTER
        : AdvancedMarkerAnchorPoint.CENTER;

    // Use viewBox to map each path's natural coordinate space to the desired pixel size.
    const svgViewBox = symbol === "MARKER" ? "-10 -40 20 40"
        : symbol === "STAR"   ? "-12 -8 24 28"
        : "-15 -15 30 30";
    const svgWidth  = symbol === "MARKER" ? dim
        : symbol === "STAR"   ? Math.round(dim * 24 / 30)
        : dim;
    const svgHeight = symbol === "MARKER" ? dim * 2
        : symbol === "STAR"   ? Math.round(dim * 28 / 30)
        : dim;

    const [isHovered, setIsHovered] = useState(false);

    const selectedEnabled = Boolean(props.enableSelectedStyle);
    const isSelectedRaw = Boolean(props.isSelected);
    const isSelected = isSelectedRaw && selectedEnabled;
    const selectedScale = Math.max(1, (props.selectedScalePercent ?? 120) / 100);
    const hoverScale = isHovered ? 1.08 : 1;
    const visualScale = (isSelected ? selectedScale : 1) * hoverScale;

    const visualStyle = useMemo<React.CSSProperties>(() => {
        const baseShadow = "drop-shadow(0 1px 2px rgba(0,0,0,0.35))";
        const hoverShadow = "drop-shadow(0 0 6px rgba(59,130,246,0.65))";
        const selectedShadow = "drop-shadow(0 0 10px rgba(16,185,129,0.9))";
        return {
            transform: `scale(${visualScale})`,
            transformOrigin: symbol === "MARKER" ? "50% 100%" : "50% 50%",
            transition: "transform 120ms ease, filter 120ms ease",
            filter: isSelected ? `${baseShadow} ${selectedShadow}` : isHovered ? `${baseShadow} ${hoverShadow}` : baseShadow,
            pointerEvents: "auto"
        };
    }, [visualScale, symbol, isSelected, isHovered]);

    const zIndexBoost = Math.max(1, props.selectedZIndexBoost ?? 1000);
    const markerZIndex = isSelectedRaw ? 10000 + zIndexBoost : (isHovered ? 5000 + Math.max(1, Math.floor(zIndexBoost / 2)) : 0);

    return (
        <AdvancedMarker
            key={props.guid}
            position={props.position}
            onClick={(e: google.maps.MapMouseEvent) => {
                if (props.onClick) {
                    props.onClick(e);
                }
            }}
            draggable={props.draggable}
            anchorPoint={anchorPoint}
            zIndex={markerZIndex}
            onDragEnd={(e: google.maps.MapMouseEvent) => {
                if (e.latLng) {
                    const previousPosition = { lat: props.position.lat, lng: props.position.lng };
                    const nextPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    onDragEnd(e.latLng, props.latAttrUpdate, props.lngAttrUpdate, props.formattedAddressAttr);
                    props.onPositionChanged?.(props.guid, previousPosition, nextPosition);
                }
            }}
            >

                <div
                    title={props.name }
                    style={visualStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {!enumBasedSymbol ? (
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        viewBox={svgViewBox}
                        fill={fill}
                        opacity={props.opacity ?? 1}
                    >
                        <path d={path}></path>
                    </svg>) : 
                    <img
                        src={enumSymbolUri}
                    ></img>}
                </div>
        </AdvancedMarker>
    );
}

export default MarkerComponent;

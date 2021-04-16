/**
 * This file was generated from GoogleMapsCustomMarker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { DynamicValue, EditableValue, ListValue, ListActionValue, ListAttributeValue, WebImage } from "mendix";

export type DefaultMapTypeEnum = "ROADMAP" | "SATELLITE" | "HYBRID" | "TERRAIN";

export interface MarkerImagesType {
    enumKey: string;
    enumImage: DynamicValue<WebImage>;
}

export type LegendEntryIconEnum = "MARKER" | "CIRCLE" | "DIAMOND" | "STAR" | "CROSS" | "TRIANGLE";

export interface LegendEntriesType {
    legendEntryName: string;
    legendEntryIcon: LegendEntryIconEnum;
    legendEntryColor: string;
}

export type LineTypeEnum = "Normal" | "Dotted" | "Dashed";

export type Opt_tiltEnum = "d0" | "d45";

export interface MarkerImagesPreviewType {
    enumKey: string;
    enumImage: string;
}

export interface LegendEntriesPreviewType {
    legendEntryName: string;
    legendEntryIcon: LegendEntryIconEnum;
    legendEntryColor: string;
}

export interface GoogleMapsCustomMarkerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    apiAccessKey: string;
    defaultLat: string;
    defaultLng: string;
    defaultMapType: DefaultMapTypeEnum;
    draggableInEditMode: boolean;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    lowestZoom: number;
    markerObjects?: ListValue;
    latAttr: ListAttributeValue<BigJs.Big | string>;
    latAttrUpdate?: EditableValue<BigJs.Big | string>;
    lngAttr: ListAttributeValue<BigJs.Big>;
    lngAttrUpdate?: EditableValue<BigJs.Big>;
    formattedAddressAttrUpdate?: EditableValue<string>;
    enumAttr?: ListAttributeValue<string>;
    defaultIcon?: DynamicValue<WebImage>;
    markerImages: MarkerImagesType[];
    colorAttr?: ListAttributeValue<string>;
    opacityAttr?: ListAttributeValue<BigJs.Big>;
    markerSymbolAttr?: ListAttributeValue<string>;
    markerSizeAttr?: ListAttributeValue<string>;
    disableInfoWindow: boolean;
    infoWindowAttr?: ListAttributeValue<string>;
    infoWindowNameLabel: string;
    onClickButtonClass: string;
    onClickButtonLabel: string;
    onClick?: ListActionValue;
    enableMarkerClusterer: boolean;
    MCGridSize: number;
    MCMaxZoom: number;
    legendEnabled: boolean;
    legendHeaderText: string;
    legendEntries: LegendEntriesType[];
    searchBoxEnabled: boolean;
    searchBoxPlaceholder: string;
    searchBoxWidth: number;
    searchBoxHeight: number;
    showLines: boolean;
    lineType: LineTypeEnum;
    hideMarkers: boolean;
    lineColor: string;
    lineThickness: number;
    lineOpacity: string;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
    opt_tilt: Opt_tiltEnum;
    styleArray: string;
}

export interface GoogleMapsCustomMarkerPreviewProps {
    class: string;
    style: string;
    apiAccessKey: string;
    defaultLat: string;
    defaultLng: string;
    defaultMapType: DefaultMapTypeEnum;
    draggableInEditMode: boolean;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    lowestZoom: number | null;
    markerObjects: {} | null;
    latAttr: string;
    latAttrUpdate: string;
    lngAttr: string;
    lngAttrUpdate: string;
    formattedAddressAttrUpdate: string;
    enumAttr: string;
    defaultIcon: string;
    markerImages: MarkerImagesPreviewType[];
    colorAttr: string;
    opacityAttr: string;
    markerSymbolAttr: string;
    markerSizeAttr: string;
    disableInfoWindow: boolean;
    infoWindowAttr: string;
    infoWindowNameLabel: string;
    onClickButtonClass: string;
    onClickButtonLabel: string;
    onClick: {} | null;
    enableMarkerClusterer: boolean;
    MCGridSize: number | null;
    MCMaxZoom: number | null;
    legendEnabled: boolean;
    legendHeaderText: string;
    legendEntries: LegendEntriesPreviewType[];
    searchBoxEnabled: boolean;
    searchBoxPlaceholder: string;
    searchBoxWidth: number | null;
    searchBoxHeight: number | null;
    showLines: boolean;
    lineType: LineTypeEnum;
    hideMarkers: boolean;
    lineColor: string;
    lineThickness: number | null;
    lineOpacity: string;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
    opt_tilt: Opt_tiltEnum;
    styleArray: string;
}

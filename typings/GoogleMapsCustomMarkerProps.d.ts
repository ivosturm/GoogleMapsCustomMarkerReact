/**
 * This file was generated from GoogleMapsCustomMarker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListActionValue, ListAttributeValue, ListWidgetValue, WebImage } from "mendix";
import { Big } from "big.js";

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
    legendOnClick?: ActionValue;
}

export type LineTypeEnum = "Normal" | "Dotted" | "Dashed";

export type Opt_tiltEnum = "d0" | "d45";

export interface MarkerImagesPreviewType {
    enumKey: string;
    enumImage: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
}

export interface LegendEntriesPreviewType {
    legendEntryName: string;
    legendEntryIcon: LegendEntryIconEnum;
    legendEntryColor: string;
    legendOnClick: {} | null;
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
    latAttr?: ListAttributeValue<Big>;
    latAttrUpdate?: EditableValue<Big>;
    lngAttr?: ListAttributeValue<Big>;
    lngAttrUpdate?: EditableValue<Big>;
    formattedAddressAttrUpdate?: EditableValue<string>;
    enumAttr?: ListAttributeValue<string>;
    defaultIcon?: DynamicValue<WebImage>;
    markerImages: MarkerImagesType[];
    colorAttr?: ListAttributeValue<string>;
    opacityAttr?: ListAttributeValue<Big>;
    markerSymbolAttr?: ListAttributeValue<string>;
    markerSizeAttr?: ListAttributeValue<string>;
    infoWindowWidget?: ListWidgetValue;
    disableInfoWindow: boolean;
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
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    apiAccessKey: string;
    defaultLat: string;
    defaultLng: string;
    defaultMapType: DefaultMapTypeEnum;
    draggableInEditMode: boolean;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    lowestZoom: number | null;
    markerObjects: {} | { caption: string } | { type: string } | null;
    latAttr: string;
    latAttrUpdate: string;
    lngAttr: string;
    lngAttrUpdate: string;
    formattedAddressAttrUpdate: string;
    enumAttr: string;
    defaultIcon: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    markerImages: MarkerImagesPreviewType[];
    colorAttr: string;
    opacityAttr: string;
    markerSymbolAttr: string;
    markerSizeAttr: string;
    infoWindowWidget: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    disableInfoWindow: boolean;
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

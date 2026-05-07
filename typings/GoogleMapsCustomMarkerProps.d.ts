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

export type LineTypeEnum = "Normal" | "Dotted" | "Dashed" | "Arrow";

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
    apiKeyObjectDS: ListValue;
    apiKeyAttribute: ListAttributeValue<string>;
    mapHeight: number;
    mapWidth: number;
    mapId: string;
    defaultLat: string;
    defaultLng: string;
    defaultMapType: DefaultMapTypeEnum;
    draggableInEditMode: boolean;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    lowestZoom: number;
    markerObjects?: ListValue;
    displayNameAttr?: ListAttributeValue<string>;
    latAttr?: ListAttributeValue<Big | string>;
    latAttrUpdate?: EditableValue<Big | string>;
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
    opt_selectedmarkerstyle: boolean;
    selectedMarkerScalePercent: number;
    selectedMarkerZIndexBoost: number;
    enableMarkerClusterer: boolean;
    MCGridSize: number;
    MCMaxZoom: number;
    MCInfoWindowText: string;
    MCMediumThreshold: number;
    MCLargeThreshold: number;
    MCColorSmall: string;
    MCColorMedium: string;
    MCColorLarge: string;
    enableClusterSpiderfier: boolean;
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
    arrowRepeatSpacing: number;
    arrowSize: number;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
    opt_fullscreencontrol: boolean;
    opt_recenterbutton: boolean;
    opt_undobutton: boolean;
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
    apiKeyObjectDS: {} | { caption: string } | { type: string } | null;
    apiKeyAttribute: string;
    mapHeight: number | null;
    mapWidth: number | null;
    mapId: string;
    defaultLat: string;
    defaultLng: string;
    defaultMapType: DefaultMapTypeEnum;
    draggableInEditMode: boolean;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    lowestZoom: number | null;
    markerObjects: {} | { caption: string } | { type: string } | null;
    displayNameAttr: string;
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
    opt_selectedmarkerstyle: boolean;
    selectedMarkerScalePercent: number | null;
    selectedMarkerZIndexBoost: number | null;
    enableMarkerClusterer: boolean;
    MCGridSize: number | null;
    MCMaxZoom: number | null;
    MCInfoWindowText: string;
    MCMediumThreshold: number | null;
    MCLargeThreshold: number | null;
    MCColorSmall: string;
    MCColorMedium: string;
    MCColorLarge: string;
    enableClusterSpiderfier: boolean;
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
    arrowRepeatSpacing: number | null;
    arrowSize: number | null;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
    opt_fullscreencontrol: boolean;
    opt_recenterbutton: boolean;
    opt_undobutton: boolean;
    opt_tilt: Opt_tiltEnum;
    styleArray: string;
}

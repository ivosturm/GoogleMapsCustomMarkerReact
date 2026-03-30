/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import {
    DynamicValue,
    WebImage,
    ObjectItem,
    EditableValue,
    ListValue,
    ListActionValue,
    ListAttributeValue,
    ListWidgetValue,
    ValueStatus
} from "mendix";

import { APIProvider } from '@vis.gl/react-google-maps';

import TerraDrawLayer from './TerraDrawLayer';

import DrawingControls from "./DrawingControls";

import { isAttributeEditable, PositionProps, setLineStyleOptions } from "./MarkerUtils";
import Map from "./Map";

import {
    DefaultMapTypeEnum,
    LegendEntriesType,
    LineTypeEnum,
    MarkerImagesType
} from "../../typings/GoogleMapsCustomMarkerProps";
import { MarkerProps } from "./Marker";
import React, { Fragment, createElement } from "react";
import _ from "lodash";

import {Position} from 'geojson';

import { geocodePosition, updateAttribute } from   "./MarkerUtils";     
import { TerraDraw } from "terra-draw";

//const logNode = "Google Maps Custom Marker widget: GoogleMapsContainer component ";

export const markerColorDefault = "#E11D24";
const markerSymbolDefault = "MARKER";
const markerSizeDefault = "M";

type DataSource = "static" | "context" | "XPath" | "microflow";

const libraries = ["marker"];
const containerStyle = {
    width: "800px",
    height: "600px"
};

export interface GoogleMapsWidgetProps {
    mapWidth: number;
    mapHeight: number;
    markerObjects?: ListValue;
    latAttr?: ListAttributeValue<Big.Big | string>;
    displayNameAttr?: ListAttributeValue<string>;
    latAttrUpdate?: EditableValue<Big.Big | string>;
    lngAttr?: ListAttributeValue<Big.Big | string>;
    lngAttrUpdate?: EditableValue<Big.Big | string>;
    formattedAddressAttrUpdate?: EditableValue<string>;
    draggableInEditMode: boolean;
    colorAttr?: ListAttributeValue<string>;
    enumAttr?: ListAttributeValue<string>;
    markerImages: MarkerImagesType[];
    markerSymbolAttr?: ListAttributeValue<string>;
    markerSizeAttr?: ListAttributeValue<string>;
    opacityAttr?: ListAttributeValue<Big.Big>;
    lineTypeAttr?: ListAttributeValue<string>;
    defaultMapType: DefaultMapTypeEnum;
    apiKey: string;
    defaultLat: string;
    defaultLng: string;
    dataSource: DataSource;
    enableMarkerClusterer: boolean;
    MCGridSize: number;
    MCMaxZoom: number;
    MCInfoWindowText: string
    disableInfoWindow: boolean;
    int_onClick?: ListActionValue;
    infoWindowWidget?: ListWidgetValue;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    lowestZoom: number;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
    opt_fullscreencontrol: boolean;
    opt_tilt: string;
    styleArray: string;
    legendEnabled: boolean;
    legendHeaderText?: string;
    legendEntries?: LegendEntriesType[];
    searchBoxEnabled: boolean;
    searchBoxPlaceholder?: string;
    searchBoxWidth: number;
    searchBoxHeight: number;
    showLines: boolean;
    hideMarkers: boolean;
    lineType: LineTypeEnum;
    lineColor: string;
    lineThickness: number;
    lineOpacity: string;
}

export interface GoogleMapsContainerState {
    map: google.maps.Map;
    isLoaded: boolean;
    editable: boolean;
}

interface GoogleMapsContainerProps extends GoogleMapsWidgetProps {
    locations: MarkerProps[];
}

const logNode: string = "Google Maps Custom Marker widget: ";

const isPosition = (pos: Position | Position[] | Position[][]): pos is Position => {
    return Array.isArray(pos) && pos.length >= 2 && typeof pos[0] === 'number';
};

const onMarkerComplete = (position: Position | Position[] | Position[][], draw: TerraDraw, latAttrUpdate: EditableValue<Big.Big | string> | undefined, lngAttrUpdate: EditableValue<Big.Big | string> | undefined, formattedAddressAttrUpdate?: EditableValue<string>) => {
    console.debug(logNode + "onMarkerComplete: Position data received:", position);
    if (isPosition(position)) {
        console.debug(logNode + "onMarkerComplete: Position is a single point. Processing coordinates.");
        const lng = position[0];
        const lat = position[1];   
        if (lat && lng && latAttrUpdate && lngAttrUpdate) {
            console.debug(logNode + "onMarkerComplete: Editing enabled! Coordinates retrieved: " + lat + ", " + lng);
            updateAttribute(lat, "lat", latAttrUpdate);
            updateAttribute(lng, "lng", lngAttrUpdate);

            // store the formatted address of the location if attribute selected in modeler
            if (formattedAddressAttrUpdate) {
                // reverse geocode and do not commit
                try {
                    const latLng = new google.maps.LatLng(lat, lng);
                    geocodePosition(latLng, formattedAddressAttrUpdate);
                } catch (e) {
                    console.error(logNode + e);
                }               
            }
            draw.stop();
        } else {
            console.warn(logNode + "Latitude or longitude attribute updates are not configured. Unable to update coordinates.");
        }
    } else {
        console.warn(logNode + "Received position data is not in expected format. Unable to process coordinates.");
    }
}

export const GoogleMapsContainer = (props: GoogleMapsContainerProps) => {

    let mxObjects: ObjectItem[] = [];

    let _lineCoordinateList: PositionProps[] = [];
    let legendByIcons = false;
    let lineOptions: google.maps.PolylineOptions = {};
    
    // Initialize map dimensions
    if (props.mapWidth === 10000) {
        containerStyle.width = "100%";
    } else {
        containerStyle.width = props.mapWidth + "px";
    }
    if (props.mapHeight === 10000) {
        containerStyle.height = "100vh";
    } else {
        containerStyle.height = props.mapHeight + "px";
    }
    const datasource = props.markerObjects;
    if (!datasource || datasource.status !== ValueStatus.Available || !datasource.items) {
        return null;
    }

    let draggable = false,
    isNew = false,
    lat = Number(props.defaultLat),
    lng = Number(props.defaultLng),
    opacity = 1,
    name = "",
    icon: string,
    iconImage: DynamicValue<WebImage>,
    color: string,
    symbol: string,
    size: string,
    formattedAddress: string;

    // create locations
    // showing of infowindow is handled via state, if shown, don't recreate already existing objects
    if (datasource && datasource.items) {
        let editable = false;
        if (props.latAttrUpdate) {
            if (isAttributeEditable("latAttrUpdate", props.latAttrUpdate)) {
                editable = true;
                if (props.draggableInEditMode) {
                    draggable = true;
                    console.debug(logNode +  "marker is draggable.");
                }
            }
        }
        mxObjects = datasource.items;
        mxObjects.map(mxObject => {
            // due to bug in Mendix Pluggable Widget API, readOnly field is always true for datasource objects, hence use attribute
            /*
            draggable = /*!props.coordinatesStringAttr(mxObject).readOnly;
            editable = !props.coordinatesStringAttr(mxObject).readOnly;
            */
            if (props.latAttr && props.lngAttr){
                lat = Number(props.latAttr.get(mxObject).value);
                lng = Number(props.lngAttr.get(mxObject).value);
            }

            if (!lat) {
                isNew = true;
            }

            props.enumAttr ? (icon = String(props.enumAttr.get(mxObject).value)) : null;

            if (props.enumAttr && mxObject) {
                props.markerImages.filter(image => {
                    if (icon === image.enumKey) {
                        // add icon to marker
                        iconImage = image.enumImage;
                        // add icon as legend entry
                        legendByIcons = true;
                    }
                });
            }
            !props.enumAttr && props.markerSymbolAttr
                ? (symbol = String(props.markerSymbolAttr.get(mxObject).value))
                : markerSymbolDefault;
            props.markerSizeAttr
                ? (size = String(props.markerSizeAttr.get(mxObject).value))
                : markerSizeDefault;

            props.colorAttr ? (color = String(props.colorAttr.get(mxObject).value)) : markerColorDefault;
            props.opacityAttr ? (opacity = Number(props.opacityAttr.get(mxObject).value)) : 0;
            props.formattedAddressAttrUpdate
                ? (formattedAddress = String(props.formattedAddressAttrUpdate.value))
                : "";   

            props.displayNameAttr ? (name = String(props.displayNameAttr.get(mxObject).value)) : "Location";
            // build up internal array to being able to show a Polyline
            // through all markers if requested with showLines = true
            // exclude new markers as they could already have current location as position
            props.showLines && !isNew ? _lineCoordinateList.push({ lat, lng }) : null;

            let indexObj = -1;

            const markerObj = {
                guid: mxObject.id,
                isNew,
                mxObject,
                name,
                color,
                size,
                symbol,
                opacity,
                iconImage,
                visible: true,
                draggable,
                editable,
                position: {
                    lat,
                    lng
                },
                formattedAddress
            } as MarkerProps;

            indexObj = -1;
            props.locations.filter((location, index) => {
                if (location.guid === markerObj.guid) {
                    indexObj = index;
                }
            });
            // object exists -> remove old by index and add new
            if (indexObj > -1) {
                props.locations.splice(indexObj, 1);
            }
            props.locations.push(markerObj);
        });

        // create style options for Normal / Dotted / Dashed line between markers
        let icons: google.maps.IconSequence;

        // normal lineStyle already defined in constructor
        if (props.showLines && props.lineType !== "Normal") {
            icons = {
                icon: setLineStyleOptions(props.lineType, 2),
                offset: "0",
                repeat: "20px"
            };
            lineOptions = {
                geodesic: true,
                strokeColor: props.lineColor,
                strokeOpacity: 0,
                strokeWeight: props.lineThickness,
                icons: [icons]
            };
        } else {
            lineOptions = {
                geodesic: true,
                strokeColor: props.lineColor,
                strokeOpacity: Number(props.lineOpacity),
                strokeWeight: props.lineThickness
            };
        }
    }
const singleItemEditableMode = ((props.locations && props.locations.length === 1 && props.locations[0].isNew));
    return (
        <div style={{ height: containerStyle.height, width: containerStyle.width }} className={"googlemaps-custommarker"}>
            <APIProvider
                // 5-5-2024 Added async part. See: https://github.com/JustFly1984/react-google-maps-api/issues/3334 
                // 24-10-2024: Removed again since moved to new vis.gl/react-google-maps package
                apiKey={props.apiKey /* + "&loading=async"*/}
                libraries={libraries}
                version={'beta'}
            >
                {/* TerraDrawLayer initializes the draw instance once the map is ready. */}
                <TerraDrawLayer onMarkerComplete={(position, draw) => onMarkerComplete(position, draw, props.latAttrUpdate, props.lngAttrUpdate, props.formattedAddressAttrUpdate)}>
                {draw => (
                    <>
                    <Map
                        mapContainerStyle={containerStyle}
                        defaultLat={props.defaultLat}
                        defaultLng={props.defaultLng}
                        locations={props.locations}
                        lowestZoom={props.lowestZoom}
                        latAttrUpdate={props.latAttrUpdate}
                        lngAttrUpdate={props.lngAttrUpdate}
                        formattedAddressAttrUpdate={props.formattedAddressAttrUpdate}
                        enableMarkerClusterer={props.enableMarkerClusterer}
                        MCGridSize={props.MCGridSize}
                        MCMaxZoom={props.MCMaxZoom}
                        MCInfoWindowText={props.MCInfoWindowText}
                        int_disableInfoWindow={props.disableInfoWindow}
                        int_onClick={props.int_onClick}
                        infoWindowWidget={props.infoWindowWidget}
                        zoomToCurrentLocation={props.zoomToCurrentLocation}
                        overruleFitBoundsZoom={props.overruleFitBoundsZoom}
                        defaultMapType={props.defaultMapType}
                        opt_drag={props.opt_drag}
                        opt_mapcontrol={props.opt_mapcontrol}
                        opt_scroll={props.opt_scroll}
                        opt_streetview={props.opt_streetview}
                        opt_tilt={props.opt_tilt}
                        opt_zoomcontrol={props.opt_zoomcontrol}
                        opt_fullscreencontrol={props.opt_fullscreencontrol}
                        styleArray={props.styleArray}
                        legendEnabled={props.legendEnabled}
                        legendHeaderText={props.legendHeaderText}
                        legendIcons={props.markerImages}
                        legendByIcons={legendByIcons}
                        legendEntries={props.legendEntries}
                        searchBoxEnabled={props.searchBoxEnabled}
                        searchBoxPlaceholder={props.searchBoxPlaceholder}
                        searchBoxWidth={props.searchBoxWidth}
                        searchBoxHeight={props.searchBoxHeight}
                        showLines={props.showLines}
                        hideMarkers={props.hideMarkers}
                        lineOptions={lineOptions}
                        lineColor={props.lineColor}
                        lineThickness={props.lineThickness}
                        lineOpacity={props.lineOpacity}
                        _lineCoordinateList={_lineCoordinateList}
                    />
                    {/* Always render DrawingControls but pass editable flag */}
                    <DrawingControls 
                        draw={draw} 
                        editable={!props.latAttrUpdate?.readOnly && singleItemEditableMode} 
                    />
                            </>
                    )}
                </TerraDrawLayer>
            </APIProvider>    
        </div>
    );
}

// Wrap the component with React.memo and pass the custom comparison function
export default React.memo(GoogleMapsContainer);

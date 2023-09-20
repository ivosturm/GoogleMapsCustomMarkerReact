import { DrawingManager, GoogleMap, MarkerClusterer, Polyline } from "@react-google-maps/api";
import React, { createElement } from "react";

import ReactDOM from "react-dom";

import { ObjectItem, ListWidgetValue, EditableValue, ListActionValue } from "mendix";

import InfoWindowComponent from "./InfoWindow";
import { addMarkerDragEvent, createSymbol, geocodePosition, PositionProps, updateAttribute } from "./MarkerUtils";
import { DefaultMapTypeEnum, LegendEntriesType, MarkerImagesType } from "../../typings/GoogleMapsCustomMarkerProps";
import MarkerComponent, { MarkerProps } from "./Marker";
import Legend from "./Legend";
import SearchBox from "./SearchBox";

export interface InfoWindowStateProps {
    name: string;
    position: PositionProps;
    pixelOffset?: google.maps.Size;
    mxObject?: ObjectItem;
}

interface GoogleMapsPropsExtended {
    mapContainerStyle?: {
        width: string;
        height: string;
    };
    defaultLat: string;
    defaultLng: string;
    lowestZoom: number;
    onLoad?: (map: google.maps.Map) => void | Promise<void>;
    latAttrUpdate?: EditableValue<Big | string>;
    lngAttrUpdate?: EditableValue<Big | string>;
    formattedAddressAttrUpdate?: EditableValue<string>;
    locations?: MarkerProps[];
    enableMarkerClusterer: boolean;
    MCGridSize: number;
    MCMaxZoom: number;
    int_disableInfoWindow: boolean;
    int_onClick?: ListActionValue; 
    infoWindowWidget?: ListWidgetValue;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    defaultMapType: DefaultMapTypeEnum;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
    opt_tilt: string;
    legendEnabled: boolean;
    legendHeaderText?: string;
    legendIcons: MarkerImagesType[];
    legendByIcons: boolean;
    legendEntries?: LegendEntriesType[];
    searchBoxEnabled: boolean;
    searchBoxPlaceholder?: string;
    searchBoxWidth: number;
    searchBoxHeight: number;
    showLines: boolean;
    hideMarkers: boolean;
    lineOptions: google.maps.PolylineOptions;
    lineColor: string;
    lineThickness: number;
    lineOpacity: string;
    styleArray: string;
    _lineCoordinateList: PositionProps[];
}

interface MapState {
    map: google.maps.Map;
    drawingManager: google.maps.drawing.DrawingManager;
    isLoaded: boolean;
    center: PositionProps;
    zoom: number;
    bounds: google.maps.LatLngBounds;
    showingInfoWindow: boolean;
    infowindowObj: InfoWindowStateProps;
}

export class Map extends React.Component<GoogleMapsPropsExtended, MapState> {
    logNode: string;
    childLegend: React.RefObject<Legend>;
    childSearchBox: React.RefObject<SearchBox>;
    currentLocation: PositionProps;
    infoWindowClickRerender = false;
    constructor(props: GoogleMapsPropsExtended) {
        super(props);
        this.logNode = "Google Maps Custom Marker (React) widget: Map component ";
        this.childLegend = React.createRef();
        this.childSearchBox = React.createRef();
        this.currentLocation = {
            lat: Number(this.props.defaultLat),
            lng: Number(this.props.defaultLng)
        };
        this.state = {
            map: {} as google.maps.Map,
            drawingManager: {} as google.maps.drawing.DrawingManager,
            // this is where the center of map is going to be
            isLoaded: false,
            center: {
                lat: Number(this.props.defaultLat),
                lng: Number(this.props.defaultLng)
            },
            bounds: {} as google.maps.LatLngBounds,
            // this is how much you want to zoom in
            zoom: Number(this.props.lowestZoom),
            showingInfoWindow: false,
            infowindowObj: {} as InfoWindowStateProps
        };
        this.clickHandler = this.clickHandler.bind(this);
        this.onDMLoad = this.onDMLoad.bind(this);
        this.onMarkerComplete = this.onMarkerComplete.bind(this);
        this.handleOnGoogleApiLoaded = this.handleOnGoogleApiLoaded.bind(this);
        this.createMapOptions = this.createMapOptions.bind(this);
        this.onMapClick = this.onMapClick.bind(this);
        this.createMarkerCurrentLocation = this.createMarkerCurrentLocation.bind(this);
    }
    onDMLoad(drawingManager: google.maps.drawing.DrawingManager) {
        // add drawing manager to state so it can be accessed later on
        this.setState({ drawingManager });

        const drawingOptions = {
            drawingControl: false,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER
            }
        };
        // only add drawing manager if a poly object with empty coordinatesstring is fed
        if (this.props.locations?.length === 1 && this.props.locations[0].isNew) {
            console.debug(this.logNode + "onDMLoad: drawingMode Marker");
            const symbol = createSymbol(this.props.locations[0]);
            // add marker options
            const markerDrawingOpts = {
                drawingControl: true,
                drawingControlOptions: {
                    drawingModes: [google.maps.drawing.OverlayType.MARKER],
                    position: drawingOptions.drawingControlOptions.position
                },
                markerOptions: {
                    animation: google.maps.Animation.DROP,
                    clickable: this.props.locations[0].editable,
                    draggable: this.props.locations[0].draggable,
                    icon: symbol
                }
            };
            drawingManager.setDrawingMode(markerDrawingOpts.drawingControlOptions.drawingModes[0]);
            drawingManager.setOptions(markerDrawingOpts);
        } else {
            console.debug(this.logNode + "onDMLoad: drawingMode NONE");
            drawingManager.setOptions(drawingOptions);
        }
    }
    onMarkerComplete(marker: google.maps.Marker) {
        const latLng = marker.getPosition();
        const lat = latLng?.lat();
        const lng = latLng?.lng();
        if (lat && lng && this.props.latAttrUpdate && this.props.lngAttrUpdate) {
            console.debug(this.logNode + "completed drawing! Coordinates retrieved: " + lat + ", " + lng);
            updateAttribute(lat, "lat", this.props.latAttrUpdate);
            updateAttribute(lng, "lng", this.props.lngAttrUpdate);
            // disable drawing, only allowing one marker to be drawn
            this.state.drawingManager.setDrawingMode(null);
            this.state.drawingManager.setOptions({ drawingControl: false });

            // store the formatted address of the location if attribute selected in modeler
            if (this.props.formattedAddressAttrUpdate) {
                try {
                    // reverse geocode and do not commit
                    geocodePosition(marker, this.props.formattedAddressAttrUpdate);
                } catch (e) {
                    console.error(this.logNode + e);
                }
            }
            addMarkerDragEvent(
                marker,
                this.props.latAttrUpdate,
                this.props.lngAttrUpdate,
                this.props.formattedAddressAttrUpdate
            );
        }
    }
    clickHandler(event: any, name: string, position: PositionProps, symbol: string, mxObject?: ObjectItem) {
        // trigger infowindow functionality if enabled in interaction settings
        if (!this.props.int_disableInfoWindow && event && position) {
            // need to set this boolean to make sure map is not zooming to bounds again
            this.infoWindowClickRerender = true;
            // give a pixelOffset to make sure the infowindow is positioned just above the 30 px tall symbol
            let pixelOffset = new google.maps.Size(0, -15);
            if (symbol === "MARKER") {
                pixelOffset = new google.maps.Size(0, -30);
            }

            this.setState({
                showingInfoWindow: true,
                infowindowObj: {
                    name,
                    position,
                    mxObject,
                    pixelOffset
                }
            });
        }
        // else trigger action call directly
        else if (mxObject && this.props.int_onClick) {
            this.props.int_onClick.get(mxObject).execute();
        }
    }
    // close legend pane when clicking (not dragging) on map if opened
    onMapClick = () => {
        this.childLegend.current?.closeLegendPane();
    };
    onInfoWindowClose = () => {
        this.infoWindowClickRerender = true;
        this.setState({
            showingInfoWindow: false,
            infowindowObj: {} as InfoWindowStateProps
        });
    };
    private handleOnGoogleApiLoaded(map: google.maps.Map) {
        // store map in state, so this function can be called a second time once the API and map are already loaded
        if (!this.state.isLoaded) {
            // only intiate SearchBox once
            if (this.props.searchBoxEnabled) {
                const searchBoxReact = this.childSearchBox.current;
                const searchBoxNode = ReactDOM.findDOMNode(searchBoxReact) as HTMLInputElement;

                const searchBox = new google.maps.places.SearchBox(searchBoxNode);

                map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchBoxNode);

                // Bias the SearchBox results towards current map's viewport.
                map.addListener("bounds_changed", () => {
                    searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
                });

                // Listen for the event fired when the user selects a prediction and retrieve
                // more details for that place.
                searchBox.addListener("places_changed", () => {
                    const places = searchBox.getPlaces();

                    if (places?.length === 0) {
                        return;
                    }
                    // For each place, get the icon, name and location.
                    const bounds = new google.maps.LatLngBounds();
                    places?.forEach(place => {
                        if (!place.geometry) {
                            console.log("Returned place contains no geometry");
                            return;
                        }

                        if (place.geometry.viewport) {
                            // Only geocodes have viewport.
                            bounds.union(place.geometry.viewport);
                        } else if (place.geometry && place.geometry.location) {
                            bounds.extend(place.geometry.location);
                        }
                    });
                    map.fitBounds(bounds);
                });
            }
            // if only object is new, shouldn't have coordinates
            if (
                this.props.locations &&
                this.props.locations.length &&
                this.props.locations[0].isNew &&
                this.props.zoomToCurrentLocation
            ) {
                const location = this.props.locations[0];
                const symbol = createSymbol(location);
                this.createMarkerCurrentLocation(map, symbol);
            }

            // add map options once the google API is loaded
            const mapOptions = this.createMapOptions();
            if (this.props.styleArray !== "") {
                mapOptions.styles = JSON.parse(this.props.styleArray);
            }
            //@ts-ignore
            map.setOptions(mapOptions);

            this.setState({
                map,
                isLoaded: true
            });
        }
        const mapBounds = new google.maps.LatLngBounds();

        if (this.props.locations) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < this.props.locations.length; i++) {
                if (!this.props.locations[i].isNew) {
                    mapBounds.extend(this.props.locations[i].position);
                }
            }
        }
        const position = {
            lat: this.props.defaultLat ? Number(this.props.defaultLat) : 0,
            lng: this.props.defaultLng ? Number(this.props.defaultLng) : 0
        };

        // one existing single object
        if (this.props.locations && this.props.locations.length === 1) {
            // if only object is new, shouldn't have coordinates, hence zoom to default
            if (this.props.locations[0].isNew) {
                // in case current location is used, zoom is already triggered when adding marker
                if (!this.props.zoomToCurrentLocation) {
                    console.debug(this.logNode + "setting map to default position!");
                    map.setCenter(position);
                }
            } // if only object is not new, zoom to that position. Should have been added to bounds in loop before
            else if (!this.props.locations[0].isNew) {
                map.setCenter(mapBounds.getCenter());
            }
            // if single object, check on selected zoom overrule
            if (this.props.overruleFitBoundsZoom) {
                console.debug("overruling zoomlevel for single marker to: " + this.props.lowestZoom);
                map.setZoom(this.props.lowestZoom);
            }
        } else if (this.props.locations && this.props.locations.length > 1) {
            map.fitBounds(mapBounds);
        } else {
            map.setCenter(position);
        }
    }
    private createMapOptions() {
        // next props are exposed at maps via react-google-map library
        return {
            draggable: this.props.opt_drag,
            zoomControl: this.props.opt_zoomcontrol,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
                style: "SMALL"
            },
            mapTypeId: google.maps.MapTypeId[this.props.defaultMapType] || google.maps.MapTypeId.ROADMAP,
            mapTypeControl: this.props.opt_mapcontrol,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT
            },
            streetViewControl: this.props.opt_streetview,
            tilt: parseInt(this.props.opt_tilt.replace("d", ""), 10),
            styles: undefined
        };
    }
    createMarkerCurrentLocation(map: google.maps.Map, symbol: google.maps.Symbol | string) {
        navigator.geolocation.getCurrentPosition(
            geolocationCoordinates => {
                console.debug(
                    "current location: lat:" +
                        geolocationCoordinates.coords.latitude +
                        ", lng: " +
                        geolocationCoordinates.coords.longitude
                );
                const position = {
                    lat: geolocationCoordinates.coords.latitude,
                    lng: geolocationCoordinates.coords.longitude
                };
                // store current location in map component, to make sure it can be accessed in drawing manager as well
                this.currentLocation = position;

                const marker = new google.maps.Marker({
                    position,
                    map,
                    title: "Current Location",
                    draggable: true,
                    icon: symbol
                });
                map.setCenter(this.currentLocation);
                this.onMarkerComplete(marker);
            },
            () => {
                console.error("something went wrong with determining location");
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }
    render() {
        // if map already loaded before, calculate zoom and fitBounds again!
        console.debug(this.logNode + " rendering...");
        if (this.state.isLoaded && !this.infoWindowClickRerender) {
            this.handleOnGoogleApiLoaded(this.state.map);
        }
        // if render was triggered for showing infowindow only, reset again for next rerender!
        this.infoWindowClickRerender = false;

        return (
            <div id="GoogleMapWrapper">
                <GoogleMap
                    mapContainerStyle={this.props.mapContainerStyle}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    onLoad={(map: google.maps.Map) => {
                        this.handleOnGoogleApiLoaded(map);
                    }}
                    onClick={this.onMapClick}
                >
                    {this.props.legendEnabled && (
                        <Legend
                            ref={this.childLegend}
                            title={this.props.legendHeaderText}
                            legendByIcons={this.props.legendByIcons}
                            legendIcons={this.props.legendIcons}
                            legendEntries={this.props.legendEntries}
                        ></Legend>
                    )}
                    {this.props.searchBoxEnabled && (
                        <SearchBox
                            ref={this.childSearchBox}
                            placeholder={this.props.searchBoxPlaceholder}
                            height={this.props.searchBoxHeight}
                            width={this.props.searchBoxWidth}
                        ></SearchBox>
                    )}
                    <DrawingManager onLoad={this.onDMLoad} onMarkerComplete={this.onMarkerComplete} />
                    {this.state.showingInfoWindow && (
                        <InfoWindowComponent
                            onCloseClick={this.onInfoWindowClose}
                            name={this.state.infowindowObj.name}
                            position={this.state.infowindowObj.position}
                            pixelOffset={this.state.infowindowObj.pixelOffset}
                            infoWindowWidget={this.props.infoWindowWidget}
                            mxObject={this.state.infowindowObj.mxObject || ({} as ObjectItem)}
                        ></InfoWindowComponent>
                    )}
                    {this.props.enableMarkerClusterer ? (
                        <MarkerClusterer gridSize={this.props.MCMaxZoom} maxZoom={this.props.MCMaxZoom} zoomOnClick>
                            {(clusterer) => (
                                <div>
                                    {
                                    this.props.locations?.map(location =>
                                    !location.isNew && !(this.props.hideMarkers && this.props.showLines) ? (
                                        <MarkerComponent
                                            isNew={false}
                                            key={"marker_" + location.guid}
                                            name={location.name}
                                            position={location.position}
                                            clusterer={clusterer}
                                            onClick={(event: any) =>
                                                this.clickHandler(
                                                    event,
                                                    location.name,
                                                    location.position,
                                                    location.symbol,
                                                    location.mxObject
                                                )
                                            }
                                            guid={location.guid}
                                            mxObject={location.mxObject}
                                            color={location.color}
                                            iconImage={location.iconImage}
                                            symbol={location.symbol}
                                            size={location.size}
                                            opacity={location.opacity}
                                            visible={location.visible}
                                            editable={location.editable}
                                            draggable={location.draggable}
                                            latAttrUpdate={this.props.latAttrUpdate}
                                            lngAttrUpdate={this.props.lngAttrUpdate}
                                            formattedAddressAttr={this.props.formattedAddressAttrUpdate}
                                        />
                                    ) : null
                                )}
                                </div>
                              )}
                        </MarkerClusterer>
                    ) : (
                        this.props.locations?.map(location =>
                            !location.isNew && !(this.props.hideMarkers && this.props.showLines) ? (
                                <MarkerComponent
                                    isNew={false}
                                    key={"marker_" + location.guid}
                                    name={location.name}
                                    position={location.position}
                                    onClick={(event: any) =>
                                        this.clickHandler(
                                            event,
                                            location.name,
                                            location.position,
                                            location.symbol,
                                            location.mxObject
                                        )
                                    }
                                    guid={location.guid}
                                    mxObject={location.mxObject}
                                    color={location.color}
                                    iconImage={location.iconImage}
                                    symbol={location.symbol}
                                    size={location.size}
                                    opacity={location.opacity}
                                    visible={location.visible}
                                    editable={location.editable}
                                    draggable={location.draggable}
                                    latAttrUpdate={this.props.latAttrUpdate}
                                    lngAttrUpdate={this.props.lngAttrUpdate}
                                    formattedAddressAttr={this.props.formattedAddressAttrUpdate}
                                />
                            ) : null
                        )
                    )}

                    {this.props.showLines ? (
                        <Polyline path={this.props._lineCoordinateList} options={this.props.lineOptions}></Polyline>
                    ) : null}
                </GoogleMap>
            </div>
        );
    }
}

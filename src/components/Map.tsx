import { ControlPosition, Map as GoogleMap, InfoWindow, useApiIsLoaded, useMap  } from '@vis.gl/react-google-maps';
import { useDrawingManager } from './DrawingManager';
import React, { useCallback, useEffect, useState, useRef } from "react";
import { ObjectItem, ListWidgetValue, EditableValue, ListActionValue } from "mendix";

import InfoWindowComponent from "./InfoWindow";
import { InfoWindowContent } from "./InfoWindowContent";
import { geocodePosition, PositionProps, updateAttribute } from   "./MarkerUtils";                                                        
import { DefaultMapTypeEnum, LegendEntriesType, MarkerImagesType } from "../../typings/GoogleMapsCustomMarkerProps";
import MarkerComponent, { MarkerProps } from "./Marker";
import Legend from "./Legend";
import { Polyline } from './Polyline';
import { ClusteredMarkers } from './ClusteredMarkers';
import { Feature, FeatureCollection, Point } from 'geojson';

import { isEqual } from "lodash"; // You can use lodash for deep comparison
import MapHandler from './MapHandler';
import { CustomMapControl } from './MapControl';

export interface InfoWindowStateProps {
    name: string;
    position: PositionProps;
    pixelOffset?: [number, number];
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
    MCInfoWindowText: string;
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
    center: PositionProps;
    zoom: number;
    bounds: google.maps.LatLngBounds;
    showingInfoWindow: boolean;
    infowindowObj: InfoWindowStateProps;
}

const Map: React.FC<GoogleMapsPropsExtended> = (props) => {
    const logNode: string = "Google Maps Custom Marker (React) widget: Map component ";
    const childLegend = React.useRef<Legend>(null);
    let currentLocation: PositionProps;

    const prevLocationsRef = useRef<MarkerProps[]>([]);

    const locationsChanged = (prevLocations: typeof props.locations, newLocations: typeof props.locations) => {
        if (!prevLocations || prevLocations.length !== (newLocations?.length ?? 0)) {
            return true;
        }
        const prevGuids = prevLocations.map(loc => loc.guid).sort();
        const newGuids = (newLocations ?? []).map(loc => loc.guid).sort();
        return !isEqual(prevGuids, newGuids);
    };

    const isLoaded = useApiIsLoaded();
    const map = useMap();

    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

    const handleSearchBoxMounted = useCallback((searchBox: google.maps.places.SearchBox) => {  
        console.debug(logNode + "searchbox mounted!");   
        // Bias the Search
        map?.addListener("bounds_changed", () => {
            searchBox?.setBounds(map.getBounds() as google.maps.LatLngBounds);
        });

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox?.addListener("places_changed", () => {
            console.debug(logNode + "searchbox places changed!");
            const places = searchBox.getPlaces();

            if (places?.length === 0) {
                return;
            }
            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places?.forEach((place: google.maps.places.PlaceResult) => {
                if (!place.geometry) {
                    console.debug(logNode + "returned place contains no geometry");
                    return;
                }

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else if (place.geometry && place.geometry.location) {
                    bounds.extend(place.geometry.location);
                }
            });
            map?.fitBounds(bounds);
        });
    }, [map, setSelectedPlace]);

    const [state, setState] = useState<MapState>({
        center: {
            lat: Number(props.defaultLat),
            lng: Number(props.defaultLng)
        },
        zoom: props.lowestZoom,
        bounds: {} as google.maps.LatLngBounds,
        showingInfoWindow: false,
        infowindowObj: {} as InfoWindowStateProps
    });

    const [, setNumClusters] = useState(0);

    const [infowindowData, setInfowindowData] = useState<{
        anchor: google.maps.Marker;
        features: Feature<Point>[];
      } | null>(null);
    
    const handleInfoWindowClose = useCallback(
    () => setInfowindowData(null),
    [setInfowindowData]
    );

    useEffect(() => {
        if (isLoaded && map) {
            const prevLocations = prevLocationsRef.current;
            if (locationsChanged(prevLocations, props.locations)) {
                // Reload or update the map
                // Your map update logic here
                console.debug(logNode + "locations changed, calling handleOnGoogleApiLoaded");
                if (state.showingInfoWindow){
                    console.debug(logNode + "closing infowindow...");
                    onInfoWindowClose();
                }
                handleOnGoogleApiLoaded(map)
                // if only object is new, shouldn't have coordinates

;
            } else {
                console.debug(logNode + "locations did not change, no update needed.");
            }
            prevLocationsRef.current = props.locations ?? [];
        }
    }, [isLoaded, map, props.locations]);

    const onMarkerComplete = (marker: google.maps.Marker) => {
        const latLng = marker.getPosition();
        const lat = latLng?.lat();
        const lng = latLng?.lng();
        if (lat && lng && props.latAttrUpdate && props.lngAttrUpdate) {
            console.debug(logNode + "completed drawing! Coordinates retrieved: " + lat + ", " + lng);
            updateAttribute(lat, "lat", props.latAttrUpdate);
            updateAttribute(lng, "lng", props.lngAttrUpdate);

            // store the formatted address of the location if attribute selected in modeler
            if (props.formattedAddressAttrUpdate && latLng) {
                // reverse geocode and do not commit
                try {
                    geocodePosition(latLng, props.formattedAddressAttrUpdate);
                } catch (e) {
                    console.error(logNode + e);
                }               
            }
        }
    }
    function clickHandler(event: any, location: MarkerProps) {
        const name = location.name
        const position = location.position; 
        let pixelOffset: [number, number] = [0, -40];

        // adjust vertical offset to above marker depending on size/scale
        switch (location.size) {
            case "L":
                pixelOffset[1] = -40;
                break;
            case "M":
                pixelOffset[1] = -35;
                break;
            case "S":
                pixelOffset[1] = -30;
                break;
            case "XS":
                pixelOffset[1] = -25;
                break;
            case "XXS":
                pixelOffset[1] = -20
                break;
        }
            
        const mxObject = location.mxObject;
        // trigger infowindow functionality if enabled in interaction settings

        if (!props.int_disableInfoWindow && event && location.position) {
            console.debug(logNode + "clickHandler will start showing infowindow!");
            setState(prevState => ({
                            ...prevState,
                            showingInfoWindow: true,
                            infowindowObj: {
                                name,
                                position,
                                mxObject,
                                pixelOffset // or any other appropriate value
                            }
                        }));
        }
        // else trigger action call directly
        else if (mxObject && props.int_onClick) {
            console.debug(logNode + "clickHandler will trigger action call directly without infowindow!");
            props.int_onClick.get(mxObject).execute();
        } else if (props.int_onClick) {
            console.debug(logNode + "clickHandler will not do anything, no mxObject found!");
        }
    }
    // close legend pane when clicking (not dragging) on map if opened
    const onMapClick = () => {
        childLegend.current?.closeLegendPane();
        setInfowindowData(null);
    };
    const onInfoWindowClose = () => {
        setState(prevState => ({
                    ...prevState,
                    showingInfoWindow: false,
                    infowindowObj: {} as InfoWindowStateProps
                }));
    };
    const handleOnGoogleApiLoaded = (map: google.maps.Map) => {
        console.debug(logNode + "handleOnGoogleApiLoaded called! with isLoaded: " + isLoaded);
        // store map in state, so this function can be called a second time once the API and map are already loaded
        if (isLoaded) {
            if (
                props.locations &&
                props.locations.length &&
                props.locations[0].isNew &&
                props.zoomToCurrentLocation
            ) {
                zoomToCurrentLocation(map);
            }
        }
        const mapBounds = new google.maps.LatLngBounds();

        if (props.locations) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < props.locations.length; i++) {
                if (!props.locations[i].isNew) {
                    mapBounds.extend(props.locations[i].position);
                }
            }
        }
        const position = {
            lat: props.defaultLat ? Number(props.defaultLat) : 0,
            lng: props.defaultLng ? Number(props.defaultLng) : 0
        };

        // one existing single object
        if (props.locations && props.locations.length === 1) {
            // if only object is new, shouldn't have coordinates, hence zoom to default
            if (props.locations[0].isNew) {
                // in case current location is used, zoom is already triggered when adding marker
                if (!props.zoomToCurrentLocation) {
                    console.debug(logNode + "setting map to default position!");
                    map.setCenter(position);
                }
            } // if only object is not new, zoom to that position. Should have been added to bounds in loop before
            else if (!props.locations[0].isNew) {
                map.setCenter(mapBounds.getCenter());
            }
            // if single object, check on selected zoom overrule
            if (props.overruleFitBoundsZoom) {
                console.debug(logNode + "overruling zoomlevel for single marker to: " + props.lowestZoom);
                map.setZoom(props.lowestZoom);
            }
        } else if (props.locations && props.locations.length > 1) {
            map.fitBounds(mapBounds);
        } else {
            map.setCenter(position);
        }
    }

    const zoomToCurrentLocation = (map: google.maps.Map) => {
        navigator.geolocation.getCurrentPosition(
            geolocationCoordinates => {
                console.debug(
                    logNode + "current location: lat:" +
                        geolocationCoordinates.coords.latitude +
                        ", lng: " +
                        geolocationCoordinates.coords.longitude
                );
                const position = {
                    lat: geolocationCoordinates.coords.latitude,
                    lng: geolocationCoordinates.coords.longitude
                };
                // store current location in map component, to make sure it can be accessed in drawing manager as well
                currentLocation = position;

                map.setCenter(currentLocation);
            },
            (e) => {
                //@ts-ignore
                mx.ui.error("something went wrong with determining location: " + e.message, { modal: false });
                console.error(logNode + "something went wrong with determining location", e);
                
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }

        // Create the GeoJSON object
        const geojson: FeatureCollection<Point> = {
            type: 'FeatureCollection',
            features: props.locations
                ? props.locations
                    .filter(location => !location.isNew && !(props.hideMarkers && props.showLines))
                    .map(location => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [location.position.lng, location.position.lat]
                        },
                        properties: {
                            isNew: false,
                            key: "marker_" + location.guid,
                            name: location.name,
                            position: location.position,
                            iconImage: location.iconImage,
                            symbol: location.symbol,
                            color: location.color,
                            size: location.size,
                            onClick: (event: google.maps.MapMouseEvent) => {
                                console.debug(logNode + "triggering clickHandler from marker clustering!");
                                clickHandler(
                                    event,
                                    location
                                )
                            },
                            guid: location.guid,
                            mxObject: location.mxObject,
                            visible: location.visible
                        }
                    }))
                : []
        };
        //if (map && isLoaded){
            // if map already loaded before, calculate zoom and fitBounds again!
            useDrawingManager(
                null,
                props.locations,
                onMarkerComplete
            );
        //}
        return (
            <>
                {isLoaded ? (
                    <><GoogleMap
                        mapId={'DEMO_MAP_ID'} // advanced markers need this feature. 
                        defaultCenter={Object.keys(state.bounds).length === 0 ? state.center : { lat: state.bounds.getCenter().lat(), lng: state.bounds.getCenter().lng() }}
                        defaultZoom={state.zoom}
                        zoomControl={props.opt_zoomcontrol}
                        zoomControlOptions={{
                            position: google.maps.ControlPosition.RIGHT_CENTER
                        }}
                        scrollwheel={props.opt_scroll}
                        streetViewControl={props.opt_streetview}
                        gestureHandling={"greedy"}
                        mapTypeId={google.maps.MapTypeId[props.defaultMapType as keyof typeof google.maps.MapTypeId] || google.maps.MapTypeId.ROADMAP}
                        mapTypeControl={props.opt_mapcontrol}
                        mapTypeControlOptions={{
                            position: google.maps.ControlPosition.TOP_LEFT
                        }}
                        tilt={parseInt(props.opt_tilt.replace("d", ""), 10)}
                        disableDefaultUI={true}
                        onClick={onMapClick}
                        onZoomChanged={onMapClick}

                    >
                        {infowindowData && (
                            <InfoWindow
                                onCloseClick={handleInfoWindowClose}
                                anchor={infowindowData.anchor}>
                                <InfoWindowContent features={infowindowData.features}
                                    text={props.MCInfoWindowText} 
                                />
                            </InfoWindow>
                        )}
                        {props.legendEnabled && (
                            <Legend
                                ref={childLegend}
                                title={props.legendHeaderText}
                                legendByIcons={props.legendByIcons}
                                legendIcons={props.legendIcons}
                                legendEntries={props.legendEntries}
                            ></Legend>
                        )}
                        {state.showingInfoWindow && (
                            <InfoWindowComponent
                                onCloseClick={onInfoWindowClose}
                                name={state.infowindowObj.name}
                                position={state.infowindowObj.position}
                                pixelOffset={state.infowindowObj.pixelOffset}
                                infoWindowWidget={props.infoWindowWidget}
                                mxObject={state.infowindowObj.mxObject || ({} as ObjectItem)}
                            ></InfoWindowComponent>
                        )}
                        {props.enableMarkerClusterer ? (
                            <ClusteredMarkers geojson={geojson} setNumClusters={setNumClusters} setInfowindowData={setInfowindowData} />
                        ) : (
                            props.locations?.map(location => !location.isNew && !(props.hideMarkers && props.showLines) ? (
                                <MarkerComponent
                                    isNew={false}
                                    key={"marker_" + location.guid}
                                    name={location.name}
                                    position={location.position}
                                    iconImage={location.iconImage}
                                    onClick={(e: google.maps.MapMouseEvent) => {
                                        console.debug(logNode + "triggering clickHandler!");
                                        clickHandler(e, location);
                                    } }
                                    guid={location.guid}
                                    mxObject={location.mxObject}
                                    visible={location.visible}
                                    editable={location.editable}
                                    draggable={location.draggable}
                                    latAttrUpdate={props.latAttrUpdate}
                                    lngAttrUpdate={props.lngAttrUpdate}
                                    formattedAddressAttr={props.formattedAddressAttrUpdate}
                                    symbol={location.symbol}
                                    color={location.color}
                                    size={location.size}
                                    opacity={location.opacity} />
                            ) : null
                            )
                        )}

                        {props.showLines ? (
                            <Polyline
                                path={props._lineCoordinateList}
                                geodesic={props.lineOptions.geodesic}
                                strokeColor={props.lineOptions.strokeColor}
                                strokeOpacity={props.lineOptions.strokeOpacity}
                                strokeWeight={props.lineOptions.strokeWeight}
                                icons={props.lineOptions.icons ? props.lineOptions.icons.filter((icon): icon is google.maps.IconSequence => icon.icon != null) : []} />
                        ) : null}
                        {props.searchBoxEnabled && (
                            <>
                                <CustomMapControl
                                    controlPosition={ControlPosition.TOP}
                                    onPlaceSelect={setSelectedPlace}
                                    onSearchBoxMounted={handleSearchBoxMounted}
                                    center={state.center}
                                    placeholder={props.searchBoxPlaceholder}
                                />
                                <MapHandler place={selectedPlace} />
                            </>
                        )}
                    </GoogleMap>
                    </>
                    ) : (
                        <div className="spinner" />
                    )}

        </>
    );
};
// Custom comparison function
const areEqual = (prevProps: GoogleMapsPropsExtended, nextProps: GoogleMapsPropsExtended) => {
    if (!prevProps.locations || !nextProps.locations || prevProps.locations.length !== nextProps.locations.length) {
        console.debug("areEqual: false");
        return false;
    }

    for (let i = 0; i < prevProps.locations.length; i++) {
        if (prevProps.locations[i].guid !== nextProps.locations[i].guid) {
            console.debug("areEqual: false");
            return false;
        }
    }
    console.debug("areEqual: true")
    return true;
};
// Wrap the component with React.memo and pass the custom comparison function
export default React.memo(Map, areEqual);

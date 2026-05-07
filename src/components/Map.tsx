/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore TS6133
import { Map as GoogleMapComponent, InfoWindow, useApiIsLoaded, useMap  } from '@vis.gl/react-google-maps';
// @ts-ignore TS6133
import { Fragment, createElement, useCallback, useEffect, useState, useRef } from "react";
import { ObjectItem, ListWidgetValue, EditableValue, ListActionValue } from "mendix";

// @ts-ignore TS6133
import InfoWindowComponent from "./InfoWindow";
// @ts-ignore TS6133
import { InfoWindowContent } from "./InfoWindowContent";
import { PositionProps } from   "./MarkerUtils";                                                        
import { DefaultMapTypeEnum, LegendEntriesType, MarkerImagesType } from "../../typings/GoogleMapsCustomMarkerProps";
// @ts-ignore TS6133
import MarkerComponent, { MarkerProps } from "./Marker";
// @ts-ignore TS6133
import Legend from "./Legend";
// @ts-ignore TS6133
import { Polyline } from './Polyline';
// @ts-ignore TS6133
import { ClusteredMarkers } from './ClusteredMarkers';
import { Feature, FeatureCollection, Point } from 'geojson';

import { isEqual } from "lodash"; // You can use lodash for deep comparison
// @ts-ignore TS6133
import MapHandler from './MapHandler';
// @ts-ignore TS6133
import { ActionButtonsMapControl, CustomMapControl } from './MapControl';
import { updateAttribute } from "./MarkerUtils";

interface MarkerUndoEntry {
    guid: string;
    previousPosition: PositionProps;
    nextPosition: PositionProps;
}

export interface InfoWindowStateProps {
    name: string;
    position: PositionProps;
    pixelOffset?: [number, number];
    mxObject?: ObjectItem;
}

const INFO_WINDOW_Z_INDEX = 2000000;

const getMarkerInfoWindowPixelOffset = (symbol?: MarkerProps["symbol"], size?: MarkerProps["size"]): [number, number] | undefined => {
    const dims: Record<NonNullable<MarkerProps["size"]>, number> = {
        XXS: 10,
        XS: 20,
        S: 30,
        M: 40,
        L: 50,
        XL: 60
    };
    const dim = dims[size ?? "M"];
    if (symbol === "MARKER") {
        return [0, -dim * 2];
    }
    if (symbol === "STAR") {
        return [0, -Math.round(dim * 14 / 30)];
    }
    return [0, -Math.round(dim / 2)];
};

const getOpenInfoWindowPixelOffset = (
    infowindowObj: InfoWindowStateProps,
    locations?: MarkerProps[]
): [number, number] | undefined => {
    const openGuid = infowindowObj.mxObject?.id;
    if (!openGuid) {
        return infowindowObj.pixelOffset;
    }
    const currentMarker = locations?.find(location => location.guid === openGuid);
    if (!currentMarker) {
        return infowindowObj.pixelOffset;
    }
    return getMarkerInfoWindowPixelOffset(currentMarker.symbol, currentMarker.size);
};

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
    enableClusterSpiderfier: boolean;
    MCGridSize: number;
    MCMaxZoom: number;
    MCInfoWindowText: string;
    MCMediumThreshold: number;
    MCLargeThreshold: number;
    MCColorSmall: string;
    MCColorMedium: string;
    MCColorLarge: string;
    int_disableInfoWindow: boolean;
    int_onClick?: ListActionValue; 
    infoWindowWidget?: ListWidgetValue;
    opt_selectedmarkerstyle: boolean;
    selectedMarkerScalePercent: number;
    selectedMarkerZIndexBoost: number;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    defaultMapType: DefaultMapTypeEnum;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
    opt_fullscreencontrol: boolean;
    opt_recenterbutton: boolean;
    opt_undobutton: boolean;
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
    const childLegend = useRef<Legend>(null);
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
    const [selectedMarkerGuid, setSelectedMarkerGuid] = useState<string | null>(null);
    const lastMarkerClickTsRef = useRef<number>(0);
    const [hasBeenDragged, setHasBeenDragged] = useState(false);
    const hasBeenDraggedRef = useRef(false);
    const initialCenterRef = useRef<{ lat: number; lng: number } | null>(null);
    const initialZoomRef = useRef<number | null>(null);
    const [undoStepCount, setUndoStepCount] = useState(0);
    const [redoStepCount, setRedoStepCount] = useState(0);
    const undoStackRef = useRef<MarkerUndoEntry[]>([]);
    const redoStackRef = useRef<MarkerUndoEntry[]>([]);
    const [positionOverrides, setPositionOverrides] = useState<Record<string, PositionProps>>({});
    const mapInitializedRef = useRef(false);

    useEffect(() => {
        if (!map || mapInitializedRef.current) {
            return;
        }
        mapInitializedRef.current = true;
        hasBeenDraggedRef.current = false;
        setHasBeenDragged(false);
        initialCenterRef.current = null;
        initialZoomRef.current = null;
        undoStackRef.current = [];
        redoStackRef.current = [];
        setUndoStepCount(0);
        setRedoStepCount(0);
        setPositionOverrides({});
    }, [map]);

    const applyMarkerPosition = useCallback((guid: string, position: PositionProps) => {
        setPositionOverrides(prev => ({ ...prev, [guid]: position }));
        if (props.latAttrUpdate && props.lngAttrUpdate) {
            updateAttribute(position.lat, "lat", props.latAttrUpdate);
            updateAttribute(position.lng, "lng", props.lngAttrUpdate);
        }
    }, [props.latAttrUpdate, props.lngAttrUpdate]);

    const handleMarkerPositionChanged = useCallback((guid: string, previousPosition: PositionProps, nextPosition: PositionProps) => {
        const unchanged = previousPosition.lat === nextPosition.lat && previousPosition.lng === nextPosition.lng;
        if (unchanged) {
            return;
        }

        undoStackRef.current.push({ guid, previousPosition, nextPosition });
        if (undoStackRef.current.length > 50) {
            undoStackRef.current.shift();
        }
        setUndoStepCount(undoStackRef.current.length);

        redoStackRef.current = [];
        setRedoStepCount(0);

        setPositionOverrides(prev => ({ ...prev, [guid]: nextPosition }));
    }, []);

    const handleUndoLastMarkerEdit = useCallback(() => {
        const entry = undoStackRef.current.pop();
        setUndoStepCount(undoStackRef.current.length);
        if (!entry) {
            return;
        }

        redoStackRef.current.push(entry);
        if (redoStackRef.current.length > 50) {
            redoStackRef.current.shift();
        }
        setRedoStepCount(redoStackRef.current.length);

        applyMarkerPosition(entry.guid, entry.previousPosition);
    }, [applyMarkerPosition]);

    const handleRedoLastMarkerEdit = useCallback(() => {
        const entry = redoStackRef.current.pop();
        setRedoStepCount(redoStackRef.current.length);
        if (!entry) {
            return;
        }

        undoStackRef.current.push(entry);
        if (undoStackRef.current.length > 50) {
            undoStackRef.current.shift();
        }
        setUndoStepCount(undoStackRef.current.length);

        applyMarkerPosition(entry.guid, entry.nextPosition);
    }, [applyMarkerPosition]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isModKey = event.ctrlKey || event.metaKey;
            const key = event.key.toLowerCase();

            if (!isModKey || !props.opt_undobutton || !props.latAttrUpdate || !props.lngAttrUpdate) {
                return;
            }

            if ((key === "y" || (key === "z" && event.shiftKey)) && redoStackRef.current.length > 0) {
                event.preventDefault();
                handleRedoLastMarkerEdit();
                return;
            }

            if (key === "z" && undoStackRef.current.length > 0) {
                event.preventDefault();
                handleUndoLastMarkerEdit();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [props.opt_undobutton, props.latAttrUpdate, props.lngAttrUpdate, handleUndoLastMarkerEdit, handleRedoLastMarkerEdit]);

    useEffect(() => {
        if (!map || !isLoaded) {
            return;
        }

        const dragEndListener = map.addListener("dragend", () => {
            hasBeenDraggedRef.current = true;
            setHasBeenDragged(true);
        });

        return () => {
            google.maps.event.removeListener(dragEndListener);
        };
    }, [map, isLoaded]);

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
                handleOnGoogleApiLoaded(map);
                // if only object is new, shouldn't have coordinates
            } else {
                console.debug(logNode + "locations did not change, no update needed.");
            }
            prevLocationsRef.current = props.locations ?? [];
        }
    }, [isLoaded, map, props.locations]);


    function clickHandler(event: any, location: MarkerProps) {
        lastMarkerClickTsRef.current = Date.now();

        // Prevent map click handler from firing when a marker is clicked.
        // Otherwise selection is immediately cleared again.
        if (event?.domEvent?.stopPropagation) {
            event.domEvent.stopPropagation();
        }
        if (event?.domEvent?.preventDefault) {
            event.domEvent.preventDefault();
        }

        const name = location.name
        const position = location.position; 
        const pixelOffset = getMarkerInfoWindowPixelOffset(location.symbol, location.size);
        setSelectedMarkerGuid(location.guid);
            
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
        // Some marker clicks still trigger a subsequent map click in certain browser/Maps event paths.
        // Ignore very recent map clicks so marker selection is not immediately cleared.
        if (Date.now() - lastMarkerClickTsRef.current < 250) {
            return;
        }

        childLegend.current?.closeLegendPane();
        setInfowindowData(null);
        setSelectedMarkerGuid(null);
    };
    const onInfoWindowClose = () => {
        setState(prevState => ({
                    ...prevState,
                    showingInfoWindow: false,
                    infowindowObj: {} as InfoWindowStateProps
                }));
    };

    const onRecenterMap = useCallback(() => {
        if (!map || !initialCenterRef.current || initialZoomRef.current === null) {
            return;
        }
        map.setCenter(initialCenterRef.current);
        map.setZoom(initialZoomRef.current);
        hasBeenDraggedRef.current = false;
        setHasBeenDragged(false);
    }, [map]);

    const captureInitialMapState = useCallback((targetMap: google.maps.Map) => {
        if (hasBeenDraggedRef.current) {
            return;
        }
        const center = targetMap.getCenter();
        const zoom = targetMap.getZoom();
        if (center && zoom !== undefined && zoom !== null) {
            initialCenterRef.current = { lat: center.lat(), lng: center.lng() };
            initialZoomRef.current = zoom;
            hasBeenDraggedRef.current = false;
            setHasBeenDragged(false);
        }
    }, []);

    useEffect(() => {
        if (!map || !isLoaded) {
            return;
        }

        // Always capture baseline center/zoom after map settles, even when
        // handleOnGoogleApiLoaded is not triggered by datasource changes.
        const idleListener = google.maps.event.addListenerOnce(map, "idle", () => {
            captureInitialMapState(map);
        });

        return () => {
            google.maps.event.removeListener(idleListener);
        };
    }, [map, isLoaded, captureInitialMapState, props.locations, props.defaultLat, props.defaultLng, props.lowestZoom]);

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

        // Capture immediately when possible and again on idle for fitBounds/asynchronous zoom updates.
        captureInitialMapState(map);
        google.maps.event.addListenerOnce(map, "idle", () => captureInitialMapState(map));
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

        const visibleLocations = props.locations
            ? props.locations
                .filter(location => !location.isNew && !(props.hideMarkers && props.showLines))
                .map(location => {
                    const overriddenPosition = positionOverrides[location.guid];
                    return overriddenPosition
                        ? { ...location, position: overriddenPosition }
                        : location;
                })
            : [];

        const orderedVisibleLocations = [...visibleLocations].sort((a, b) => {
            const aSelected = a.guid === selectedMarkerGuid ? 1 : 0;
            const bSelected = b.guid === selectedMarkerGuid ? 1 : 0;
            return aSelected - bSelected;
        });

        // Create the GeoJSON object
        const geojson: FeatureCollection<Point> = {
            type: 'FeatureCollection',
            features: visibleLocations
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
        };
        return (
            <>
                {isLoaded ? (
                    <><GoogleMapComponent
                        mapId={'DEMO_MAP_ID'} // advanced markers need this feature. 
                        style={props.mapContainerStyle}
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
                        fullscreenControl={props.opt_fullscreencontrol}


                    >
                        {infowindowData && (
                            <InfoWindow
                                onCloseClick={handleInfoWindowClose}
                                anchor={infowindowData.anchor}
                                zIndex={INFO_WINDOW_Z_INDEX}>
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
                                pixelOffset={getOpenInfoWindowPixelOffset(state.infowindowObj, props.locations)}
                                infoWindowWidget={props.infoWindowWidget}
                                mxObject={state.infowindowObj.mxObject || ({} as ObjectItem)}
                                zIndex={INFO_WINDOW_Z_INDEX}
                            ></InfoWindowComponent>
                        )}
                        {props.enableMarkerClusterer ? (
                            <ClusteredMarkers 
                                geojson={geojson} 
                                radius={props.MCGridSize}
                                maxZoom={props.MCMaxZoom}
                                mediumThreshold={props.MCMediumThreshold}
                                largeThreshold={props.MCLargeThreshold}
                                colorSmall={props.MCColorSmall}
                                colorMedium={props.MCColorMedium}
                                colorLarge={props.MCColorLarge}
                                enableSpiderfier={props.enableClusterSpiderfier}
                                selectedMarkerGuid={selectedMarkerGuid}
                                enableSelectedStyle={props.opt_selectedmarkerstyle}
                                selectedScalePercent={props.selectedMarkerScalePercent}
                                selectedZIndexBoost={props.selectedMarkerZIndexBoost}
                            />
                        ) : (
                            orderedVisibleLocations.map(location => (
                                <MarkerComponent
                                    isNew={false}
                                    key={[
                                        "marker",
                                        location.guid,
                                        location.symbol ?? "MARKER",
                                        location.size ?? "M",
                                        location.color ?? "",
                                        location.iconImage?.value?.uri ?? ""
                                    ].join("_")}
                                    name={location.name}
                                    position={location.position}
                                    iconImage={location.iconImage}
                                    onClick={(e: google.maps.MapMouseEvent) => {
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
                                    isSelected={selectedMarkerGuid === location.guid}
                                    enableSelectedStyle={props.opt_selectedmarkerstyle}
                                    selectedScalePercent={props.selectedMarkerScalePercent}
                                    opacity={location.opacity}
                                    selectedZIndexBoost={props.selectedMarkerZIndexBoost}
                                    onPositionChanged={handleMarkerPositionChanged}
                                />
                            ))
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
                                    controlPosition={google.maps.ControlPosition.TOP_CENTER}
                                    onPlaceSelect={setSelectedPlace}
                                    onSearchBoxMounted={handleSearchBoxMounted}
                                    center={state.center}
                                    placeholder={props.searchBoxPlaceholder}
                                />
                                <MapHandler place={selectedPlace} />
                            </>
                        )}
                        <ActionButtonsMapControl
                            controlPosition={google.maps.ControlPosition.RIGHT_TOP}
                            showRecenter={hasBeenDragged && initialCenterRef.current !== null && initialZoomRef.current !== null && props.opt_recenterbutton}
                            showUndo={undoStepCount > 0 && props.opt_undobutton && !!props.latAttrUpdate && !!props.lngAttrUpdate}
                            showRedo={redoStepCount > 0 && props.opt_undobutton && !!props.latAttrUpdate && !!props.lngAttrUpdate}
                            showLegend={props.legendEnabled}
                            undoStepCount={undoStepCount}
                            redoStepCount={redoStepCount}
                            onRecenter={onRecenterMap}
                            onUndo={handleUndoLastMarkerEdit}
                            onRedo={handleRedoLastMarkerEdit}
                            onToggleLegend={() => childLegend.current?.toggleLegendPaneVisibility()}
                        />
                    </GoogleMapComponent>
                    </>
                    ) : (
                        <div className="spinner" />
                    )}

        </>
    );
};
export default Map;

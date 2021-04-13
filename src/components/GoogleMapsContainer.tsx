import {Component, createElement}  from "react";

import {DynamicValue, WebImage, ObjectItem,EditableValue,ListValue, ListActionValue, ListAttributeValue,ValueStatus} from "mendix";

import { isAttributeEditable, PositionProps, setLineStyleOptions } from "./MarkerUtils";
import { Map } from "./Map";

import { LoadScriptComponent } from "./LoadScriptComponent";
import { DefaultMapTypeEnum, LegendEntriesType, LineTypeEnum, MarkerImagesType } from "../../typings/GoogleMapsCustomMarkerProps";
import { MarkerProps } from "./Marker";

export const markerColorDefault = '#E11D24',
markerSymbolDefault = 'MARKER',
markerSizeDefault = 'M';

type DataSource = "static" | "context" | "XPath" | "microflow";

const libraries  = "drawing",
containerStyle = {
    width: '800px',
    height: '600px'
};

export interface GoogleMapsWidgetProps {
    markerObjects?: ListValue;
    latAttr: ListAttributeValue<BigJs.Big | string>;
    latAttrUpdate?: EditableValue<BigJs.Big | string>;
    lngAttr: ListAttributeValue<BigJs.Big | string>;
    lngAttrUpdate?: EditableValue<BigJs.Big | string>;
    formattedAddressAttrUpdate?: EditableValue<string>;
    draggableInEditMode: boolean;
    colorAttr?: ListAttributeValue<string>;
    enumAttr?: ListAttributeValue<string>;
    markerImages: MarkerImagesType[];
    markerSymbolAttr?: ListAttributeValue<string>;
    markerSizeAttr?: ListAttributeValue<string>;
    opacityAttr?: ListAttributeValue<BigJs.Big>;
    infoWindowAttr?: ListAttributeValue<string>;
    lineTypeAttr?: ListAttributeValue<string>;
    defaultMapType: DefaultMapTypeEnum;
    apiKey: string;
    defaultLat: string;
    defaultLng: string;
    dataSource: DataSource;    
    enableMarkerClusterer: boolean;
    MCGridSize: number;
    MCMaxZoom: number;
    int_disableInfoWindow: boolean;
    int_infoWindowNameLabel: string;
    int_onClick?: ListActionValue;
    int_onClickButtonClass: string;
    int_onClickButtonLabel: string;
    zoomToCurrentLocation: boolean;
    overruleFitBoundsZoom: boolean;
    lowestZoom: number;
    opt_drag: boolean;
    opt_mapcontrol: boolean;
    opt_scroll: boolean;
    opt_streetview: boolean;
    opt_zoomcontrol: boolean;
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
    locations:MarkerProps[];
}


export default class GoogleMapsContainer extends Component<GoogleMapsContainerProps,GoogleMapsContainerState> {
    mxObjects: ObjectItem[] = [];
    logNode: string;
    _lineCoordinateList: PositionProps[] = [];
    legendByIcons: boolean = false;
    legendIcons: MarkerImagesType[] = [];
    lineOptions: google.maps.PolylineOptions = {};
    constructor(props: GoogleMapsContainerProps) {
        super(props);
        this.state = {
            map: {} as google.maps.Map,
            isLoaded: false,
            editable: false
        }; 
        this.logNode = "Google Maps Custom Marker (React) widget: ";

    }
    componentDidMount () {
        console.debug(this.logNode + 'componentDidMount:', this.props);        
    }
    shouldComponentUpdate(nextProps:GoogleMapsContainerProps,nextState:GoogleMapsContainerState) {
        // no changes, no reload!G
        if (nextState == this.state && nextProps == this.props){
            console.debug(this.logNode + 'state nor props changed!');
            return false;
        } // props changes, reload! 
        else if (nextState == this.state && nextProps != this.props){
            if (this.props.markerObjects?.status == 'loading' && nextProps.markerObjects?.status == 'available'){
                console.debug(this.logNode + 'props changed, Mendix objects available!');
                return true;
            } else if (this.props.latAttrUpdate != nextProps.latAttrUpdate || this.props.latAttr != nextProps.latAttr ||
                this.props.lngAttrUpdate != nextProps.lngAttrUpdate || this.props.lngAttr != nextProps.lngAttr || 
                this.props.formattedAddressAttrUpdate != nextProps.formattedAddressAttrUpdate ) {
                    console.debug(this.logNode + 'props changed, object coordinates updated via drawing!');
                return false;
            } else {
                console.debug(this.logNode + 'props changed');
                return true;
            }         
        } // state changed, don't reload if only map was added to state! 
        else if (nextState != this.state && nextProps == this.props){
            if (!this.state.isLoaded && nextState.isLoaded){
                console.debug(this.logNode + 'state isLoaded changed!');
                return false;
            } else {
                console.debug('state changed!');
                return true;
            }           
        } else if (nextState != this.state && nextProps != this.props){
            console.debug(this.logNode + 'state and props changed!');
            return true;
        } // shouldn't occur
        else {
            return false;
        }           
    }
    render() { 

        const datasource = this.props.markerObjects;
        if (!datasource || datasource.status !== ValueStatus.Available || !datasource.items) {
            return null;
        }

        let draggable: boolean = false,
        isNew : boolean = false,
        lat : number = Number(this.props.defaultLat),
        lng : number = Number(this.props.defaultLng),
        opacity : number = 1,
        name : string = 'New Marker',
        icon : string,
        iconImage : DynamicValue<WebImage>,
        color : string,
        symbol : string,
        size : string,
        formattedAddress : string;

        // create locations
        // showing of infowindow is handled via state, if shown, don't recreate already existing objects
        if (datasource && datasource.items){
            let editable = false;
            if (this.props.latAttrUpdate){
                if (isAttributeEditable("latAttrUpdate",this.props.latAttrUpdate)){
                    editable = true;
                    if (this.props.draggableInEditMode){
                        draggable = true;
                        console.debug(this.logNode + " marker is draggable.");
                    }
                }
            }      
            this.mxObjects = datasource.items;
            this.mxObjects.map(mxObject => {
                
                if (this.props.infoWindowAttr){
                    name = String(this.props.infoWindowAttr(mxObject).value);
                }           
                // due to bug in Mendix Pluggable Widget API, readOnly field is always true for datasource objects, hence use attribute
                /*
                draggable = /*!this.props.coordinatesStringAttr(mxObject).readOnly;
                editable = !this.props.coordinatesStringAttr(mxObject).readOnly;
                */
                lat = Number(this.props.latAttr(mxObject).value);
                lng = Number(this.props.lngAttr(mxObject).value);
                
                if (!lat){
                    isNew = true;
                }

                this.props.enumAttr ? icon = String(this.props.enumAttr(mxObject).value) : null;

                if (this.props.enumAttr && mxObject){
                    this.props.markerImages.filter((image) =>{
                        if (icon === image.enumKey){
                            // add icon to marker
                            iconImage = image.enumImage;
                            // add icon as legend entry
                            this.legendByIcons = true;
                        }
					});
                }
                (!this.props.enumAttr && this.props.markerSymbolAttr) ? symbol = String(this.props.markerSymbolAttr(mxObject).value) : markerSymbolDefault;
                this.props.markerSizeAttr ? size = String(this.props.markerSizeAttr(mxObject).value) : markerSizeDefault;
             
                this.props.colorAttr ? color = String(this.props.colorAttr(mxObject).value) : markerColorDefault;
                this.props.opacityAttr ? opacity = Number(this.props.opacityAttr(mxObject).value) : 0; 
                this.props.formattedAddressAttrUpdate ? formattedAddress = String(this.props.formattedAddressAttrUpdate.value) : ''; 

                // build up internal array to being able to show a Polyline 
                // through all markers if requested with showLines = true
                // exclude new markers as they could already have current location as position
                (this.props.showLines && !isNew) ? this._lineCoordinateList.push({lat:lat,lng:lng}) : null ;

                let indexObj = -1;
                 
                let markerObj = {
                    guid : mxObject.id,
                    isNew: isNew,
                    mxObject : mxObject, 
                    name : name,
                    color : color,
                    opacity : opacity,
                    symbol : symbol,
                    iconImage : iconImage,
                    size : size,
                    visible : true,
                    draggable : draggable,
                    editable : editable,
                    position : {
                        lat : lat,
                        lng : lng
                    },
                    formattedAddress : formattedAddress
                    
                } as MarkerProps;

                indexObj = -1;
                this.props.locations.filter(function(location,index){
                    if (location.guid == markerObj.guid){
                        indexObj = index;
                        return;
                    }
                });
                // object exists -> remove old by index and add new
                if (indexObj > -1) {
                    this.props.locations.splice(indexObj,1);  
                }
                this.props.locations.push(markerObj);

            })
            
            // create style options for Normal / Dotted / Dashed line between markers
            let icons : google.maps.IconSequence;

            // normal lineStyle already defined in constructor
            if (this.props.showLines && this.props.lineType !== "Normal"){
                icons = {
                    icon: setLineStyleOptions(this.props.lineType,2),
                    offset: '0',
                    repeat: '20px'
                };
                this.lineOptions = {
                    geodesic : true,
                    strokeColor : this.props.lineColor,
                    strokeOpacity : 0,
                    strokeWeight : this.props.lineThickness,
                    icons : [icons]
                };

            } else {
                this.lineOptions = {
                    geodesic : true,
                    strokeColor : this.props.lineColor,
                    strokeOpacity : Number(this.props.lineOpacity),
                    strokeWeight : this.props.lineThickness
                };
            }      
    
        }

        return (
            <div style={{ height: '90vh', width: '0%' }} className={"googlemaps-custommarker"}>
                <LoadScriptComponent
                    apiKey={this.props.apiKey}
                    libraries={[libraries]}
                >
                    <Map
                        mapContainerStyle={containerStyle}
                        defaultLat={this.props.defaultLat}
                        defaultLng={this.props.defaultLng}
                        locations={this.props.locations}
                        lowestZoom={this.props.lowestZoom}
                        latAttrUpdate={this.props.latAttrUpdate}
                        lngAttrUpdate={this.props.lngAttrUpdate}
                        formattedAddressAttrUpdate={this.props.formattedAddressAttrUpdate}
                        enableMarkerClusterer = {this.props.enableMarkerClusterer}
                        MCGridSize = {this.props.MCGridSize}
                        MCMaxZoom = {this.props.MCMaxZoom}
                        int_disableInfoWindow={this.props.int_disableInfoWindow}
                        int_infoWindowNameLabel={this.props.int_infoWindowNameLabel}
                        int_onClick={this.props.int_onClick}
                        int_onClickButtonClass={this.props.int_onClickButtonClass}
                        int_onClickButtonLabel={this.props.int_onClickButtonLabel}
                        zoomToCurrentLocation = {this.props.zoomToCurrentLocation}
                        overruleFitBoundsZoom={this.props.overruleFitBoundsZoom}
                        defaultMapType={this.props.defaultMapType}
                        opt_drag={this.props.opt_drag}
                        opt_mapcontrol={this.props.opt_mapcontrol}
                        opt_scroll={this.props.opt_scroll}
                        opt_streetview={this.props.opt_streetview}
                        opt_tilt={this.props.opt_tilt}
                        opt_zoomcontrol={this.props.opt_zoomcontrol}
                        styleArray={this.props.styleArray}
                        legendEnabled={this.props.legendEnabled}
                        legendHeaderText={this.props.legendHeaderText}
                        legendIcons={this.props.markerImages}
                        legendByIcons={this.legendByIcons}
                        legendEntries={this.props.legendEntries}
                        searchBoxEnabled={this.props.searchBoxEnabled}
                        searchBoxPlaceholder={this.props.searchBoxPlaceholder}
                        searchBoxWidth={this.props.searchBoxWidth}
                        searchBoxHeight={this.props.searchBoxHeight}
                        showLines={this.props.showLines}
                        hideMarkers={this.props.hideMarkers}
                        lineOptions={this.lineOptions}
                        lineColor={this.props.lineColor}
                        lineThickness={this.props.lineThickness}
                        lineOpacity={this.props.lineOpacity}
                        _lineCoordinateList={this._lineCoordinateList}
                    ></Map>
                                    
                </LoadScriptComponent>

            </div>      
        ); 
    }
}


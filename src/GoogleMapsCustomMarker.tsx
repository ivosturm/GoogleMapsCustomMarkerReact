import { Component, ReactNode, createElement } from "react";

import { GoogleMapsCustomMarkerContainerProps } from "../typings/GoogleMapsCustomMarkerProps";

import "./ui/GoogleMapsCustomMarker.css";
import GoogleMapsContainer from "./components/GoogleMapsContainer";

export default class GoogleMapsCustomMarker extends Component<GoogleMapsCustomMarkerContainerProps> {
    render(): ReactNode {
        return <GoogleMapsContainer
        dataSource = {"XPath"}
        markerObjects = {this.props.markerObjects}
        defaultMapType = {this.props.defaultMapType}
        latAttr = {this.props.latAttr}
        latAttrUpdate = {this.props.latAttrUpdate}
        lngAttr = {this.props.lngAttr}
        lngAttrUpdate = {this.props.lngAttrUpdate}
        formattedAddressAttrUpdate = {this.props.formattedAddressAttrUpdate}
        draggableInEditMode={this.props.draggableInEditMode}
        enumAttr = {this.props.enumAttr}
        markerSymbolAttr = {this.props.markerSymbolAttr}
        markerSizeAttr = {this.props.markerSizeAttr}
        colorAttr = {this.props.colorAttr}
        opacityAttr = {this.props.opacityAttr}
        infoWindowAttr = {this.props.infoWindowAttr}    
        enableMarkerClusterer = {this.props.enableMarkerClusterer}
        MCGridSize = {this.props.MCGridSize}
        MCMaxZoom = {this.props.MCMaxZoom}
        opt_drag = {this.props.opt_drag}
        opt_mapcontrol = {this.props.opt_mapcontrol}
        opt_scroll = {this.props.opt_scroll}
        opt_streetview = {this.props.opt_streetview}
        opt_zoomcontrol = {this.props.opt_zoomcontrol}
        opt_tilt = {this.props.opt_tilt}
        int_disableInfoWindow = {this.props.disableInfoWindow}
        int_infoWindowNameLabel = {this.props.infoWindowNameLabel}
        int_onClick = {this.props.onClick}
        int_onClickButtonClass = {this.props.onClickButtonClass}
        int_onClickButtonLabel = {this.props.onClickButtonLabel}
        apiKey={this.props.apiAccessKey} 
        defaultLat = {this.props.defaultLat}    
        defaultLng = {this.props.defaultLng}
        zoomToCurrentLocation = {this.props.zoomToCurrentLocation}
        overruleFitBoundsZoom = {this.props.overruleFitBoundsZoom}
        lowestZoom = {this.props.lowestZoom}
        locations={[]}
        styleArray={this.props.styleArray}
        legendEnabled={this.props.legendEnabled}
        legendEntries={this.props.legendEntries}
        legendHeaderText={this.props.legendHeaderText} 
        searchBoxEnabled={this.props.searchBoxEnabled}
        searchBoxPlaceholder={this.props.searchBoxPlaceholder}
        searchBoxWidth={this.props.searchBoxWidth}
        searchBoxHeight={this.props.searchBoxHeight}
        showLines={this.props.showLines}
        hideMarkers={this.props.hideMarkers}
        lineType={this.props.lineType}
        lineColor={this.props.lineColor}
        lineThickness={this.props.lineThickness}
        lineOpacity={this.props.lineOpacity}
        markerImages={this.props.markerImages}
        
        />;
    }
}

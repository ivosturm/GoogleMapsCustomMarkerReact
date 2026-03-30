
import { createElement, Component, ReactNode } from "react";
import { ValueStatus } from "mendix";
import { GoogleMapsCustomMarkerContainerProps } from "../typings/GoogleMapsCustomMarkerProps";

import "./ui/GoogleMapsCustomMarker.css";
import GoogleMapsContainer from "./components/GoogleMapsContainer";

export default class GoogleMapsCustomMarker extends Component<GoogleMapsCustomMarkerContainerProps> {
    render(): ReactNode {

        const apiKeyObjectDS = this.props.apiKeyObjectDS;

        if (!apiKeyObjectDS || apiKeyObjectDS.status !== ValueStatus.Available) {
            return <div>Loading...</div>;
        } else if (apiKeyObjectDS.status === ValueStatus.Available && (!apiKeyObjectDS.items || apiKeyObjectDS.items.length === 0)) {
            return <div>Please provide an API key</div>;
        } 

        const apiKeyObject = apiKeyObjectDS.items![0];
        const apiKey = String(this.props.apiKeyAttribute.get(apiKeyObject).value);
        
        return (
            <div>
            {!apiKey ? <div>Please provide a valid API key to make the widget work in Production</div> : null}
            <GoogleMapsContainer
                mapHeight={this.props.mapHeight}
                mapWidth={this.props.mapWidth}
                dataSource={"XPath"}
                markerObjects={this.props.markerObjects}
                defaultMapType={this.props.defaultMapType}
                latAttr={this.props.latAttr}
                displayNameAttr={this.props.displayNameAttr}
                latAttrUpdate={this.props.latAttrUpdate}
                lngAttr={this.props.lngAttr}
                lngAttrUpdate={this.props.lngAttrUpdate}
                formattedAddressAttrUpdate={this.props.formattedAddressAttrUpdate}
                draggableInEditMode={this.props.draggableInEditMode}
                enumAttr={this.props.enumAttr}
                markerSymbolAttr={this.props.markerSymbolAttr}
                markerSizeAttr={this.props.markerSizeAttr}
                colorAttr={this.props.colorAttr}
                opacityAttr={this.props.opacityAttr}
                disableInfoWindow={this.props.disableInfoWindow}
                int_onClick={this.props.onClick}
                infoWindowWidget={this.props.infoWindowWidget}
                enableMarkerClusterer={this.props.enableMarkerClusterer}
                MCGridSize={this.props.MCGridSize}
                MCMaxZoom={this.props.MCMaxZoom}
                MCInfoWindowText={this.props.MCInfoWindowText}
                opt_drag={this.props.opt_drag}
                opt_mapcontrol={this.props.opt_mapcontrol}
                opt_scroll={this.props.opt_scroll}
                opt_streetview={this.props.opt_streetview}
                opt_zoomcontrol={this.props.opt_zoomcontrol}
                opt_tilt={this.props.opt_tilt}
                opt_fullscreencontrol={this.props.opt_fullscreencontrol}
                apiKey={apiKey}
                defaultLat={this.props.defaultLat}
                defaultLng={this.props.defaultLng}
                zoomToCurrentLocation={this.props.zoomToCurrentLocation}
                overruleFitBoundsZoom={this.props.overruleFitBoundsZoom}
                lowestZoom={this.props.lowestZoom}
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
            />
            </div>
        );
    }
}

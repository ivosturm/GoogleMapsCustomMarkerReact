import React, { createElement } from "react";
import { Marker } from "@react-google-maps/api";
import { DynamicValue, WebImage,ObjectItem,EditableValue} from "mendix";
import { addMarkerDragEvent, createSymbol } from "./MarkerUtils";

export interface Location {
    formattedAddress?: string;
    position: {
        lat: number;
        lng: number;
    }
    name: string;
}

export interface MarkerProps extends Location {
    guid: string;
    isNew:boolean;  
    mxObject: ObjectItem;
    draggable: boolean;
    editable?: boolean;
    clusterer?: any;
    visible: boolean;
    color: string;
    opacity: number;
    iconImage : DynamicValue<WebImage>
    symbol: string;
    size: string;
    onClick?:any;
    latAttrUpdate?: EditableValue<BigJs.Big | string>;
    lngAttrUpdate?: EditableValue<BigJs.Big | string>;
    formattedAddressAttr? : EditableValue<string>
    url?: string;
}

export interface MarkerState {
    marker: google.maps.Marker;
}

export default class MarkerComponent extends React.Component<MarkerProps,MarkerState>  {
    constructor(props: MarkerProps) {
        super(props);
        this.state = {
            marker: {} as google.maps.Marker
        };
        this.onLoad = this.onLoad.bind(this); 

    }
    onLoad = (marker: google.maps.Marker) => {  

        this.setState({
            marker : marker
        });
        addMarkerDragEvent(marker,this.props.latAttrUpdate,this.props.lngAttrUpdate,this.props.formattedAddressAttr);
    };
    /*onClick = (e:any) => {
        if (e){
            console.dir(this.props);

        }
    };
    onInfoWindowLoad = () => {
        console.log('infoWindow: ');
    }
    onInfoWindowClose = () => {

    };
    shouldComponentUpdate(prevProps:any) {
        if (prevProps.name == this.props.name && prevProps.position == this.props.position){
            console.error('marker ' +  this.props.name + ' NOT updated!');
            return false;
        } else {
            console.error('marker ' +  this.props.name + ' updated!');
            return true;
        }
    }*/
    render(){
        
        if (this.props.url) {
            const style = { backgroundImage: `url(${this.props.url})` };

            return <div className="widget-google-maps-marker-url" style={style}></div>
        }
        const symbol = createSymbol(this.props);
           
        return (<Marker
                    onLoad={this.onLoad}
                    key={this.props.guid}
                    clusterer={this.props.clusterer}
                    position={this.props.position}
                    onClick={this.props.onClick}
                    draggable={this.props.draggable}
                    icon={symbol}               
                >
            </Marker>
        )
    }
}


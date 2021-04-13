import  { Component, createElement } from "react";
import { InfoWindow } from "@react-google-maps/api";

import {ListActionValue, ObjectItem} from "mendix";
import { PositionProps } from "./MarkerUtils";

export interface InfoWindowProps extends InfoWindowExposedProps{
    pixelOffset?: google.maps.Size;
    position? : PositionProps;  
    onCloseClick?: any;
}

export interface InfoWindowExposedProps {
    name: string;  
    className: string;
    infoWindowLabel: string;
    onClickButtonLabel: string;
    onClickAction?:ListActionValue;
    mxObject?: ObjectItem;
}
 
export default class InfoWindowComponent extends Component<InfoWindowProps> {
    logNode: string;
    constructor(props: InfoWindowProps) {
        super(props);
        this.logNode = "Google Maps Custom Marker (React) widget: InfoWindow Component: ";
        this.onClickAction = this.onClickAction.bind(this);
    }
    onClickAction = () => {
        if (this.props.mxObject && this.props.mxObject.id && this.props.onClickAction){
            console.debug(this.logNode + 'triggering action with input mxobjectid: ' + this.props.mxObject.id)
            this.props.onClickAction(this.props.mxObject).execute();
        } else {
            console.error(this.logNode + 'triggering action without an input object!');
            
        }
    }
    componentDidUpdate(prevProps:any) {
        if (prevProps){
            console.debug(this.logNode + 'componentDidUpdate');
        }      
    }
    render(){  
        let infoWindowName : string = "";
        if (this.props.infoWindowLabel == "" || (!this.props.infoWindowLabel)) {
            infoWindowName = this.props.name;
        } else {
            infoWindowName = this.props.infoWindowLabel + ': ' + this.props.name;
        }
        return ( 
       <InfoWindow     
            position={this.props.position}
            onCloseClick={this.props.onCloseClick}  
            options={{pixelOffset: this.props.pixelOffset}}                     
       >
           <div>
            <text style={{marginLeft:"4px",fontWeight:700}}>
                    {infoWindowName}
            </text>
            <div>
            <button className={this.props.className} style={{ cursor: this.props.mxObject ? "pointer" : "none" }} id={"iw_"  + ( this.props.mxObject ? this.props.mxObject.id : (Math.floor(Math.random()*90000) + 10000))} onClick={this.onClickAction}>
                <span className={"glyphicon glyphicon-share-alt"} >
                </span>      
                <text style={{marginLeft:"4px"}}>
                    {this.props.onClickButtonLabel}
                </text>
            </button> 
            </div>
            </div>
        </InfoWindow>);
    }
};



   
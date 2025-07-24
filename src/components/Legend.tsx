/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable linebreak-style */
import React from "react";
import { LegendEntriesType, MarkerImagesType } from "../../typings/GoogleMapsCustomMarkerProps";
import { pinSymbolPath } from "./MarkerUtils";

interface LegendProps {
    title?: string;
    legendByIcons: boolean;
    legendIcons: MarkerImagesType[];
    legendEntries?: LegendEntriesType[];
}

interface LegendState {
    paneOpened: boolean;
}
export default class Legend extends React.Component<LegendProps, LegendState> {
    logNode: string;
    constructor(props: LegendProps) {
        super(props);
        this.logNode = "Google Maps Custom Marker (React) widget: Legend Component: ";
        this.state = {
            paneOpened: false
        };
        this.toggleLegendPaneVisibility = this.toggleLegendPaneVisibility.bind(this);
        this.determineTranslation = this.determineTranslation.bind(this);
        this.closeLegendPane = this.closeLegendPane.bind(this);
    }
    determineTranslation = (icon: string): string => {
        let transform = "";
        switch (icon) {
            case "MARKER":
                transform = "translate(10,30) scale(0.5)";
                break;
            case "DIAMOND":
                transform = "translate(10,20) scale(0.5)";
                break;
            case "STAR":
                transform = "translate(10,15) scale(0.5)";
                break;
            case "CIRCLE":
                transform = "translate(10,22) scale(0.5)";
                break;
            case "CROSS":
                transform = "translate(12,15) scale(0.5)";
                break;
            case "TRIANGLE":
                transform = "translate(10,20) scale(0.5)";
                break;
        }
        return transform;
    };
    toggleLegendPaneVisibility = () => {
        let toggleText = "";
        this.state.paneOpened ? (toggleText = "Closing ") : (toggleText = "Opening ");
        console.debug(this.logNode + toggleText + "legend pane...");
        this.setState({ paneOpened: !this.state.paneOpened });
    };
    closeLegendPane = () => {
        this.setState({ paneOpened: false });
    };
    render() {
        let legendEntryType = "symbols";
        let legendEntriesSize = 0;

        // always overrule legend entries if icons are configured
        if (this.props.legendByIcons) {
            legendEntryType = "icons";
            this.props.legendIcons ? (legendEntriesSize = this.props.legendIcons?.length) : 0;
        } else {
            this.props.legendEntries ? (legendEntriesSize = this.props.legendEntries?.length) : 0;
        }
        console.debug(this.logNode + "rendering legend with " + legendEntryType);

        const entrySize = 30;
        const imgStyle = { height: "18px", width: "18px" };
        const divStyle = { height: entrySize + "px", width: entrySize + "px", display: "inline" };
        const closeBtnStyle = { "pointer-events": "none", display: "block" };

        const listDimensions = { height: entrySize * legendEntriesSize + "px", width: "200px" };

        return (
            <div className={"googlemaps-custommarker-legend"}>
                <button
                    draggable={"false"}
                    title={this.props.title}
                    onClick={this.toggleLegendPaneVisibility}
                    aria-label={this.props.title}
                    type={"button"}
                    className={"gm-control-active gm-layer-control gm-fullscreen-control"}
                >
                    <img
                        src={
                            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAB6CAYAAAB9RzejAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQaSURBVHhe7dzNSuNQHIbxNlVQxJWL8QK8MxfOwo0ggohtRZeKGxfjLXhfLt2NKPQjk389DtacfLU2Oc37/CDYDOLUPj3pOTVNN47jDnRE7itEEFwMwcV4X8Ovrq667mYjBoMBE4sVSQV3sacfe42JiL4aqUO6PdCj0cjtoW28r+Hv7+/uFtqGSZsYgoshuBjvsuz09DTe3d11e43InKU3vWQMXdHqpqkR3ku2aGNj42OvpMc/j/bL2JKRLWMrGhBNBO8lz8KpPRMvLi66VaKPxiwXl1V38Flsd3tmPB5Hk8nE7WHV6gyeiu10ez07wqMOdQX3xk5eb+z/Z3jXqGrwXtWJVoLYAakSfBau4kSL2IEpG3wuXMnoxA5Q2eCpxXxBdGIHqlTwOI5T8YxFT7i9/4gdsFLBLepwOPS+Zdfv979GJ3bgSgU3RdGTL/b+N7EDVzq4yYuexE79O7HDUym4yYv+FbHDVDm4KYpO7HAtFNxkRSd22BYObr5HJ3b4fuSMF/sZSXz7k9dPxc484+Xu7i6OoqWep61lZxufn5/nngCxdqc4YTkMFTEEF0NwMQQXQ3Ax3uAHBwcdW/o0tTFDXx3vsgztxSFdDMHFEFwMwcUQXAzBxRBcDMHFeN94GQyG8evrX7dXv9vb29w/4mNxnAAhhkO6GIKLIbgYgoshuJhGZunb29udt7e3aDweTzMuKpA5S7+8vIy56pNf8nh2bm5ucpe0tY/wnZ2dztnZWdeCXl9fd+1OlvXw8BDbE8Q+8cKW3jY3N+3TP+EEt5GdHD3m7lASkJeVGtX2YH+ObLc7h9Os6lNLcN/I/jSZTKZ2OEI9KgWfTr3X9smVN7L7/T4TsJqVDr63t2enENv3ly6UN7KJ3YxSwS328fHxbGadbDbMC0tZbEZ2eEoFf3l5mfu+ougcxsNV9pCeipcVncN42MoGn7jLecz5Hp2RHb6ywU1e9Gj/1z4jew1UCW6yosdHv4+IvQaqBjfe6D7EDs8iwU1hdGKHadHgJjM6scO1THCTik7ssC0b3MyiJ1t31bFtjY/l/ERwY1dgnK56ZB8eHtpKwO4zW8ZmK6bkayY+iCDGnhUQQnAxBBfjDb61teVuoW1SwW15Zae7op28s3SL7m42ghn66niDo72YtIkhuBiCiyG4GIKLIbgYgoshuBjvGy9PT0/x8/Oz26vfyclJo+/0tRknQIjhkC6G4GIILobgYgguZu1m6U2fnBG6otXNWo3w+/t7+2Xs8+hsGVvRgFir4Jxrtzxew8UQXAzBxRBcDMHFEFwMwcUQXAzBxRBcDMHFEFwMwcUQXMxaBR+NRu4WFrVWwd0HFOw+s2VsRWe88EEEMfasgBCCiyG4GG9wrsTYXqngXImx3byzdK7E2F7e4GirTucf/Gk/K3MRV5IAAAAASUVORK5CYII="
                        }
                        style={imgStyle}
                    ></img>
                    <img
                        src={
                            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAB6CAYAAAB9RzejAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAVfSURBVHhe7Z27T9xYFIftXaSkAkUpNg/IP5G02aShBQlCqqSioOcRoAkhBYKwUIME1aYKAWn4BwLUoUra3S020iaIPKDIZiVWjs/MvZOZm2vf43j8mDm/Tzoae2Y8tvz53Id9ufhBEHhADj+pVyAECBcGhAsDwoVhFd7f3x/4vl9YqMMAGWAV3t3drZZApxFbpP/sd+UaIHtQhwsDwoVRiPD/g7NqgPzJXbgWff36DUgvAOu99OHh4WBnZ6flDSktONynT6+rq6vBxMREfT/m5ybPt54HI3dHvN7ePvUOaOTNm78jz10dEm7G0NAQXQVBKKJlQb9X213zvlZWVur7ivqOjqe/P61/B2EP85yZkUuRHpe54+Pj/v179xMV7+HFgbAEh8yFu4pp4sXenloCWcMWTuJ0cOHI7uu7FlDdw71CQTpYwhvFhXUuSzpklxOncFMc1bku6RzZly9dgewCiBUeJS5OOkc2Zfbbd/9AdgE4M5xukNiwSefIvnjhIjK7QGKFk5TDw5fe3Nwj6uN9B0lfWFioiuZm9odPHyC7QJwZTnIeP56PlD47O1uVTiCzy49TOMGRjsxuD1jCCZf0KNAaLxds4URS6WiNl49EwgmudGR2OUksnHBJJ9nI7JISNra+C+7jUfrOw4dz4Sbftu3t7WNtawvarnZIzcejA49H3WGeMzNSD4Cg/nco3Zuff+SnzWxOX359fT3o6kLJYePk5KR6b0StWmnJiBctivhR2QRHOEjHD9XhJiRZByg3LREO2gcIFwaEC8Mq/Oys1niiRlSeAbLH2krf3NwMjo6O1Fr+0MMYtQhajFU46FxQhwsDwoUB4cKAcGFAuDAgXBgQLgwIF4b1xgsNXXr9+pVay5/t7W3cacsIq/DBwcFgd3dXreUPBkBkh7VI10OIGgc25BEge1CHCwPChQHhwihEOAY9FEdLhikngSSvra15Y2Njvu4N6P3oCyCulT4zMxOcO3derYFG/v382Xuy/CS+h0PCzchiYj4K+s2NjY1wF9/2NTAwUN8XvdYOqfl4dOAvT9xhnjMzcivSdWaPjo42XYGVSsVPOu9qeHEgLMEhF+EkM8zsajGu3mri6tUraglkTSLhJC5JJhJRma2hOrmxHgfZwhKuRU9PT3s3b/7Klk7fi8vsB1MPgqWlJcjOEXaGbz3b8hYXF/2Dg32fI50+j8tskr382zJk54xTOIkj2XdG7tTFuaRr2XGZDdnFECucxN26dbtJtiZKOq27inHILg5nhu/vR09tTdLpgtDSdWbHNdAgu1hihWsxcf8tcG/vRT3T0UArP84M50inTKd6HpldfpzCCY50Wz1PILPLBUs4wZFugswuH2zhRBLpyOxykkg4wZGOrleJsT1C4zwepc9rmzdvOzU55dw2KqJ+Uwcej7rDPGdmpBoAofvf4W9UG2xpM9v8PZNKpRJMTk55PT096h3QyF9//Om9//jeeu40qUe8aEmXfrnspZ1f1SUcpCdxHW5CgikwmW57kFq4BrLbg5YJB+0BhAsjVjg1ovIMkD1W4aenp2oJdBrWbhnoXFCHCwPChQHhwoBwYUC4MCBcGBAuDAgXBoQLw3qnjUaWHB8fq7X8iRrfDtJjFY6ZGDsXa5GOmRg7F9ThwoBwYUC4MCBcGBAujLYSTv8Tlf6mDREd6lRF0lbCz6s5Vm1dOgSvW4siXRgQLgwIFwaECwPChQHhwoBwYUC4MCBcGBAuDAgXBoQLA8KFAeHCaCvhX/77Un21zQ+D4M2Rk3omxlaiDxrj0rMDRbowIFwYEC4MCBcGhAvDKlzPxGg2+7MOkD2YiVEYKNJF4XlfAcXSg7PuKfCVAAAAAElFTkSuQmCC"
                        }
                        style={imgStyle}
                    ></img>
                </button>
                {this.state.paneOpened && (
                    <div className={"gm-layer-modal"} title={this.props.title} aria-label={this.props.title}>
                        <div className={"gm-layer-modal-text"}>
                            {this.props.title}
                            <ul style={listDimensions}>
                                {!this.props.legendByIcons &&
                                    this.props.legendEntries?.map((legendEntry, index) => (
                                        <li key={"legendEntry_" + index}>
                                            <svg width={entrySize} height={entrySize}>
                                                <path
                                                    d={pinSymbolPath(legendEntry.legendEntryIcon)}
                                                    stroke={"black"}
                                                    strokeWidth={1}
                                                    opacity={1}
                                                    fill={legendEntry.legendEntryColor}
                                                    transform={this.determineTranslation(legendEntry.legendEntryIcon)}
                                                />
                                            </svg>
                                            {legendEntry.legendEntryName}
                                        </li>
                                    ))}
                                {this.props.legendByIcons &&
                                    this.props.legendIcons.map((legendIcon, index) => (
                                        <li key={"legendIcon_" + index} style={{ padding: "6px 0px" }}>
                                            <div style={divStyle}>
                                                <img src={legendIcon.enumImage.value?.uri} style={imgStyle}></img>
                                                <text>{legendIcon.enumKey}</text>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        <button
                            draggable="false"
                            data-dojo-attach-point="layerToggleModalClose"
                            title="Sluiten"
                            aria-label="Sluiten"
                            onClick={this.closeLegendPane}
                            type="button"
                            className="gm-ui-hover-effect gm-layer-modal-close"
                        >
                            <img
                                src={
                                    "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2215px%22%20height%3D%2215px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23000000%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%0A%3C%2Fsvg%3E%0A"
                                }
                                style={closeBtnStyle}
                            ></img>
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

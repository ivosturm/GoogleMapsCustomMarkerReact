import { createElement, useCallback } from "react";
import { AdvancedMarker, AdvancedMarkerAnchorPoint, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";

type FeaturesClusterMarkerProps = {
    clusterId: number;
    onMarkerClick?: (marker: google.maps.marker.AdvancedMarkerElement | null, clusterId: number) => void;
    position: google.maps.LatLngLiteral;
    size: number;
    sizeAsText: string;
    mediumThreshold: number;
    largeThreshold: number;
    colorSmall: string;
    colorMedium: string;
    colorLarge: string;
    isSpiderfied?: boolean;
};

// Constants for cluster marker styling
const OUTER_SIZE = 48;
const DEFAULT_MEDIUM_THRESHOLD = 50;
const DEFAULT_LARGE_THRESHOLD = 200;

const getThresholdValue = (value: number | undefined, defaultValue: number, minValue: number = 0): number => {
    return typeof value === "number" && Number.isFinite(value) && value > minValue ? Math.round(value) : defaultValue;
};

const getColorBySizeAndThresholds = (
    size: number,
    mediumThreshold: number,
    largeThreshold: number,
    colorSmall: string,
    colorMedium: string,
    colorLarge: string
): string => {
    if (size >= largeThreshold) {
        return colorLarge;
    }
    if (size >= mediumThreshold) {
        return colorMedium;
    }
    return colorSmall;
};

export const FeaturesClusterMarker = ({
    position,
    size,
    sizeAsText,
    onMarkerClick,
    clusterId,
    mediumThreshold,
    largeThreshold,
    colorSmall,
    colorMedium,
    colorLarge,
    isSpiderfied = false
}: FeaturesClusterMarkerProps) => {
    const [markerRef, marker] = useAdvancedMarkerRef();

    const handleClick = useCallback(() => {
        if (onMarkerClick) {
            onMarkerClick(marker, clusterId);
        }
    }, [onMarkerClick, marker, clusterId]);

    const safeMediumThreshold = getThresholdValue(mediumThreshold, DEFAULT_MEDIUM_THRESHOLD);
    const safeLargeThreshold = getThresholdValue(largeThreshold, DEFAULT_LARGE_THRESHOLD, safeMediumThreshold);
    const clusterColor = getColorBySizeAndThresholds(
        size,
        safeMediumThreshold,
        safeLargeThreshold,
        colorSmall,
        colorMedium,
        colorLarge
    );

    return (
        <AdvancedMarker
            ref={markerRef}
            position={position}
            zIndex={size}
            onClick={handleClick}
            style={{ width: OUTER_SIZE, height: OUTER_SIZE }}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
            className={isSpiderfied ? 'gm-cluster-spiderfied' : ''}
        >
            <div style={{ width: OUTER_SIZE, height: OUTER_SIZE, position: "relative" }}>
                {/* Semi-transparent outer ring */}
                <div
                    style={{
                        width: OUTER_SIZE,
                        height: OUTER_SIZE,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        borderRadius: "50%",
                        border: `4px solid ${clusterColor}`,
                        boxSizing: "border-box",
                        background: "transparent",
                        opacity: 0.4
                    }}
                />
                {/* Solid inner circle with text */}
                <div
                    style={{
                        width: 40,
                        height: 40,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: clusterColor,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <span style={{ color: "white", fontSize: "1.2em", fontWeight: 700 }}>{sizeAsText}</span>
                </div>
            </div>
        </AdvancedMarker>
    );
};
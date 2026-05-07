import { createElement, Fragment, useCallback, useMemo, useState } from "react";
import Supercluster, { ClusterProperties } from "supercluster";
import { FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { useMap } from "@vis.gl/react-google-maps";
import MarkerComponent from "./Marker";
import { FeaturesClusterMarker } from "./FeaturesClusterMarker";
import { useSupercluster } from "./SuperCluster";
import { Polyline } from "./Polyline";

const SPIDER_THRESHOLD = 10;
const SPIDER_LEG_COLOR = "rgba(80,80,80,0.55)";
const SPIDER_LEG_WEIGHT = 1.5;
const SPIDER_PIXELS = 20; // Spider spread in screen pixels — constant visual size at any zoom level

type SpiderLeaf = {
    position: google.maps.LatLng;
    feature: FeatureCollection<Point>["features"][0];
};

type SpiderState = {
    clusterId: number;
    center: google.maps.LatLng;
    leaves: SpiderLeaf[];
};

type ClusteredMarkersProps = {
    geojson: FeatureCollection<Point>;
    radius: number;
    maxZoom: number;
    mediumThreshold: number;
    largeThreshold: number;
    colorSmall: string;
    colorMedium: string;
    colorLarge: string;
    enableSpiderfier?: boolean;
    selectedMarkerGuid?: string | null;
    enableSelectedStyle?: boolean;
    selectedScalePercent?: number;
    selectedZIndexBoost?: number;
};

/**
 * Calculate lat/lng offsets for spider markers in degrees.
 * Uses circle for ≤8 markers, Archimedean spiral for >8.
 * Returns offsets in decimal degrees for direct lat/lng calculation.
 */
/**
 * Convert a pixel distance to degrees at the given zoom level and latitude.
 * At each zoom step, the world halves in degree-per-pixel terms.
 */
function pixelsToDegrees(pixels: number, zoom: number, lat: number): number {
    const degreesPerPixel = 360 / (256 * Math.pow(2, zoom));
    const cosLat = Math.cos((lat * Math.PI) / 180);
    return pixels * degreesPerPixel / cosLat;
}

function getSpiderOffsets(count: number, centerLat: number, zoom: number): { lat: number; lng: number }[] {
    if (count <= 1) return [{ lat: 0, lng: 0 }];
    
    const offsets: { lat: number; lng: number }[] = [];
    const radius = pixelsToDegrees(SPIDER_PIXELS, zoom, centerLat);
    
    if (count <= 8) {
        // Circle pattern
        const angle = (2 * Math.PI) / count;
        for (let i = 0; i < count; i++) {
            const a = i * angle;
            offsets.push({
                lat: radius * Math.sin(a),
                lng: radius * Math.cos(a)
            });
        }
    } else {
        // Archimedean spiral pattern
        const spiralDensity = 2 * Math.PI / (2 * count);
        for (let i = 0; i < count; i++) {
            const t = spiralDensity * i;
            const r = radius * (0.5 + i / count);
            offsets.push({
                lat: r * Math.sin(t),
                lng: r * Math.cos(t)
            });
        }
    }
    
    return offsets;
}

export const ClusteredMarkers = ({
    geojson,
    radius,
    maxZoom,
    mediumThreshold,
    largeThreshold,
    colorSmall,
    colorMedium,
    colorLarge,
    enableSpiderfier = true,
    selectedMarkerGuid,
    enableSelectedStyle,
    selectedScalePercent,
    selectedZIndexBoost
}: ClusteredMarkersProps) => {
    const map = useMap();
    const [spiderState, setSpiderState] = useState<SpiderState | null>(null);

    const safeRadius = Number.isFinite(radius) && radius > 0 ? Math.round(radius) : 80;
    const safeMaxZoom = Number.isFinite(maxZoom) && maxZoom >= 0 ? Math.round(maxZoom) : 12;

    const superclusterOptions: Supercluster.Options<GeoJsonProperties, ClusterProperties> = useMemo(
        () => ({
            extent: 256,
            radius: safeRadius,
            maxZoom: safeMaxZoom
        }),
        [safeRadius, safeMaxZoom]
    );

    const { clusters, getLeaves, getClusterExpansionZoom } = useSupercluster(geojson, superclusterOptions);

    const orderedClusters = useMemo(() => {
        const clusterFeatures = clusters.filter(feature => {
            const clusterProperties = feature.properties as ClusterProperties;
            return Boolean(clusterProperties.cluster);
        });
        const markerFeatures = clusters.filter(feature => {
            const clusterProperties = feature.properties as ClusterProperties;
            return !clusterProperties.cluster;
        });

        markerFeatures.sort((a, b) => {
            const aGuid = String((a.properties as GeoJsonProperties)?.["guid"] ?? "");
            const bGuid = String((b.properties as GeoJsonProperties)?.["guid"] ?? "");
            const aSelected = aGuid === selectedMarkerGuid ? 1 : 0;
            const bSelected = bGuid === selectedMarkerGuid ? 1 : 0;
            return aSelected - bSelected;
        });

        return [...clusterFeatures, ...markerFeatures];
    }, [clusters, selectedMarkerGuid]);

    const orderedSpiderLeaves = useMemo(() => {
        if (!spiderState?.leaves) {
            return [];
        }

        return [...spiderState.leaves].sort((a, b) => {
            const aGuid = String((a.feature.properties as GeoJsonProperties)?.["guid"] ?? "");
            const bGuid = String((b.feature.properties as GeoJsonProperties)?.["guid"] ?? "");
            const aSelected = aGuid === selectedMarkerGuid ? 1 : 0;
            const bSelected = bGuid === selectedMarkerGuid ? 1 : 0;
            return aSelected - bSelected;
        });
    }, [spiderState, selectedMarkerGuid]);

    const handleClusterClick = useCallback(
        (_marker: google.maps.marker.AdvancedMarkerElement | null, clusterId: number, position: google.maps.LatLngLiteral) => {
            if (!map) return;

            if (!enableSpiderfier) {
                // Legacy: just zoom in
                const zoom = getClusterExpansionZoom(clusterId);
                map.setCenter(position);
                map.setZoom(zoom);
                return;
            }

            const leaves = getLeaves(clusterId);

            // If spider already open for this cluster, close it
            if (spiderState?.clusterId === clusterId) {
                setSpiderState(null);
                return;
            }

            // If only a few markers, spiderify; otherwise zoom
            if (leaves.length <= SPIDER_THRESHOLD && leaves.length > 1) {
                const centerLatLng = new google.maps.LatLng(position.lat, position.lng);
                
                const currentZoom = map.getZoom() ?? 12;
                const offsets = getSpiderOffsets(leaves.length, position.lat, currentZoom);
                const spiderLeaves: SpiderLeaf[] = leaves.map((leaf, index) => {
                    const offset = offsets[index];
                    const spideredPosition = new google.maps.LatLng(
                        position.lat + offset.lat,
                        position.lng + offset.lng
                    );
                    return { position: spideredPosition, feature: leaf };
                });
                
                setSpiderState({
                    clusterId,
                    center: centerLatLng,
                    leaves: spiderLeaves
                });
            } else {
                // Too many markers: zoom in
                const zoom = getClusterExpansionZoom(clusterId);
                map.setCenter(position);
                map.setZoom(zoom);
            }
        },
        [map, enableSpiderfier, spiderState?.clusterId, getLeaves, getClusterExpansionZoom]
    );

    const handleMarkerClick = useCallback(
        () => {
            // Close spider if open
            if (spiderState) {
                setSpiderState(null);
            }
        },
        [spiderState]
    );

    const spiderLegs = spiderState?.leaves.map(leaf => ({
        path: [spiderState.center, leaf.position]
    })) || [];

    return (
        <>
            {/* Spider legs (polylines connecting center to each marker) */}
            {spiderLegs.map((leg, index) => (
                <Polyline
                    key={`spider-leg-${index}`}
                    path={leg.path}
                    strokeColor={SPIDER_LEG_COLOR}
                    strokeWeight={SPIDER_LEG_WEIGHT}
                    geodesic={false}
                />
            ))}

            {/* Regular clusters and markers */}
            {orderedClusters.map(feature => {
                const [lng, lat] = feature.geometry.coordinates;
                const clusterProperties = feature.properties as ClusterProperties;
                const isCluster = clusterProperties.cluster;

                return isCluster ? (
                    <FeaturesClusterMarker
                        key={`cluster_${clusterProperties.cluster_id}`}
                        clusterId={clusterProperties.cluster_id}
                        position={{ lat, lng }}
                        size={clusterProperties.point_count}
                        sizeAsText={String(clusterProperties.point_count_abbreviated)}
                        mediumThreshold={mediumThreshold}
                        largeThreshold={largeThreshold}
                        colorSmall={colorSmall}
                        colorMedium={colorMedium}
                        colorLarge={colorLarge}
                        isSpiderfied={spiderState?.clusterId === clusterProperties.cluster_id}
                        onMarkerClick={(marker, clusterId) => handleClusterClick(marker, clusterId, { lat, lng })}
                    />
                ) : (
                    <MarkerComponent
                        key={`marker_${(feature.properties as GeoJsonProperties)?.["guid"]}`}
                        position={{ lat, lng }}
                        symbol={(feature.properties as GeoJsonProperties)?.["symbol"]}
                        size={(feature.properties as GeoJsonProperties)?.["size"]}
                        opacity={(feature.properties as GeoJsonProperties)?.["opacity"]}
                        color={(feature.properties as GeoJsonProperties)?.["color"]}
                        iconImage={(feature.properties as GeoJsonProperties)?.["iconImage"]}
                        guid={String((feature.properties as GeoJsonProperties)?.["guid"])}
                        isNew={false}
                        mxObject={(feature.properties as GeoJsonProperties)?.["mxObject"]}
                        draggable={false}
                        visible={true}
                        onClick={(e: google.maps.MapMouseEvent) => {
                            handleMarkerClick();
                            (feature.properties as GeoJsonProperties)?.["onClick"]?.(e);
                        }}
                        name={String((feature.properties as GeoJsonProperties)?.["name"])}
                        isSelected={selectedMarkerGuid === String((feature.properties as GeoJsonProperties)?.["guid"])}
                        enableSelectedStyle={enableSelectedStyle}
                        selectedScalePercent={selectedScalePercent}
                        selectedZIndexBoost={selectedZIndexBoost}
                    />
                );
            })}

            {/* Spider markers */}
            {orderedSpiderLeaves.map((leaf, index) => (
                <MarkerComponent
                    key={`spider-marker-${index}`}
                    position={{
                        lat: leaf.position.lat(),
                        lng: leaf.position.lng()
                    }}
                    symbol={(leaf.feature.properties as GeoJsonProperties)?.["symbol"]}
                    size={(leaf.feature.properties as GeoJsonProperties)?.["size"]}
                    opacity={(leaf.feature.properties as GeoJsonProperties)?.["opacity"]}
                    color={(leaf.feature.properties as GeoJsonProperties)?.["color"]}
                    iconImage={(leaf.feature.properties as GeoJsonProperties)?.["iconImage"]}
                    guid={String((leaf.feature.properties as GeoJsonProperties)?.["guid"])}
                    isNew={false}
                    mxObject={(leaf.feature.properties as GeoJsonProperties)?.["mxObject"]}
                    draggable={false}
                    visible={true}
                    onClick={(e: google.maps.MapMouseEvent) => {
                        setSpiderState(null);
                        (leaf.feature.properties as GeoJsonProperties)?.["onClick"]?.(e);
                    }}
                    name={String((leaf.feature.properties as GeoJsonProperties)?.["name"])}
                    isSelected={selectedMarkerGuid === String((leaf.feature.properties as GeoJsonProperties)?.["guid"])}
                    enableSelectedStyle={enableSelectedStyle}
                    selectedScalePercent={selectedScalePercent}
                    selectedZIndexBoost={selectedZIndexBoost}
                />
            ))}
        </>
    );
};
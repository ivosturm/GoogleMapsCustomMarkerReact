import React, { useCallback, useEffect  } from 'react';
import Supercluster, {ClusterProperties} from 'supercluster';
import {FeaturesClusterMarker} from './FeaturesClusterMarker';
import {useSupercluster} from './SuperCluster';
import {Feature, FeatureCollection, GeoJsonProperties, Point} from 'geojson';
import MarkerComponent from './Marker';

type ClusteredMarkersProps = {
  geojson: FeatureCollection<Point>;
  setNumClusters: (n: number) => void;
  setInfowindowData: (
    data: {
      anchor: google.maps.Marker;
      features: Feature<Point>[];
    } | null
  ) => void;
};

const superclusterOptions: Supercluster.Options<
  GeoJsonProperties,
  ClusterProperties
> = {
  extent: 256,
  radius: 80,
  maxZoom: 12
};

export const ClusteredMarkers = ({
  geojson,
  setNumClusters,
  setInfowindowData
}: ClusteredMarkersProps) => {

  const {clusters, getLeaves} = useSupercluster(geojson, superclusterOptions);

  useEffect(() => {
    setNumClusters(clusters.length);
  }, [setNumClusters, clusters.length]);

  const handleClusterClick = useCallback(
    (marker: google.maps.Marker, clusterId: number) => {
      const leaves = getLeaves(clusterId);

      setInfowindowData({anchor: marker, features: leaves});
    },
    [getLeaves, setInfowindowData]
  );

  return (
    <>
      {clusters.map(feature => {
        const [lng, lat] = feature.geometry.coordinates;

        const clusterProperties = feature.properties as ClusterProperties;
        const isCluster: boolean = clusterProperties.cluster;

        return isCluster ? (
          <FeaturesClusterMarker
            key={feature.id}
            clusterId={clusterProperties.cluster_id}
            position={{lat, lng}}
            size={clusterProperties.point_count}
            sizeAsText={String(clusterProperties.point_count_abbreviated)}
            onMarkerClick={handleClusterClick}
          />
        ) : (
          <MarkerComponent
              key={feature.id}
              //featureId={feature.id as string}
              position={{ lat, lng }}
              symbol={(feature.properties as GeoJsonProperties)?.['symbol']}
              size={(feature.properties as GeoJsonProperties)?.['size']}
              opacity={(feature.properties as GeoJsonProperties)?.['opacity']}
              color={(feature.properties as GeoJsonProperties)?.['color']}
              iconImage={(feature.properties as GeoJsonProperties)?.['iconImage']}
              guid={(feature.properties as GeoJsonProperties)?.['guid']}
              isNew={false}
              mxObject={(feature.properties as GeoJsonProperties)?.['mxObject']}
              draggable={false}
              visible={true}
              onClick={(e: google.maps.MapMouseEvent) => (feature.properties as GeoJsonProperties)?.['onClick']?.(e)}
              name={'Single Marker'}
          />
        );
      })}
    </>
  );
};
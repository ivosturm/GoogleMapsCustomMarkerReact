import React, { useCallback} from 'react';
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';


type TreeClusterMarkerProps = {
  clusterId: number;
  onMarkerClick?: (
    marker: google.maps.Marker | any,
    clusterId: number
  ) => void;
  position: google.maps.LatLngLiteral;
  size: number;
  sizeAsText: string;
};

export const FeaturesClusterMarker = ({
  position,
  size,
  sizeAsText,
  onMarkerClick,
  clusterId
}: TreeClusterMarkerProps) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const handleClick = useCallback(
    () => onMarkerClick && onMarkerClick(marker!, clusterId),
    [onMarkerClick, marker, clusterId]
  );
  const markerSize = Math.floor(48 + Math.sqrt(size) * 2);

  const getBackgroundColor = (sizeAsText: number) => {
    if (sizeAsText >= 100) return '#cc3232';
    if (sizeAsText >= 75) return '#db7b2b';
    if (sizeAsText >= 50) return '#e2602d';
    if (sizeAsText >= 25) return '#e7b416';
    if (sizeAsText >= 10) return '#2dc937';
    return 'darkgreen';
  };

  const backgroundColor = getBackgroundColor(Number(sizeAsText));
  const textColor = backgroundColor === '#cc3232' || backgroundColor === 'darkgreen' ? 'white' : 'black';

  return (
    <AdvancedMarker
      ref={markerRef}
      position={position}
      zIndex={size}
      onClick={handleClick}
      className={'marker cluster'}
      style={{width: markerSize, height: markerSize}}
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}>
      <div
        style={{
          width: 40,
          height: 40,
          position: 'relative',
          top: 20,
          left: 20,
          background: backgroundColor,
          border: '2px solid #0e6443',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
            <span style={{ color: textColor, fontSize: '2em' }}>{sizeAsText}</span>
        </div>

    </AdvancedMarker>
  );
};
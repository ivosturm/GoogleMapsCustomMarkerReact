/* eslint-disable complexity */
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback,
  useMemo
} from 'react';

import { GoogleMapsContext, useMapsLibrary } from '@vis.gl/react-google-maps';

import type { Ref } from 'react';
import { EditableValue } from 'mendix';
import { PositionProps } from './MarkerUtils';

export interface PolyProps {
  coordinatesStringAttrUpdate?: EditableValue<string>;
  center?: PositionProps;
}

type PolylineEventProps = {
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onDrag?: (e: google.maps.MapMouseEvent) => void;
  onDragStart?: (e: google.maps.MapMouseEvent) => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  onMouseOver?: (e: google.maps.MapMouseEvent) => void;
  onMouseOut?: (e: google.maps.MapMouseEvent) => void;
  onPolylineChange?: (path: google.maps.MVCArray<google.maps.LatLng>) => void;
};

export interface IconsProps {
  icon: IconProps;
  offset: string;
  repeat: string;
}

export interface IconProps {
  path: string | google.maps.SymbolPath;
  fillOpacity?: number;
  strokeOpacity?: number;
  scale: number;
  strokeWeight: number;
}

export interface PolylineCustomProps extends PolyProps {
  icons?: google.maps.IconSequence[] | null;
  encodedPath?: string;
}

export type PolylineProps = google.maps.PolylineOptions &
  PolylineEventProps &
  PolylineCustomProps;

export type PolylineRef = Ref<google.maps.Polyline | null>;

function usePolyline(props: PolylineProps) {
  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onPolylineChange,
    encodedPath,
    ...polylineOptions
  } = props;

  const callbacks = useRef({
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onPolylineChange
  });

  const geometryLibrary = useMapsLibrary('geometry');
  const logNode = "Google Maps Custom Marker (React) widget: Polyline: ";

  const polyline = useRef(new google.maps.Polyline()).current;
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

  useMemo(() => {
    polyline.setOptions(polylineOptions);
  }, [polyline, polylineOptions]);

  const map = useContext(GoogleMapsContext)?.map;

  useMemo(() => {
    if (!encodedPath || !geometryLibrary) return;
    const path = geometryLibrary.encoding.decodePath(encodedPath);
    polyline.setPath(path);
  }, [polyline, encodedPath, geometryLibrary]);

  useEffect(() => {
    if (!map) {
      if (map === undefined)
        console.error(logNode + '<Polyline> has to be inside a Map component.');
      return;
    }

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map]);

  const addEventListeners = useCallback(() => {
    const gme = google.maps.event;
    [
      ['click', 'onClick'],
      ['drag', 'onDrag'],
      ['dragstart', 'onDragStart'],
      ['dragend', 'onDragEnd'],
      ['mouseover', 'onMouseOver'],
      ['mouseout', 'onMouseOut']
    ].forEach(([eventName, eventCallback]) => {
      listenersRef.current.push(gme.addListener(polyline, eventName, (e: google.maps.MapMouseEvent) => {
        const callback = callbacks.current[eventCallback as keyof typeof callbacks.current] as ((e: google.maps.MapMouseEvent) => void) | undefined;
        if (callback) callback(e as google.maps.MapMouseEvent);
      }))
    });

    if (props.editable && props.coordinatesStringAttrUpdate && onPolylineChange) {
      const path = polyline.getPath();
      listenersRef.current.push(gme.addListener(path, 'insert_at', () => { onPolylineChange(path) }))
      listenersRef.current.push(gme.addListener(path, 'set_at', () => { onPolylineChange(path) }))
      listenersRef.current.push(gme.addListener(path, 'remove_at', () => { onPolylineChange(path) }))
    }
  }, [polyline]);

  useEffect(() => {
    if (!polyline) return;

    addEventListeners();

    return () => {
      listenersRef.current.forEach(listener => listener.remove());
    };
  }, [polyline, polylineOptions]);

  return polyline;
}

/**
 * Component to render a polyline on a map
 */
export const Polyline = forwardRef((props: PolylineProps, ref: PolylineRef) => {
  const polyline = usePolyline(props);

  useImperativeHandle(ref, () => polyline, []);

  return null;
});
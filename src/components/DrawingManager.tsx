import {useMap, useMapsLibrary} from '@vis.gl/react-google-maps';
import {useEffect, useState} from 'react';
import { createSymbol, MarkerProps } from './MarkerUtils';

export function useDrawingManager(
  initialValue: google.maps.drawing.DrawingManager | null = null,
  locations?: MarkerProps[],
  onMarkerComplete?: (marker: google.maps.Marker) => void
) {
  const map = useMap();
  const drawing = useMapsLibrary('drawing');
  const logNode = "Google Maps Custom Marker (React) widget: DrawingManager function: ";

  const [drawingManager, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager | null>(initialValue);

drawingManager?.addListener('overlaycomplete', (event: any) => {
    if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
      console.log(logNode + 'Circle overlay complete');
    } else if (event.type === google.maps.drawing.OverlayType.MARKER) {
      console.log(logNode + 'Marker overlay complete');
      onMarkerComplete?.(event.overlay);
      drawingManager.setDrawingMode(null);
    } else if (event.type === google.maps.drawing.OverlayType.POLYGON) {
      console.log(logNode + 'Polygon overlay complete');
    } else if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
      console.log(logNode + 'Polyline overlay complete');
    } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
      console.log(logNode + 'Rectangle overlay complete');  
    }  
});

  useEffect(() => {
    if (!map || !drawing) return;
    // generic options
    let drawingOptions = {
      drawingControl : true,
      drawingControlOptions : {
          drawingModes : [google.maps.drawing.OverlayType.POLYGON,google.maps.drawing.OverlayType.POLYLINE],
          position : google.maps.ControlPosition.TOP_CENTER
      }
    }
    // https://developers.google.com/maps/documentation/javascript/reference/drawing
    const newDrawingManager = new drawing.DrawingManager({
      map,
      drawingControl : true,
      drawingControlOptions : {
          drawingModes : [google.maps.drawing.OverlayType.POLYGON,google.maps.drawing.OverlayType.POLYLINE],
          position : google.maps.ControlPosition.TOP_CENTER
      }
    });

    // only add drawing manager if a poly object with empty coordinatesstring is fed
    if (locations?.length === 1 && locations[0].isNew) {
      console.debug(logNode + "onDMLoad: drawingMode Marker");
      const symbol = createSymbol(locations[0]);
      console.dir(symbol );
      // add marker options
      const markerDrawingOpts = {
          drawingControl: true,
          drawingControlOptions: {
              drawingModes: [google.maps.drawing.OverlayType.MARKER],
              position: drawingOptions.drawingControlOptions.position
          },
          markerOptions: {
              animation: google.maps.Animation.DROP,
              clickable: locations[0].editable,
              draggable: locations[0].draggable/*,
              icon: symbol*/
          }
      };
      newDrawingManager.setDrawingMode(markerDrawingOpts.drawingControlOptions.drawingModes[0]);
      newDrawingManager.setOptions(markerDrawingOpts);
  } else {
    console.debug(logNode + 'drawingMode NONE');
    drawingOptions.drawingControl = false;
    newDrawingManager.setOptions(drawingOptions);
}

  setDrawingManager(newDrawingManager);

    return () => {
      newDrawingManager.setMap(null);
    };
  }, [drawing, map]);

  return drawingManager;
}


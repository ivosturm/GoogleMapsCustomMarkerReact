import {useEffect, useRef, useState} from 'react';
import {useMap} from '@vis.gl/react-google-maps';
import {TerraDraw,} from 'terra-draw';
import {TerraDrawGoogleMapsAdapter} from 'terra-draw-google-maps-adapter';
import {Position} from 'geojson';

import {createTerraDrawModes} from './TerraDrawConfig';
import { HexColorStyling } from 'terra-draw/dist/common';

const logNode = "Google Maps Custom Marker widget: Terra Draw function: ";

export const useTerraDraw = (onMarkerComplete?: (position: Position | Position[] | Position[][], draw: TerraDraw, color: HexColorStyling) => void) => {
  const map = useMap();
  const drawRef = useRef<TerraDraw | null>(null);
  const [draw, setDraw] = useState<TerraDraw | null>(null);

  useEffect(() => {
    // Only initialize once per map instance.
    if (!map || drawRef.current) return;

    let isCancelled = false;
    let listener: google.maps.MapsEventListener | null = null;

    const initialize = () => {
      if (drawRef.current || isCancelled) return;

      const drawInstance = new TerraDraw({
        adapter: new TerraDrawGoogleMapsAdapter({
          map,
          lib: google.maps,
          coordinatePrecision: 9
        }),
        modes: createTerraDrawModes("#E11D24")
      });

      drawInstance.start();

      // Listen for the 'finish' event - fired when a feature is completed, both created and dragged
      drawInstance.on("finish", (id: string, context: { action: string; mode: string }) => {

          // Filter for point mode only
          if (context.mode === "point") {
              // Get all features
              const snapshot = drawInstance.getSnapshot();
              
              // Find the specific feature that was just drawn
              const drawnFeature = snapshot.find((feature) => feature.id === id);
              
              if (drawnFeature) {
                  const coordinates = drawnFeature.geometry.coordinates;
                  console.debug(logNode + 'Marker overlay complete. Coordinates:', coordinates);
                  // Remove TerraDraw feature FIRST before triggering Mendix update, else two markers are added
                  drawInstance.removeFeatures([id]);

                  // Switch back to static mode to remove the crosshair cursor
                  drawInstance.setMode("static");

                  onMarkerComplete?.(coordinates, drawInstance, "#E11D24");
              }
          } else {
            // Remove the TerraDraw feature so it doesn't stay on the map
            // alongside the custom Mendix marker
            drawInstance.removeFeatures([id]);
          }

      });
      drawRef.current = drawInstance;
      setDraw(drawInstance);
    };

    if (map.getProjection()) {
      initialize();
    } else {
      // TerraDraw needs the projection to be ready before it can attach.
      listener = map.addListener('projection_changed', () => {
        if (!map.getProjection()) return;
        listener?.remove();
        initialize();
      });
    }

    return () => {
      isCancelled = true;
      listener?.remove();
      if (drawRef.current) {
        drawRef.current.stop();
        drawRef.current = null;
      }
      setDraw(null);
    };
  }, [map]);

  return draw;
};
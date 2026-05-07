import { createElement } from "react";
import {ControlPosition, MapControl} from '@vis.gl/react-google-maps';
import { LEGEND_TOGGLE_ICON } from './Legend';

import {SearchBox, SearchBoxProps} from './SearchBox';


interface CustomSearchBoxControlProps extends SearchBoxProps {
  controlPosition: ControlPosition;
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
};

interface ActionButtonsMapControlProps {
  controlPosition: ControlPosition;
  showRecenter: boolean;
  showUndo: boolean;
  showRedo: boolean;
  showLegend: boolean;
  undoStepCount: number;
  redoStepCount: number;
  onRecenter: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleLegend: () => void;
}

export const CustomMapControl = ({
    controlPosition,
    onPlaceSelect,
    onSearchBoxMounted, 
    center,
    placeholder
}: CustomSearchBoxControlProps) => {

  return (
    <MapControl position={controlPosition}>
      <div className="searchbox-control">
          <SearchBox 
            onPlaceSelect={onPlaceSelect}
            onSearchBoxMounted={onSearchBoxMounted}
            center={center}
            placeholder={placeholder}
             />
      </div>
    </MapControl>
  );
};

export const ActionButtonsMapControl = ({
  controlPosition,
  showRecenter,
  showUndo,
  showRedo,
  showLegend,
  undoStepCount,
  redoStepCount,
  onRecenter,
  onUndo,
  onRedo,
  onToggleLegend
}: ActionButtonsMapControlProps) => {
  if (!showRecenter && !showUndo && !showRedo && !showLegend) {
    return null;
  }

  return (
    <MapControl position={controlPosition}>
      <div className="gm-actions-control-offset">
        <div className="gm-actions-control">
          {showLegend && (
            <button
              onClick={onToggleLegend}
              title="Toggle legend"
              aria-label="Toggle legend"
              type="button"
              className="gm-control-active gm-layer-control"
            >
              <img src={LEGEND_TOGGLE_ICON} className="gm-legend-icon" />
            </button>
          )}
          {showRecenter && (
            <button
              onClick={onRecenter}
              title="Recenter map"
              aria-label="Recenter map"
              type="button"
              className="gm-control-active gm-recenter-control"
            >
              📍
            </button>
          )}
          {(showUndo || showRedo) && (
            <div className="gm-actions-history-row">
              {showUndo && (
                <button
                  onClick={onUndo}
                  title={`Undo available: ${undoStepCount}`}
                  aria-label={`Undo available: ${undoStepCount}`}
                  type="button"
                  className="gm-control-active gm-recenter-control gm-history-control"
                >
                  <span className="gm-history-icon">↶</span>
                  <span className="gm-history-count">- {undoStepCount}</span>
                </button>
              )}
              {showRedo && (
                <button
                  onClick={onRedo}
                  title={`Redo available: ${redoStepCount}`}
                  aria-label={`Redo available: ${redoStepCount}`}
                  type="button"
                  className="gm-control-active gm-recenter-control gm-history-control"
                >
                  <span className="gm-history-icon">↷</span>
                  <span className="gm-history-count">+ {redoStepCount}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </MapControl>
  );
};

import React from "react";
import type {TerraDraw} from 'terra-draw';

import {TerraDrawModeId} from './TerraDrawConfig';

type DrawingControlsProps = {
  draw: TerraDraw | null;
  editable: boolean;
};

const DEFAULT_MODE: TerraDrawModeId = 'point';

const DrawingControls = ({draw, editable}: DrawingControlsProps) => {
  const [activeMode, setActiveMode] = React.useState<TerraDrawModeId>('static');

  React.useEffect(() => {
    if (!draw) return;

    // Guard: TerraDraw must be enabled (started) before calling setMode
    if (!draw.enabled) return;

    if (!editable) {
      draw.setMode('static');
      setActiveMode('static');
      return;
    }

    // Only switch to draw mode if currently static
    if (activeMode === 'static') {
      draw.setMode(DEFAULT_MODE);
      setActiveMode(DEFAULT_MODE);
    }
  }, [draw, editable]);

  return null;
};

export default React.memo(DrawingControls);
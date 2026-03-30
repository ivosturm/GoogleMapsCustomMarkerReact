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

    if (!editable) {
      // Keep TerraDraw in static mode when not editable, no cursor changes
      draw.setMode('static');
      setActiveMode('static');
      return;
    }

    if (activeMode !== 'static') return;

    // Start in default mode once TerraDraw is ready and widget is editable
    draw.setMode(DEFAULT_MODE);
    setActiveMode(DEFAULT_MODE);
  }, [draw, editable]);

  return null;
};

export default React.memo(DrawingControls);
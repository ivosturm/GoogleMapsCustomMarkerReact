/** @jsx React.createElement */
import React, { Fragment } from 'react';
import {Position} from 'geojson';

import {useTerraDraw} from './useTerraDraw';
import { TerraDraw } from 'terra-draw';

type TerraDrawLayerProps = {
  children: (draw: ReturnType<typeof useTerraDraw>) => React.ReactNode;
  onMarkerComplete?: (position: Position | Position[] | Position[][], draw: TerraDraw) => void;
};

const TerraDrawLayer = ({children, onMarkerComplete}: TerraDrawLayerProps & {onMarkerComplete?: (position: Position | Position[] | Position[][], draw: TerraDraw) => void}) => {
  const draw = useTerraDraw(onMarkerComplete);

  return <>{children(draw)}</>;
};

export default React.memo(TerraDrawLayer);
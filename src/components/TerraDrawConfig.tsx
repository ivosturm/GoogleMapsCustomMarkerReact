import {
  TerraDrawPointMode,
  TerraDrawSelectMode
} from 'terra-draw';
import { HexColorStyling } from 'terra-draw/dist/common';

export type TerraDrawModeId =
  | 'select'
  | 'point'
  | 'static';

export const DRAWING_MODE_BUTTONS: Array<{id: TerraDrawModeId; label: string}> =
  [
    {id: 'select', label: 'Select'},
    {id: 'point', label: 'Point'}
  ];


const createPointStyles = (color: HexColorStyling) => ({
  pointColor: color,
  pointOpacity: 0.7,
  pointOutlineColor: "#FFFFFF" as HexColorStyling,
  pointOutlineOpacity: 1,
  pointOutlineWidth: 5
});


// Centralized mode factory to keep UI and TerraDraw configuration in sync.
export const createTerraDrawModes = (color: HexColorStyling) => [
  new TerraDrawSelectMode({
    flags: {
      point: {
        feature: {
          draggable: true,
          rotateable: true
        }
      }
    }
  }),
  new TerraDrawPointMode({
    editable: true,
    styles: createPointStyles(color)
  }) 
];
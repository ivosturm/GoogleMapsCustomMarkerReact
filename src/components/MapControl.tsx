import { createElement } from 'react';
import {ControlPosition, MapControl} from '@vis.gl/react-google-maps';

import {SearchBox, SearchBoxProps} from './SearchBox';


interface CustomSearchBoxControlProps extends SearchBoxProps {
  controlPosition: ControlPosition;
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
};

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
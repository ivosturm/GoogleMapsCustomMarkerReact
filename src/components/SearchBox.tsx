import React, {useRef, useEffect, useState } from 'react';
import {useMapsLibrary} from '@vis.gl/react-google-maps';
import { PositionProps } from './MarkerUtils';

export interface SearchBoxProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  onSearchBoxMounted: (searchBox: google.maps.places.SearchBox) => void;
  center?: PositionProps;
  placeholder?: string;
}

export const SearchBox = ({onPlaceSelect, onSearchBoxMounted, center, placeholder}: SearchBoxProps) => {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  const logNode = "Google Maps Custom Marker (React) widget: SearchBox: ";

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const defaultBounds = new google.maps.LatLngBounds(center);

    const options = {bounds: defaultBounds, placeholder: placeholder};
    const searchBoxInstance = new places.SearchBox(inputRef.current, options);
    console.debug(logNode + "searchBox created");
    setSearchBox(searchBoxInstance);
    onSearchBoxMounted(searchBoxInstance);
  }, [places]);

  useEffect(() => {
    if (!searchBox) return;

  }, [onPlaceSelect, searchBox]);

  return (
    <div className="searchbox-container" >
      <input id="pac-input" ref={inputRef} placeholder={placeholder} />
    </div>
  )
};

import React, { memo} from 'react';
import {Feature, Point} from 'geojson';
import { InfoWindow } from '@vis.gl/react-google-maps';

type InfowindowContentProps = {
  features: Feature<Point>[];
  text: string;
};

const numFmt = new Intl.NumberFormat();

export const InfoWindowContent = memo(({features, text}: InfowindowContentProps) => {
  if (features.length === 1) {
    const f = features[0];
    const props = f.properties! as any;
    console.dir(props)

    return (
      <InfoWindow></InfoWindow>  
    );
  }

  return (
    <div>
      <h4>{numFmt.format(features.length)} {text}</h4>

      <ul>
        {features.slice(0, 5).map(feature => {
          const props = feature.properties! as any;

          return (
            <li key={feature.id}>
              <span>
                {props.name}
              </span>
            </li>
          );
        })}

        {features.length > 5 && (
          <li>and {numFmt.format(features.length - 5)} more.</li>
        )}
      </ul>
    </div>
  );
});

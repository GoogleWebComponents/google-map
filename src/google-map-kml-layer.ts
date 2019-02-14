// <!-- Copyright (c) 2015 Google Inc. All rights reserved. -->

import { GoogleMapChildElement, customElement, property } from './lib/google-map-child-element.js';

@customElement('google-map-kml-layer')
export class GoogleMapKmlLayer extends GoogleMapChildElement {
  @property()
  url?: string;
}

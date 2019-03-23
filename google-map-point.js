/* Copyright (c) 2015 Google Inc. All rights reserved. */
/*
The `google-map-point` element represents a point on a map. It's used as a child of other
google-map-* elements.

<b>Example</b>—points defining a semi-translucent blue triangle:

    <google-map latitude="37.77493" longitude="-122.41942">
      <google-map-poly closed fill-color="blue" fill-opacity=".5">
        <google-map-point latitude="36.77493" longitude="-121.41942"></google-map-point>
        <google-map-point latitude="38.77493" longitude="-122.41942"></google-map-point>
        <google-map-point latitude="36.77493" longitude="-123.41942"></google-map-point>
      </google-map-poly>
    </google-map>
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '@google-web-components/google-apis/google-maps-api.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer({
  is: 'google-map-point',

  hostAttributes: {hidden: true},

  properties: {
    /**
     * The point's longitude coordinate.
     */
    longitude: {
      type: Number,
      value: null
    },

    /**
     * The point's latitude coordinate.
     */
    latitude: {
      type: Number,
      value: null
    }
  },

  /**
   * Returns the point as a Google Maps LatLng object.
   *
   * @return {google.maps.LatLng} The LatLng object.
   */
  getPosition: function() {
    return new google.maps.LatLng(this.latitude, this.longitude);
  }
});

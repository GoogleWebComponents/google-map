/* Copyright (c) 2015 Google Inc. All rights reserved. */
/*
Provides the Google Maps API Directions Service to provide directions
between a `startAddress` and `endAddress`.

See https://developers.google.com/maps/documentation/javascript/directions for more
information on the API.

#### Example:

    <template is="dom-bind">
      <google-map-directions map="{{map}}"
          start-address="San Francisco"
          end-address="Mountain View"
          travel-mode="BICYCLING"
          waypoints='[{"location": "Palo Alto"}, {"location": "San Mateo"}]'></google-map-directions>
      <google-map map="{{map}}" latitude="37.779"
                  longitude="-122.3892"></google-map>
    </template>

*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '@google-web-components/google-apis/google-maps-api.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: none;
      }
    </style>

    <google-maps-api api-key="[[apiKey]]" language="[[language]]" on-api-load="_mapApiLoaded" maps-url="[[mapsUrl]]">
    </google-maps-api>
`,

  is: 'google-map-directions',

  /**
   * Fired whenever the directions service returns a result.
   *
   * @event google-map-response
   * @param {{response: Object}} detail
   */

  /**
   * Polymer properties for the google-map-directions custom element.
   */
  properties: {
    /**
     * A Maps API key. To obtain an API key, see developers.google.com/maps/documentation/javascript/tutorial#api_key.
     */
    apiKey: String,

    /**
     * Overrides the origin the Maps API is loaded from. Defaults to `https://maps.googleapis.com`.
     */
    mapsUrl: {
      type: String
      // Initial value set in google-maps-api.
    },

    /**
     * The Google map object.
     *
     * @type google.maps.Map
     */
    map: {
      type: Object,
      observer: '_mapChanged'
    },

    /**
     * Start address or latlng to get directions from.
     *
     * @type string|google.maps.LatLng
     */
    startAddress: {
      type: String,
      value: null
    },

    /**
     * End address or latlng for directions to end.
     *
     * @type string|google.maps.LatLng
     */
    endAddress: {
      type: String,
      value: null
    },

    /**
     * Travel mode to use.  One of 'DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT'.
     */
    travelMode: {
      type: String,
      value: 'DRIVING'
    },

    /**
     * Array of intermediate waypoints. Directions will be calculated
     * from the origin to the destination by way of each waypoint in this array.
     * The maximum allowed waypoints is 8, plus the origin, and destination.
     * Maps API for Business customers are allowed 23 waypoints,
     * plus the origin, and destination.
     * Waypoints are not supported for transit directions. Optional.
     *
     * @type Array<google.maps.DirectionsWaypoint>
     */
     waypoints: {
       type: Array,
       value: function() { return []; }
     },

    /**
     * The localized language to load the Maps API with. For more information
     * see https://developers.google.com/maps/documentation/javascript/basics#Language
     *
     * Note: the Maps API defaults to the preffered language setting of the browser.
     * Use this parameter to override that behavior.
     */
    language: {
      type: String,
      value: null
    },

    /**
     * Options for the display of results
     */
    rendererOptions: {
      type: Object,
      value: function() { return {}; }
    },

    /**
     * The response from the directions service.
     *
     */
    response: {
      type: Object,
      observer: '_responseChanged',
      notify: true
    }
  },

  observers: [
    '_route(startAddress, endAddress, travelMode, waypoints.*)'
  ],

  _mapApiLoaded: function() {
    this._route();
  },

  _responseChanged: function() {
    if (this.directionsRenderer && this.response) {
      this.directionsRenderer.setDirections(this.response);
    }
  },

  _mapChanged: function() {
    if (this.map && this.map instanceof google.maps.Map) {
      if (!this.directionsRenderer) {
        this.directionsRenderer = new google.maps.DirectionsRenderer(this.rendererOptions);
      }
      this.directionsRenderer.setMap(this.map);
      this._responseChanged();
    } else {
      // If there is no more map, remove the directionsRenderer from the map and delete it.
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
        this.directionsRenderer = null;
      }
    }
  },

  _route: function() {
    // Abort attempts to _route if the API is not available yet or the
    // required attributes are blank.
    if (typeof google == 'undefined' || typeof google.maps == 'undefined' ||
        !this.startAddress || !this.endAddress) {
      return;
    }

    // Construct a directionsService if necessary.
    // Wait until here where the maps api has loaded and directions are actually needed.
    if (!this.directionsService) {
      this.directionsService = new google.maps.DirectionsService();
    }

    var request = {
      origin: this.startAddress,
      destination: this.endAddress,
      travelMode: this.travelMode,
      waypoints: this.waypoints
    };
    this.directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        this.response = response;
        this.fire('google-map-response', {response: response});
      }
    }.bind(this));
  }
});

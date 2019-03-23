/* Copyright (c) 2015 Google Inc. All rights reserved. */
/*
`google-map-search` provides Google Maps Places API functionality.

See https://developers.google.com/maps/documentation/javascript/places for more
information on the API.

#### Example:

    <template is="dom-bind">
      <google-map-search map="[[map]]" query="Pizza" results="{{results}}">
      </google-map-search>
      <google-map map="{{map}}" latitude="37.779"
                  longitude="-122.3892">
        <template is="dom-repeat" items="{{results}}" as="marker">
          <google-map-marker latitude="{{marker.latitude}}"
                             longitude="{{marker.longitude}}">
            <h2>{{marker.name}}</h2>
            <span>{{marker.formatted_address}}</span>
          </google-map-marker>
        </template>
      </google-map>
    </template>
 */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer({
  is: 'google-map-search',

  properties: {
    /**
     * The Google map object.
     *
     * @type google.maps.Map
     */
    map: {
      type: Object,
      value: null
    },

    /**
     * The search query.
     */
    query: {
      type: String,
      value: null
    },

    /**
     * Latitude of the center of the search area.
     * Ignored if `globalSearch` is true.
     */
    latitude: {
      type: Number,
      value: null
    },

    /**
     * Longitude of the center of the search area.
     * Ignored if `globalSearch` is true.
     */
    longitude: {
      type: Number,
      value: null
    },

    /**
     * Search radius, in meters.
     * If `latitude` and `longitude` are not specified,
     * the center of the currently visible map area is used.
     *
     * If not set, search will be restricted to the currently visible
     * map area, unless `globalSearch` is set to true.
     */
    radius: {
      type: Number,
      value: null
    },

    /**
     * By default, search is restricted to the currently visible map area.
     * Set this to true to search everywhere.
     *
     * Ignored if `radius` is set.
     */
    globalSearch: {
      type: Boolean,
      value: false
    },

    /**
     * Space-separated list of result types.
     * The search will only return results of the listed types.
     * See https://developers.google.com/places/documentation/supported_types
     * for a list of supported types.
     * Leave empty or null to search for all result types.
     */
    types: {
      type: String,
      value: null
    },

    /**
     * The search results.
     */
    results: {
      type: Array,
      value: function() { return []; },
      notify: true
    },

    /**
     * The lat/lng location.
     */
    location: {
      type: Object,
      value: null,
      readOnly: true
    }
  },

  observers: [
    'search(query,map,location,radius,types,globalSearch)',
    '_updateLocation(latitude,longitude)'
  ],

  /**
   * Fired when the details of a place are returned.
   *
   * @event google-map-search-place-detail
   * @param {google.maps.MarkerPlace} detail The place details.
   */

  /**
   * Fired when the search element returns a result.
   *
   * @event google-map-search-results
   * @param {Array<{latitude: number, longitude: number}>} detail An array of search results
   */

  /**
   * Perform a search using for `query` for the search term.
   */
  search: function() {
    if (this.query && this.map) {
      var places = new google.maps.places.PlacesService(this.map);

      if (this.types && typeof this.types == 'string') {
        var types = this.types.split(' ');
      }
      if (this.radius) {
        var radius = this.radius;
        var location = this.location ? this.location : this.map.getCenter();
      } else if (!this.globalSearch) {
        var bounds = this.map.getBounds();
      }
      places.textSearch({
        query: this.query,
        types: types,
        bounds: bounds,
        radius: radius,
        location: location
      }, this._gotResults.bind(this));
    }
  },

  /**
   * Fetches details for a given place.
   *
   * @param {String} placeId The place id.
   * @return {Promise} place The place information.
   */
  getDetails: function(placeId) {
    var places = new google.maps.places.PlacesService(this.map);

    return new Promise(function(resolve, reject) {
      places.getDetails({placeId: placeId}, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
          this.fire('google-map-search-place-detail', place);
        } else {
          reject(status);
        }
      }.bind(this));
    }.bind(this));
  },

  _gotResults: function(results, status) {
    this.results = results.map(function(result) {
      // obtain lat/long from geometry
      result.latitude  = result.geometry.location.lat();
      result.longitude = result.geometry.location.lng();
      return result;
    });
    this.fire('google-map-search-results', this.results);
  },

  _updateLocation: function() {
    if (!this.map) {
      return;
    } else if (typeof this.latitude !== 'number' || isNaN(this.latitude)) {
      throw new TypeError('latitude must be a number');
    } else if (typeof this.longitude !== 'number' || isNaN(this.longitude)) {
      throw new TypeError('longitude must be a number');
    }

    // Update location. This will trigger a new search.
    this._setLocation({lat: this.latitude, lng: this.longitude});
  }
});

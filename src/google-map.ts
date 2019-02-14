/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {LitElement, html, PropertyValues, css} from 'lit-element';
import {customElement, property, query} from 'lit-element/lib/decorators.js';
import {loadGoogleMapsAPI} from './maps-api.js';
import { GoogleMapMarker } from './google-map-marker.js';
import { Deferred } from './lib/deferred.js';

const mapEvents = [
  'bounds_changed',
  'center_changed',
  'click',
  'dblclick',
  'drag',
  'dragend',
  'dragstart',
  'heading_changed',
  'idle',
  'maptypeid_changed',
  'mousemove',
  'mouseout',
  'mouseover',
  'projection_changed',
  'rightclick',
  'tilesloaded',
  'tilt_changed',
  'zoom_changed'
];

/**
 * The `google-map` element renders a Google Map.
 * 
 * <b>Example</b>:
 * 
 *     <style>
 *       google-map {
 *         height: 600px;
 *       }
 *     </style>
 *     <google-map latitude="37.77493" longitude="-122.41942" api-key="1234"></google-map>
 * 
 * <b>Example</b> - add markers to the map and ensure they're in view:
 * 
 *     <google-map latitude="37.77493" longitude="-122.41942" fit-to-markers>
 *       <google-map-marker latitude="37.779" longitude="-122.3892"
 *           draggable="true" title="Go Giants!"></google-map-marker>
 *       <google-map-marker latitude="37.777" longitude="-122.38911"></google-map-marker>
 *     </google-map>
 * 
 * <b>Example</b>:
 * 
 *     <google-map disable-default-ui zoom="15"></google-map>
 *     <script>
 *       var map = document.querySelector('google-map');
 *       map.latitude = 37.77493;
 *       map.longitude = -122.41942;
 *       map.addEventListener('google-map-ready', function(e) {
 *         alert('Map loaded!');
 *       });
 *     </script>
 * 
 * <b>Example</b> - with Google directions, using data-binding inside another
 * Polymer element
 * 
 *     <google-map map="{{map}}"></google-map>
 *     <google-map-directions map="[[map]]"
 *         start-address="San Francisco" end-address="Mountain View">
 *     </google-map-directions>
 * 
 * Disable dragging by adding `draggable="false"` on the `google-map` element.
 * 
 * <b>Example</b> - loading the Maps API from another origin (China)
 * 
 *     <google-map maps-url="http://maps.google.cn/maps/api/js?callback=%%callback%%">
 * 
 * ###  Tips
 * 
 * If you're seeing the message "You have included the Google Maps API multiple
 * times on this page. This may cause unexpected errors." it probably means
 * you're loading other maps elements on the page (`<google-maps-directions>`).
 * Each maps element must include the same set of configuration options
 * (`apiKey`, `clientId`, `language`, `version`, etc.) so the Maps API is loaded
 * from the same URL.
 * 
 * @demo demo/index.html
 * @demo demo/polys.html
 * @demo demo/kml.html
 */
@customElement('google-map')
export class GoogleMap extends LitElement {

  /**
   * Fired when the Maps API has fully loaded.
   *
   * @event google-map-ready
   */

  /**
   * Fired when the user clicks on the map (but not when they click on a marker, infowindow, or
   * other object). Requires the clickEvents attribute to be true.
   *
   * @event google-map-click
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the user double-clicks on the map. Note that the google-map-click event will also fire,
   * right before this one. Requires the clickEvents attribute to be true.
   *
   * @event google-map-dblclick
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired repeatedly while the user drags the map. Requires the dragEvents attribute to be true.
   *
   * @event google-map-drag
   */

  /**
   * Fired when the user stops dragging the map. Requires the dragEvents attribute to be true.
   *
   * @event google-map-dragend
   */

  /**
   * Fired when the user starts dragging the map. Requires the dragEvents attribute to be true.
   *
   * @event google-map-dragstart
   */

  /**
   * Fired whenever the user's mouse moves over the map container. Requires the mouseEvents attribute to
   * be true.
   *
   * @event google-map-mousemove
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the user's mouse exits the map container. Requires the mouseEvents attribute to be true.
   *
   * @event google-map-mouseout
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the user's mouse enters the map container. Requires the mouseEvents attribute to be true.
   *
   * @event google-map-mouseover
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the DOM `contextmenu` event is fired on the map container. Requires the clickEvents
   * attribute to be true.
   *
   * @event google-map-rightclick
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the map becomes idle after panning or zooming.
   *
   * @event google-map-idle
   */

  /**
   * A Maps API key. To obtain an API key, see https://developers.google.com/maps/documentation/javascript/tutorial#api_key.
   */
  @property({attribute: 'api-key'})
  apiKey?: string;

  /**
   * Version of the Google Maps API to use.
   */
  @property({attribute: 'api-version'})
  apiVersion = '3.33';

  /**
   * Overrides the origin the Maps API is loaded from. Defaults to `https://maps.googleapis.com`.
   */
  @property()
  mapsUrl?: string;

  /**
   * A Maps API for Business Client ID. To obtain a Maps API for Business Client ID, see https://developers.google.com/maps/documentation/business/.
   * If set, a Client ID will take precedence over an API Key.
   */
  @property({attribute: 'client-id'})
  clientId?: string;

  /**
   * A latitude to center the map on.
   */
  @property({type: Number})
  latitude: number = 37.77493;

  /**
   * A longitude to center the map on.
   */
  @property({type: Number})
  longitude: number = -122.41942;

  /**
   * A zoom level to set the map to.
   */
  @property({type: Number})
  zoom: number = 10;

  /**
   * A Maps API object.
   */
  map?: google.maps.Map;

  @property({type: Number})
  tilt?: number;

  /**
   * Map type to display. One of 'roadmap', 'satellite', 'hybrid', 'terrain'.
   */
  @property({type: String, reflect: true})
  mapTypeId: google.maps.MapTypeId|'roadmap' | 'satellite' | 'hybrid' | 'terrain' = 'roadmap';

  /**
   * If set, removes the map's default UI controls.
   */
  @property({type: Boolean, attribute: 'disable-default-ui'})
  disableDefaultUI?: boolean;

  @property({type: Boolean, attribute: 'map-type-control'})
  mapTypeControl?: boolean;

  @property({type: Boolean, attribute: 'street-view-control'})
  streetViewControl?: boolean;

  /**
   * If set, the zoom level is set such that all markers (google-map-marker children) are brought into view.
   */
  @property({type: Boolean, attribute: 'fit-to-markers'})
  fitToMarkers = false;

  /**
   * If true, prevent the user from zooming the map interactively.
   */
  @property({type: Boolean, attribute: 'disable-zoom'})
  disableZoom = false;

  /**
   * If set, custom styles can be applied to the map.
   * For style documentation see https://developers.google.com/maps/documentation/javascript/reference#MapTypeStyle
   */
  @property({type: Object})
  styles?: google.maps.MapTypeStyle[];

  /**
   * A maximum zoom level which will be displayed on the map.
   */
  @property({type: Number, attribute: 'max-zoom'})
  maxZoom?: number;

  /**
   * A minimum zoom level which will be displayed on the map.
   */
  @property({type: Number, attribute: 'min-zoom'})
  minZoom?: number;

  /**
   * If true, sign-in is enabled.
   * See https://developers.google.com/maps/documentation/javascript/signedin#enable_sign_in
   */
  // signedIn: {
  //   type: Boolean,
  //   value: false
  // },

  /**
   * The localized language to load the Maps API with. For more information
   * see https://developers.google.com/maps/documentation/javascript/basics#Language
   *
   * Note: the Maps API defaults to the preffered language setting of the browser.
   * Use this parameter to override that behavior.
   */
  @property()
  language?: string;

  /**
   * Additional map options for google.maps.Map constructor.
   * Use to specify additional options we do not expose as
   * properties.
   * Ex: `<google-map additional-map-options='{"mapTypeId":"satellite"}'>`
   *
   * Note, you can't use API enums like `google.maps.ControlPosition.TOP_RIGHT`
   * when using this property as an HTML attribute. Instead, use the actual
   * value (e.g. `3`) or set `.options` in JS rather than using
   * the attribute.
   */
  @property({type: Object})
  options: any;

  /**
   * The markers on the map.
   */
  markers: Array<GoogleMapMarker> = [];

  /**
   * The non-marker objects on the map.
   */
  readonly objects!: Array<any>;

  /**
   * If set, all other info windows on markers are closed when opening a new one.
   */
  @property({type: Boolean, attribute: 'single-info-window'})
  singleInfoWindow = false;

  @query('#map')
  private _mapDiv!: HTMLDivElement;

  @query('slot')
  private _slot!: HTMLSlotElement;

  private _markersChildrenListener?: EventListener;

  private _mapReadyDeferred = new Deferred<google.maps.Map>();

  static styles = css`
    :host {
      position: relative;
      display: block;
      height: 100%;
    }
    #map {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  `;

  render() {
    return html`
      <div id="map"></div>
      <slot @google-map-marker-open=${this._onMarkerOpen}></slot>
  `;
  }

  protected update(changedProperties: PropertyValues) {
    if (changedProperties.has('apiKey')) {
      this._initGMap();
    }
    // Re-set options every update.
    // TODO(justinfagnani): Check to see if this hurts perf
    if (this.map !== undefined) {
      this.map.setOptions(this._getMapOptions());
    }
    super.update(changedProperties);
  }

  constructor() {
    super();
    // Respond to child elements requesting a Map instance
    this.addEventListener('google-map-get-map-instance', (e: Event) => {
      console.log('google-map google-map-get-map-instance');
      const detail = (e as CustomEvent).detail;
      detail.mapReady = this._mapReadyDeferred.promise;
    });
    // TODO(justinfagnani): Now that children register thmselves, figure out
    // when to call this._fitToMarkersChanged(), or remove the feature
  }

  private async _initGMap() {
    if (this.map !== undefined) {
      return;
    }
    // TODO(justinfagnani): support a global API as well - a singleton API
    // instance shared for the whole window, where each element doesn't need
    // its own API key.
    await loadGoogleMapsAPI(this.apiKey);

    this.map = new google.maps.Map(this._mapDiv, this._getMapOptions());
    this._updateCenter();
    mapEvents.forEach((event) => this._forwardEvent(event));
    this.dispatchEvent(new CustomEvent('google-map-ready'));
    this._mapReadyDeferred.resolve(this.map);
  }

  private _getMapOptions(): google.maps.MapOptions {
    return {
      zoom: this.zoom,
      tilt: this.tilt,
      mapTypeId: this.mapTypeId as google.maps.MapTypeId,
      disableDefaultUI: this.disableDefaultUI,
      mapTypeControl: this.mapTypeControl,
      streetViewControl: this.streetViewControl,
      disableDoubleClickZoom: this.disableZoom,
      // scrollwheel: this.scrollWheel,
      styles: this.styles,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      draggable: this.draggable,
      ...this.options,
    };
  }

  private _onMarkerOpen(e: Event) {
    console.log('_onMarkerOpen', e);
  }

  /**
   * Explicitly resizes the map, updating its center. This is useful if the
   * map does not show after you have unhidden it.
   *
   * @method resize
   */
  resize() {
    if (this.map !== undefined) {
      // saves and restores latitude/longitude because resize can move the center
      const oldLatitude = this.latitude;
      const oldLongitude = this.longitude;
      google.maps.event.trigger(this.map, 'resize');
      this.latitude = oldLatitude;  // restore because resize can move our center
      this.longitude = oldLongitude;

      if (this.fitToMarkers) { // we might not have a center if we are doing fit-to-markers
        this._fitToMarkersChanged();
      }
    }
  }

  private _updateCenter() {
    console.log('_updateCenter');
    if (this.map !== undefined && this.latitude !== undefined && this.longitude !== undefined) {
      const newCenter = new google.maps.LatLng(this.latitude, this.longitude);
      let oldCenter = this.map.getCenter();

      if (oldCenter === undefined) {
        // If the map does not have a center, set it right away.
        this.map.setCenter(newCenter);
      } else {
        // Using google.maps.LatLng returns corrected lat/lngs.
        oldCenter = new google.maps.LatLng(oldCenter.lat(), oldCenter.lng());

        // If the map currently has a center, slowly pan to the new one.
        if (!oldCenter.equals(newCenter)) {
          this.map.panTo(newCenter);
        }
      }
    }
  }

  private _fitToMarkersChanged() {
    // TODO(ericbidelman): respect user's zoom level.

    if (this.map && this.fitToMarkers && this.markers.length > 0) {
      const latLngBounds = new google.maps.LatLngBounds();
      for (const m of this.markers) {
        latLngBounds.extend(
            new google.maps.LatLng(m.latitude!, m.longitude!));
      }

      // For one marker, don't alter zoom, just center it.
      if (this.markers.length > 1) {
        this.map.fitBounds(latLngBounds);
      }

      this.map.setCenter(latLngBounds.getCenter());
    }
  }

  /**
   * Forwards Maps API events as DOM CustomEvents
   */
  private _forwardEvent(name: string) {
    google.maps.event.addListener(this.map!, name, (event: Event) => {
      this.dispatchEvent(new CustomEvent(`google-map-${name}`, {
        detail: {
          mapsEvent: event,
        }
      }));
    });
  }

  // private _deselectMarker(e: Event, _detail: unknown) {
  //   // If singleInfoWindow is set, update iron-selector's selected attribute to be null.
  //   // Else remove the marker from iron-selector's selected array.
  //   var markerIndex = this.$.selector.indexOf(e.target);

  //   if (this.singleInfoWindow) {
  //     this.$.selector.selected = null;
  //   } else if (this.$.selector.selectedValues) {
  //     this.$.selector.selectedValues = this.$.selector.selectedValues.filter((i: number) => i !== markerIndex);
  //   }
  // }
}

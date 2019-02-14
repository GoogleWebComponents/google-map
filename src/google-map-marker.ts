// <!-- Copyright (c) 2015 Google Inc. All rights reserved. -->

import { GoogleMapChildElement, html, customElement, property } from './lib/google-map-child-element.js';

const markerEvents = [
  'animation_changed',
  'click',
  'clickable_changed',
  'cursor_changed',
  'dblclick',
  'drag',
  'dragend',
  'draggable_changed',
  'dragstart',
  'flat_changed',
  'icon_changed',
  'mousedown',
  'mouseout',
  'mouseover',
  'mouseup',
  'position_changed',
  'rightclick',
  'shape_changed',
  'title_changed',
  'visible_changed',
  'zindex_changed',
];

/**
 * The `google-map-marker` element represents a map marker. It is used as a
 * child of `google-map`.
 * 
 * <b>Example</b>:
 * 
 *     <google-map latitude="37.77493" longitude="-122.41942">
 *       <google-map-marker latitude="37.779" longitude="-122.3892"
 *           title="Go Giants!"></google-map-marker>
 *     </google-map>
 * 
 * <b>Example</b> - marker with info window (children create the window content):
 * 
 *     <google-map-marker latitude="37.77493" longitude="-122.41942">
 *       <img src="image.png">
 *     </google-map-marker>
 * 
 * <b>Example</b> - a draggable marker:
 * 
 *     <google-map-marker latitude="37.77493" longitude="-122.41942"
 *          draggable="true"></google-map-marker>
 * 
 * <b>Example</b> - hide a marker:
 * 
 *     <google-map-marker latitude="37.77493" longitude="-122.41942"
 *         hidden></google-map-marker>
 * 
 */
@customElement('google-map-marker')
export class GoogleMapMarker extends GoogleMapChildElement {

  /**
   * Fired when the marker icon was clicked. Requires the clickEvents attribute to be true.
   *
   * @param {google.maps.MouseEvent} event The mouse event.
   * @event google-map-marker-click
   */

  /**
   * Fired when the marker icon was double clicked. Requires the clickEvents attribute to be true.
   *
   * @param {google.maps.MouseEvent} event The mouse event.
   * @event google-map-marker-dblclick
   */

  /**
   * Fired repeatedly while the user drags the marker. Requires the dragEvents attribute to be true.
   *
   * @event google-map-marker-drag
   */

  /**
   * Fired when the user stops dragging the marker. Requires the dragEvents attribute to be true.
   *
   * @event google-map-marker-dragend
   */

  /**
   * Fired when the user starts dragging the marker. Requires the dragEvents attribute to be true.
   *
   * @event google-map-marker-dragstart
   */

  /**
   * Fired for a mousedown on the marker. Requires the mouseEvents attribute to be true.
   *
   * @event google-map-marker-mousedown
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the DOM `mousemove` event is fired on the marker. Requires the mouseEvents
   * attribute to be true.
   *
   * @event google-map-marker-mousemove
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the mouse leaves the area of the marker icon. Requires the mouseEvents attribute to be
   * true.
   *
   * @event google-map-marker-mouseout
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the mouse enters the area of the marker icon. Requires the mouseEvents attribute to be
   * true.
   *
   * @event google-map-marker-mouseover
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired for a mouseup on the marker. Requires the mouseEvents attribute to be true.
   *
   * @event google-map-marker-mouseup
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired for a rightclick on the marker. Requires the clickEvents attribute to be true.
   *
   * @event google-map-marker-rightclick
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when an infowindow is opened.
   *
   * @event google-map-marker-open
   */

  /**
   * Fired when the close button of the infowindow is pressed.
   *
   * @event google-map-marker-close
   */

  /**
   * A Google Maps marker object.
   *
   * @type google.maps.Marker
   */
  marker?: google.maps.Marker;

  /**
   * A Google Map Infowindow object.
   *
   * @type {?Object}
   */
  infoWindow?: google.maps.InfoWindow;

  /**
   * When true, marker *click events are automatically registered.
   */
  @property({type: Boolean})
  clickEvents = false;

  /**
   * When true, marker drag* events are automatically registered.
   */
  @property({type: Boolean})
  dragEvents = false;

  /**
   * When true, marker mouse* events are automatically registered.
   */
  @property({type: Boolean})
  mouseEvents = false;

  /**
   * Image URL for the marker icon.
   *
   * @type string|google.maps.Icon|google.maps.Symbol
   */
  @property()
  icon?: string|google.maps.Icon|google.maps.Symbol;

  /**
   * Z-index for the marker icon.
   */
  @property({type: Number})
  zIndex: number = 0;

  /**
   * The marker's latitude coordinate.
   */
  @property({type: Number, reflect: true})
  latitude?: number;

  /**
   * The marker's longitude coordinate.
   */
  @property({type: Number, reflect: true})
  longitude?: number;

  /**
   * The marker's label.
   */
  @property({type: String})
  label?: string;

  /**
   * A animation for the marker. "DROP" or "BOUNCE". See
   * https://developers.google.com/maps/documentation/javascript/examples/marker-animations.
   */
  @property({type: String})
  animation?: google.maps.Animation;

  /**
   * Specifies whether the InfoWindow is open or not
   */
  @property({type: Boolean})
  open = false;

  private _dragHandler?: google.maps.MapsEventListener;
  private _openInfoHandler?: google.maps.MapsEventListener;
  private _closeInfoHandler?: google.maps.MapsEventListener;

  private _listeners?: any;

  // observers: [
  //   '_updatePosition(latitude, longitude)'
  // ],

  constructor() {
    super();
    console.log('google-map-marker');
  }

  update(changedProperties: Map<PropertyKey, any>) {
    if (changedProperties.has('map')) {
      this._mapChanged();
    }
    if (changedProperties.has('open')) {
      this._openChanged();
    }
    super.update(changedProperties);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.marker) {
      google.maps.event.clearInstanceListeners(this.marker);
      this._listeners = {};
      this.marker.setMap(null);
    }
    // if (this._contentObserver) {
    //   this._contentObserver.disconnect();
    // }
  }

  connectedCallback() {
    super.connectedCallback();
    // If element is added back to DOM, put it back on the map.
    if (this.marker) {
      this.marker.setMap(this.map!);
    }
  }

  _updatePosition() {
    if (this.marker && this.latitude !== undefined && this.longitude !== undefined) {
      this.marker.setPosition(new google.maps.LatLng(this.latitude, this.longitude));
    }
  }

  _animationChanged() {
    if (this.marker) {
      this.marker.setAnimation(this.animation === undefined ? null : this.animation);
    }
  }

  _labelChanged() {
    if (this.marker && this.label !== undefined) {
      this.marker.setLabel(this.label);
    }
  }

  _iconChanged() {
    if (this.marker && this.icon !== undefined) {
      this.marker.setIcon(this.icon);
    }
  }

  _zIndexChanged() {
    if (this.marker) {
      this.marker.setZIndex(this.zIndex);
    }
  }

  _mapChanged() {
    console.log('_mapChanged');
    // Marker will be rebuilt, so disconnect existing one from old map and listeners.
    if (this.marker) {
      this.marker.setMap(null);
      google.maps.event.clearInstanceListeners(this.marker);
    }

    if (this.map instanceof google.maps.Map) {
      this._mapReady();
    }
  }

  _contentChanged() {
    // if (this._contentObserver)
    //   this._contentObserver.disconnect();
    // // Watch for future updates.
    // this._contentObserver = new MutationObserver( this._contentChanged.bind(this));
    // this._contentObserver.observe( this, {
    //   childList: true,
    //   subtree: true
    // });

    // TODO(justinfagnani): no, no, no... Use Nodes, not innerHTML.
    const content = this.innerHTML.trim();
    console.log('_contentChanged', content, this.infoWindow);
    if (content) {
      if (!this.infoWindow) {
        // Create a new infowindow
        this.infoWindow = new google.maps.InfoWindow();
        this._openInfoHandler = google.maps.event.addListener(this.marker!, 'click', () => {
          this.open = true;
        });

        this._closeInfoHandler = google.maps.event.addListener(this.infoWindow, 'closeclick', () => {
          this.open = false;
        });
      }
      this.infoWindow.setContent(content);
    } else {
      if (this.infoWindow) {
        // Destroy the existing infowindow.  It doesn't make sense to have an empty one.
        google.maps.event.removeListener(this._openInfoHandler!);
        google.maps.event.removeListener(this._closeInfoHandler!);
        this.infoWindow = undefined;
      }
    }
  }

  _openChanged() {
    if (this.infoWindow) {
      if (this.open) {
        this.infoWindow.open(this.map, this.marker);
        this.dispatchEvent(new CustomEvent('google-map-marker-open'));
      } else {
        this.infoWindow.close();
        this.dispatchEvent(new CustomEvent('google-map-marker-close'));
      }
    }
  }

  // TODO(justinfagnani): call from GoogleMapChildElement
  private _mapReady() {
    console.log('_mapReady');
    this._listeners = {};
    this.marker = new google.maps.Marker({
      map: this.map,
      position: {
        lat: this.latitude!,
        lng: this.longitude!,
      },
      title: this.title,
      animation: this.animation,
      draggable: this.draggable,
      visible: !this.hidden,
      icon: this.icon,
      label: this.label,
      zIndex: this.zIndex
    });
    this._contentChanged();
    markerEvents.forEach((e) => this._forwardEvent(e));
    this._openChanged();
    this._setupDragHandler();
  }

  // TODO(justinfagnani): move to utils / base class
  private _forwardEvent(name: string) {
    this._listeners[name] = google.maps.event.addListener(this.marker!, name, (event: Event) => {
      this.dispatchEvent(new CustomEvent(`google-map-marker-${name}`, {
        detail: {
          mapsEvent: event,
        }
      }));
    });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (!this.marker) {
      return;
    }

    // Cannot use *Changed watchers for native properties.
    switch (name) {
      case 'hidden':
        this.marker.setVisible(!this.hidden);
        break;
      case 'draggable':
        this.marker.setDraggable(this.draggable);
        this._setupDragHandler();
        break;
      case 'title':
        this.marker.setTitle(this.title);
        break;
    }
  }

  /**
   * @this {GoogleMapMarkerElement} This function is called  with .bind(this) in the map
   * marker element below.
   */
  private _setupDragHandler() {
    if (this.draggable) {
      this._dragHandler = google.maps.event.addListener(
          this.marker!, 'dragend', this._onDragEnd);
    } else {
      google.maps.event.removeListener(this._dragHandler!);
      this._dragHandler = undefined;
    }
  }

  /**
   * @this {GoogleMapMarkerElement} This function is called with .bind(this) in setupDragHandler
   *_above.
    */
  private _onDragEnd = (e: google.maps.MouseEvent, _details: unknown, _sender: unknown) => {
    this.latitude = e.latLng.lat();
    this.longitude = e.latLng.lng();
  }
}

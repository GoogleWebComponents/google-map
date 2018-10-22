import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

function setupDragHandler_() {
  if (this.draggable) {
    this.dragHandler_ = google.maps.event.addListener(this.marker, 'dragend', onDragEnd_.bind(this));
  } else {
    google.maps.event.removeListener(this.dragHandler_);
    this.dragHandler_ = null;
  }
}

function onDragEnd_(e, details, sender) {
  this.latitude = e.latLng.lat();
  this.longitude = e.latLng.lng();
}

Polymer({
  _template: html`
    <style>
      :host {
        display: none;
      }
    </style>

    <slot></slot>
`,

  is: 'google-map-marker',

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

  properties: {
    /**
     * A Google Maps marker object.
     *
     * @type google.maps.Marker
     */
    marker: {
      type: Object,
      notify: true,
    },

    /**
     * The Google map object.
     *
     * @type google.maps.Map
     */
    map: {
      type: Object,
      observer: '_mapChanged',
    },

    /**
     * A Google Map Infowindow object.
     *
     * @type {?Object}
     */
    info: {
      type: Object,
      value: null,
    },

    /**
     * When true, marker *click events are automatically registered.
     */
    clickEvents: {
      type: Boolean,
      value: false,
      observer: '_clickEventsChanged',
    },

    /**
     * When true, marker drag* events are automatically registered.
     */
    dragEvents: {
      type: Boolean,
      value: false,
      observer: '_dragEventsChanged',
    },

    /**
     * Image URL for the marker icon.
     *
     * @type string|google.maps.Icon|google.maps.Symbol
     */
    icon: {
      type: Object,
      value: null,
      observer: '_iconChanged',
    },

    /**
     * When true, marker mouse* events are automatically registered.
     */
    mouseEvents: {
      type: Boolean,
      value: false,
      observer: '_mouseEventsChanged',
    },

    /**
     * Z-index for the marker icon.
     */
    zIndex: {
      type: Number,
      value: 0,
      observer: '_zIndexChanged',
    },

    /**
     * The marker's longitude coordinate.
     */
    longitude: {
      type: Number,
      value: null,
      notify: true,
    },

    /**
     * The marker's latitude coordinate.
     */
    latitude: {
      type: Number,
      value: null,
      notify: true,
    },

    /**
     * The marker's label.
     */
    label: {
      type: String,
      value: null,
      observer: '_labelChanged',
    },

    /**
     * A animation for the marker. "DROP" or "BOUNCE". See
     * https://developers.google.com/maps/documentation/javascript/examples/marker-animations.
     */
    animation: {
      type: String,
      value: null,
      observer: '_animationChanged',
    },

    /**
     * Specifies whether the InfoWindow is open or not
     */
    open: {
      type: Boolean,
      value: false,
      observer: '_openChanged',
    },
  },

  observers: [
    '_updatePosition(latitude, longitude)',
  ],

  detached() {
    if (this.marker) {
      google.maps.event.clearInstanceListeners(this.marker);
      this._listeners = {};
      this.marker.setMap(null);
    }
    if (this._contentObserver) { this._contentObserver.disconnect(); }
  },

  attached() {
    // If element is added back to DOM, put it back on the map.
    if (this.marker) {
      this.marker.setMap(this.map);
    }
  },

  _updatePosition() {
    if (this.marker && this.latitude != null && this.longitude != null) {
      this.marker.setPosition(new google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude)));
    }
  },

  _clickEventsChanged() {
    if (this.map) {
      if (this.clickEvents) {
        this._forwardEvent('click');
        this._forwardEvent('dblclick');
        this._forwardEvent('rightclick');
      } else {
        this._clearListener('click');
        this._clearListener('dblclick');
        this._clearListener('rightclick');
      }
    }
  },

  _dragEventsChanged() {
    if (this.map) {
      if (this.dragEvents) {
        this._forwardEvent('drag');
        this._forwardEvent('dragend');
        this._forwardEvent('dragstart');
      } else {
        this._clearListener('drag');
        this._clearListener('dragend');
        this._clearListener('dragstart');
      }
    }
  },

  _mouseEventsChanged() {
    if (this.map) {
      if (this.mouseEvents) {
        this._forwardEvent('mousedown');
        this._forwardEvent('mousemove');
        this._forwardEvent('mouseout');
        this._forwardEvent('mouseover');
        this._forwardEvent('mouseup');
      } else {
        this._clearListener('mousedown');
        this._clearListener('mousemove');
        this._clearListener('mouseout');
        this._clearListener('mouseover');
        this._clearListener('mouseup');
      }
    }
  },

  _animationChanged() {
    if (this.marker) {
      this.marker.setAnimation(google.maps.Animation[this.animation]);
    }
  },

  _labelChanged() {
    if (this.marker) {
      this.marker.setLabel(this.label);
    }
  },

  _iconChanged() {
    if (this.marker) {
      this.marker.setIcon(this.icon);
    }
  },

  _zIndexChanged() {
    if (this.marker) {
      this.marker.setZIndex(this.zIndex);
    }
  },

  _mapChanged() {
    // Marker will be rebuilt, so disconnect existing one from old map and listeners.
    if (this.marker) {
      this.marker.setMap(null);
      google.maps.event.clearInstanceListeners(this.marker);
    }

    if (this.map && this.map instanceof google.maps.Map) {
      this._mapReady();
    }
  },

  _contentChanged() {
    if (this._contentObserver) { this._contentObserver.disconnect(); }
    // Watch for future updates.
    this._contentObserver = new MutationObserver(this._contentChanged.bind(this));
    this._contentObserver.observe(this, {
      childList: true,
      subtree: true,
    });

    const content = this.innerHTML.trim();
    if (content) {
      if (!this.info) {
        // Create a new infowindow
        this.info = new google.maps.InfoWindow();
        this.openInfoHandler_ = google.maps.event.addListener(this.marker, 'click', () => {
          this.open = true;
        });

        this.closeInfoHandler_ = google.maps.event.addListener(this.info, 'closeclick', () => {
          this.open = false;
        });
      }
      this.info.setContent(content);
    } else if (this.info) {
      // Destroy the existing infowindow.  It doesn't make sense to have an empty one.
      google.maps.event.removeListener(this.openInfoHandler_);
      google.maps.event.removeListener(this.closeInfoHandler_);
      this.info = null;
    }
  },

  _openChanged() {
    if (this.info) {
      if (this.open) {
        this.info.open(this.map, this.marker);
        this.fire('google-map-marker-open');
      } else {
        this.info.close();
        this.fire('google-map-marker-close');
      }
    }
  },

  _mapReady() {
    this._listeners = {};
    this.marker = new google.maps.Marker({
      map: this.map,
      position: {
        lat: parseFloat(this.latitude),
        lng: parseFloat(this.longitude),
      },
      title: this.title,
      animation: google.maps.Animation[this.animation],
      draggable: this.draggable,
      visible: !this.hidden,
      icon: this.icon,
      label: this.label,
      zIndex: this.zIndex,
    });
    this._contentChanged();
    this._clickEventsChanged();
    this._dragEventsChanged();
    this._mouseEventsChanged();
    this._openChanged();
    setupDragHandler_.bind(this)();
  },

  _clearListener(name) {
    if (this._listeners[name]) {
      google.maps.event.removeListener(this._listeners[name]);
      this._listeners[name] = null;
    }
  },

  _forwardEvent(name) {
    this._listeners[name] = google.maps.event.addListener(this.marker, name, (event) => {
      this.fire(`google-map-marker-${name}`, event);
    });
  },

  attributeChanged(attrName) {
    if (!this.marker) {
      return;
    }

    // Cannot use *Changed watchers for native properties.
    switch (attrName) {
      case 'hidden':
        this.marker.setVisible(!this.hidden);
        break;
      case 'draggable':
        this.marker.setDraggable(this.draggable);
        setupDragHandler_.bind(this)();
        break;
      case 'title':
        this.marker.setTitle(this.title);
        break;
    }
  },
});

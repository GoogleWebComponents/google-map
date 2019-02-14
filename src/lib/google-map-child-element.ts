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

import {LitElement, html, css} from 'lit-element';
import {property} from 'lit-element/lib/decorators.js';
import { loadGoogleMapsAPI } from '../maps-api';

export {html, svg, css} from 'lit-element';
export {customElement, property, query} from 'lit-element/lib/decorators.js';

/**
 * Base class that helps manage references to the containing google.maps.Map
 * instance.
 */
export abstract class GoogleMapChildElement extends LitElement {

  static styles = css`
    :host {
      display: none;
    }
  `;

  @property()
  map?: google.maps.Map;

  mapReady?: Promise<google.maps.Map|undefined>;

  render() {
    return html`<slot></slot>`;
  }

  /**
   * Gets an instance of google.maps.Map by firing a google-map-get-map-instance
   * event to request the instance from an ancestor element. GoogleMap responds
   * to this event.
   */
  protected async _getMapInstance(): Promise<google.maps.Map|undefined> {
    const detail: {mapReady?: Promise<google.maps.Map>} = {};
    this.dispatchEvent(new CustomEvent('google-map-get-map-instance', {
      bubbles: true,
      detail,
    }));
    return detail.mapReady;
  }

  connectedCallback() {
    super.connectedCallback();
    this.mapReady = this._getMapInstance();
    this.mapReady.then((map) => {
      this.map = map;
    });
  }
}

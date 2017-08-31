google-map
==========

If you are seeking a smaller, simplified version of `google-map`, we recommend using
[`good-map`](https://www.webcomponents.org/element/keanulee/good-map)


[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://beta.webcomponents.org/element/GoogleWebComponents/google-map)

<!---
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-lite.min.js"></script>
    <link rel="import" href="google-map.html">
    <style>
      google-map {
        height: 300px;
      }
    </style>
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<google-map fit-to-marker api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc">
  <google-map-marker latitude="37.78" longitude="-122.4" draggable="true"></google-map-marker>
</google-map>
```

Breaking changes:
 * Markers added to `<google-map>` must now specify `slot="markers"` to be added correctly.

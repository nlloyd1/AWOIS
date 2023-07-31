require([
    "esri/config",
     "esri/Map",
     "esri/views/MapView",
     "esri/layers/FeatureLayer",
     "esri/widgets/Compass",
     "esri/widgets/Legend",
     "esri/widgets/Expand",
     "esri/widgets/ScaleBar"
   ], function (esriConfig,Map, MapView, FeatureLayer, Compass, Legend, Expand, ScaleBar) {

     esriConfig.apiKey = "AAPKe90fcece85714501bf3c3b16d0cc42693WLeGHev1l9ar0G1jh7YWMU2ZB1jwZrYiJKPnPYQPPCC9ztuSO40_gwuKyyV1T65";
     const map = new Map({
       basemap: "arcgis-navigation" // Basemap layer
     });

     const view = new MapView({
       map: map,
       center: [-118.24532,34.05398],
       zoom: 2, 
       container: "viewDiv",
       constraints: {
         snapToZoom: false
       }
     });
    // ===================================================================
    // LAYERS
    // ===================================================================
    const shipwrecksRenderer = {
       "type": "simple",
       "symbol": {
         "type": "simple-marker",
         "color": "#A14936",
         "width": "12px",
         "height": "12px"
       }
    }
    const shipwreckPopup = {
       "title": "Shipwreck",
       "content": "<b>Depth: {DEPTH} feet <br> <b>Status: {FEATURE_TYPE} <br> {HISTORY}"
     }

     /**
      * Shipwreck layer with no clustering
      */
    const unclusteredShipwrecks = new FeatureLayer({
        url: "https://services.arcgis.com/XORNS2fPFySPlBgy/arcgis/rest/services/AWOIS_Wrecks/FeatureServer"
        //effect: "bloom(1, 0px, 15%)"
     });

     /**
      * Clustered shipwreck layer
      */
    const clusteredShipwrecks = new FeatureLayer({
      url: "https://services.arcgis.com/XORNS2fPFySPlBgy/arcgis/rest/services/AWOIS_Wrecks/FeatureServer",
      renderer: shipwrecksRenderer,
      popupTemplate: shipwreckPopup,
      effect: "bloom(1, 0px, 15%)"
       //labelingInfo: [shipwrecksLabel]
    });
    clusteredShipwrecks.featureReduction = {
      type: "cluster",
      clusterRadius: 100, 
      labelingInfo: [
      {
        labelExpressionInfo: {
          expression: "Text($feature.cluster_count, '#,###')"
        },
        symbol: {
              type: "text",
              style: "square",
              color: "black",
              font: {
                family: "Noto Sans",
                size: "12px"
              }
        },
        labelPlacement: "center-center"
      },
      ],
    };
    /**
      * Binned shipwrecks layer
    */
    const binnedShipwrecks = new FeatureLayer({
      url: "https://services.arcgis.com/XORNS2fPFySPlBgy/arcgis/rest/services/AWOIS_Wrecks/FeatureServer",
    });
    binnedShipwrecks.featureReduction = {
      type: "binning", 
      renderer: {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-fill",  // autocasts as new SimpleFillSymbol()
          outline: {  // autocasts as new SimpleLineSymbol()
            width: 0.5,
            color: "white"
          }
        },
        visualVariables: [{
          type: "color",
          field: "aggregateCount",
          stops: [
            { value: 1, color: "white" },
            { value: 50, color: "#9e776f"},
            { value: 100, color: "#a35d4e"},
            { value: 200, color: "#A14936" }, 
            { value: 300, color: "#a6331b"}
          ]
        }]
      },
    popupTemplate: {
      content: "{aggregateCount} shipwrecks"
    }
    };
    map.add(unclusteredShipwrecks); 

    const heatmapRenderer = {
      type: "heatmap",
      colorStops: [
        { color: "rgba(0, 0, 0, 0)", ratio: 0 },
        { color: "#f7e7e6", ratio: 0.2 },
        { color: "#d19792", ratio: 0.4 },
        { color: "#de8983", ratio: 0.6 },
        { color: "#e06f67", ratio: 0.8 },
        { color: "#eb5146", ratio: 1}
      ],
      maxDensity: 0.01,
      minDensity: 0
    };
    const heatmapShipwrecks = new FeatureLayer({
      url: "https://services.arcgis.com/XORNS2fPFySPlBgy/arcgis/rest/services/AWOIS_Wrecks/FeatureServer",
      renderer: heatmapRenderer
    });
    const bloomShipwrecks = new FeatureLayer({
      url: "https://services.arcgis.com/XORNS2fPFySPlBgy/arcgis/rest/services/AWOIS_Wrecks/FeatureServer",
      effect: "bloom(1, 0px, 25%)"
   });
    // ===================================================================
    // ACCESSORIES
    // ===================================================================
    const compass = new Compass({
      view: view
    });
    view.ui.add(compass, "top-right");
    const legend = new Legend ({
        view: view,
        container: "legendDiv"
    });
    const scaleBar = new ScaleBar({
      view: view,
      unit: "dual"
    });
    view.ui.add(scaleBar, "bottom-right");
      const infoDiv = document.getElementById("infoDiv")
      view.ui.add(
          new Expand({
              view: view,
              content: infoDiv,
              expanded: true,
          }),
          "top-left"
    );
    /**
     * Listens for a change in the dropdown menu and changes the visualization pattern
     */
    function changeVisPattern() {
      var visualization = document.getElementsByName("visualization-dropdown")[0].value;
      if (visualization == "None") {
        map.removeAll();
        map.add(unclusteredShipwrecks);
      }
      else if (visualization == "Clustering") {
        map.removeAll();
        map.add(clusteredShipwrecks);
      }
      else if (visualization == "Binning") {
        map.removeAll();
        map.add(binnedShipwrecks);
      }
      else if (visualization == "Heatmap") {
        map.removeAll();
        map.add(heatmapShipwrecks);
      }
      else if (visualization == "Bloom") {
        map.removeAll();
        map.add(bloomShipwrecks);
      }
    }
    document.getElementById("visPatternDropdown").addEventListener("change", changeVisPattern);
});
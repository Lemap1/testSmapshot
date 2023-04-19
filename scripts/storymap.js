$(window).on('load', function() {
  var documentSettings = {};

  // Some constants, such as default settings
  const CHAPTER_ZOOM = 15;

  // First, try reading Options.csv
  $.get('csv/Options.csv', function(options) {

    $.get('json/Chapters.json', function(chapters) {

      initMap(
        $.csv.toObjects(options),
        chapters
      )
    }).fail(function(e) { alert('Found Options.csv, but could not read Chapters.csv') });

  // If not available, try from the Google Sheet
  }).fail(function(e) {
    console.log(e)
  })

  /**
  * Reformulates documentSettings as a dictionary, e.g.
  * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
  */
  function createDocumentSettings(settings) {
    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customize;
    }
  }

  /**
   * Returns the value of a setting s
   * getSetting(s) is equivalent to documentSettings[constants.s]
   */
  function getSetting(s) {
    return documentSettings[constants[s]];
  }

  /**
   * Returns the value of setting named s from constants.js
   * or def if setting is either not set or does not exist
   * Both arguments are strings
   * e.g. trySetting('_authorName', 'No Author')
   */
  function trySetting(s, def) {
    s = getSetting(s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }

  /**
   * Loads the basemap and adds it to the map
   */
  function addBaseMap() {
    var basemap = trySetting('_tileProvider', 'Stamen.TonerLite');
    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);
  }

  function initMap(options, chapters) {
    createDocumentSettings(options);

    var chapterContainerMargin = 70;

    document.title = getSetting('_mapTitle');
    $('#header').append('<h1>' + (getSetting('_mapTitle') || '') + '</h1>');
    $('#header').append('<h2>' + (getSetting('_mapSubtitle') || '') + '</h2>');

    // Add logo
    if (getSetting('_mapLogo')) {
      $('#logo').append('<img src="' + getSetting('_mapLogo') + '" />');
      $('#top').css('height', '60px');
    } else {
      $('#logo').css('display', 'none');
      $('#header').css('padding-top', '25px');
    }

    // Load tiles
    addBaseMap();

    /**
     * With overlay
     */
    /*
    imageBounds = [[5.013926957923385, 45.35600133779394], [11.477436312994008, 48.27502358353741]]
    L.imageOverlay("https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/4326/{z}/{x}/{y}.jpeg", imageBounds).addTo(map);
    // Add zoom controls if needed
    if (getSetting('_zoomControls') !== 'off') {
      L.control.zoom({
        position: getSetting('_zoomControls')
      }).addTo(map);
    }*/



    var markers = [];

    var markActiveColor = function(k) {
      /* Removes marker-active class from all markers */
      for (var i = 0; i < markers.length; i++) {
        if (markers[i] && markers[i]._icon) {
          markers[i]._icon.className = markers[i]._icon.className.replace(' marker-active', '');

          if (i == k) {
            /* Adds marker-active class, which is orange, to marker k */
            markers[k]._icon.className += ' marker-active';
          }
        }
      }
    }

    var pixelsAbove = [];
    var chapterCount = 0;

    var currentlyInFocus; // integer to specify each chapter is currently in focus
    var overlay;  // URL of the overlay for in-focus chapter
    var geoJsonOverlay;

    chapters = jsonToObject(chapters)
    .then(chapters =>{
    for (i in chapters) {
      var c = chapters[i];
  
      if ( !isNaN(parseFloat(c.Latitude)) && !isNaN(parseFloat(c.Longitude))) {
        var lat = parseFloat(c.Latitude);
        var lon = parseFloat(c.Longitude);
    
        chapterCount += 1;
    
        markers.push(
          L.marker([lat, lon], {
            icon: L.ExtraMarkers.icon({
              icon: 'fa-number',
              number: c.Marker === 'Numbered'
                ? chapterCount
                : (c.Marker === 'Plain' ? '' : c.Marker), 
                markerColor: c.Marker_Color || 'blue'
            }),
            opacity: c.Marker === 'Hidden' ? 0 : 0.9,
            interactive: c.Marker === 'Hidden' ? false : true,
          }
        ));
    
      } else {
        markers.push(null);
      }
    
      // Add chapter container
      var container = $('<div></div>', {
        id: 'container' + i,
        class: 'chapter-container'
      });
    
    
      // Add media and credits: YouTube, audio, or image
      var media = null;
      var mediaContainer = null;
    
      // Add media source
      var source = '';
      if (c.Media_Credit_Link) {
        source = $('<a>', {
          text: c.Media_Credit,
          href: c.Media_Credit_Link,
          target: "_blank",
          class: 'source'
        });
      } else {
        source = $('<span>', {
          text: c.Media_Credit,
          class: 'source'
        });
      }
    
      // YouTube
      if (c.Media_Link && c.Media_Link.indexOf('youtube.com/') > -1) {
        media = $('<iframe></iframe>', {
          src: c.Media_Link,
          width: '100%',
          height: '100%',
          frameborder: '0',
          allow: 'autoplay; encrypted-media',
          allowfullscreen: 'allowfullscreen',
        });
    
        mediaContainer = $('<div></div>', {
          class: 'img-container'
        }).append(media).after(source);
      }
    
      // If not YouTube: either audio or image
      var mediaTypes = {
        'jpg': 'img',
        'jpeg': 'img',
        'png': 'img',
        'tiff': 'img',
        'gif': 'img',
        'mp3': 'audio',
        'ogg': 'audio',
        'wav': 'audio',
      }
    
      var mediaExt = c.Media_Link ? c.Media_Link.split('.').pop().toLowerCase() : '';
      var mediaType = mediaTypes[mediaExt];
    
      if (mediaType) {
        media = $('<' + mediaType + '>', {
          src: c.Media_Link,
          controls: mediaType === 'audio' ? 'controls' : '',
          alt: c.Chapter
        });
    
        var enableLightbox = getSetting('_enableLightbox') === 'yes' ? true : false;
        if (enableLightbox && mediaType === 'img') {
          var lightboxWrapper = $('<a></a>', {
            'data-lightbox': c.Media_Link,
            'href': c.Media_Link,
            'data-title': c.Chapter,
            'data-alt': c.Chapter,
          });
          media = lightboxWrapper.append(media);
        }
    
        mediaContainer = $('<div></div', {
          class: mediaType + '-container'
        }).append(media).after(source);
      }
    
      container
        .append('<p class="chapter-header">' + c.Chapter + '</p>')
        .append(media ? mediaContainer : '')
        .append(media ? source : '')
        .append('<p class="description">' + c.Description + '</p>');
    
      $('#contents').append(container);
    }

    //changeAttribution();

    /* Change image container heights */
    imgContainerHeight = parseInt(getSetting('_imgContainerHeight'));
    if (imgContainerHeight > 0) {
      $('.img-container').css({
        'height': imgContainerHeight + 'px',
        'max-height': imgContainerHeight + 'px',
      });
    }

    // For each block (chapter), calculate how many pixels above it
    pixelsAbove[0] = -100;
    for (i = 1; i < chapters.length; i++) {
      pixelsAbove[i] = pixelsAbove[i-1] + $('div#container' + (i-1)).height() + chapterContainerMargin;
    }
    pixelsAbove.push(Number.MAX_VALUE);

    $('div#contents').scroll(function() {
      var currentPosition = $(this).scrollTop();

      // Make title disappear on scroll
      if (currentPosition < 200) {
        $('#title').css('opacity', 1 - Math.min(1, currentPosition / 100));
      }

      for (var i = 0; i < pixelsAbove.length - 1; i++) {

        if ( currentPosition >= pixelsAbove[i]
          && currentPosition < (pixelsAbove[i+1] - 2 * chapterContainerMargin)
          && currentlyInFocus != i
        ) {

          // Update URL hash
          location.hash = i + 1;

          // Remove styling for the old in-focus chapter and
          // add it to the new active chapter
          $('.chapter-container').removeClass("in-focus").addClass("out-focus");
          $('div#container' + i).addClass("in-focus").removeClass("out-focus");

          currentlyInFocus = i;
          markActiveColor(currentlyInFocus);

          // Remove overlay tile layer if needed
          if (map.hasLayer(overlay)) {
            map.removeLayer(overlay);
          }

          // Remove GeoJson Overlay tile layer if needed
          if (map.hasLayer(geoJsonOverlay)) {
            map.removeLayer(geoJsonOverlay);
          }

          var c = chapters[i];

          // Add chapter's overlay tiles if specified in options
          if (c.Overlay) {

            var opacity = parseFloat(c.Overlay_Transparency) || 1;
            var url = c.Overlay;

            if (url.split('.').pop() === 'geojson') {
              $.getJSON(url, function(geojson) {
                overlay = L.geoJson(geojson, {
                  style: function(feature) {
                    return {
                      fillColor: feature.properties.fillColor || '#ffffff',
                      weight: feature.properties.weight || 1,
                      opacity: feature.properties.opacity || opacity,
                      color: feature.properties.color || '#cccccc',
                      fillOpacity: feature.properties.fillOpacity || 0.5,
                    }
                  }
                }).addTo(map);
              });
            } else {
              overlay = L.tileLayer(c.Overlay, { opacity: opacity }).addTo(map);
            }

          }

          if (c.GeoJSON_Overlay) {
            $.getJSON(c.GeoJSON_Overlay, function(geojson) {

              // Parse properties string into a JS object
              var props = {};

              if (c.GeoJSON_Feature_Properties) {
                var propsArray = c.GeoJSON_Feature_Properties.split(';');
                var props = {};
                for (var p in propsArray) {
                  if (propsArray[p].split(':').length === 2) {
                    props[ propsArray[p].split(':')[0].trim() ] = propsArray[p].split(':')[1].trim();
                  }
                }
              }

              geoJsonOverlay = L.geoJson(geojson, {
                style: function(feature) {
                  return {
                    fillColor: feature.properties.fillColor || props.fillColor || '#ffffff',
                    weight: feature.properties.weight || props.weight || 1,
                    opacity: feature.properties.opacity || props.opacity || 0.5,
                    color: feature.properties.color || props.color || '#cccccc',
                    fillOpacity: feature.properties.fillOpacity || props.fillOpacity || 0.5,
                  }
                }
              }).addTo(map);
            });
          }

          // Fly to the new marker destination if latitude and longitude exist
          if (c.Latitude && c.Longitude) {
            var zoom = c.Zoom ? c.Zoom : CHAPTER_ZOOM;
            map.flyTo([c.Latitude, c.Longitude], zoom, {
              animate: true,
              duration: 2, // default is 2 seconds
            });
          }

          // No need to iterate through the following chapters
          break;
        }
      }
    });


    $('#contents').append(" \
      <div id='space-at-the-bottom'> \
        <a href='#top'>  \
          <i class='fa fa-chevron-up'></i></br> \
          <small>Top</small>  \
        </a> \
      </div> \
    ");

    /* Generate a CSS sheet with cosmetic changes */
    $("<style>")
      .prop("type", "text/css")
      .html("\
      #narration, #title {\
        background-color: " + trySetting('_narrativeBackground', 'white') + "; \
        color: " + trySetting('_narrativeText', 'black') + "; \
      }\
      a, a:visited, a:hover {\
        color: " + trySetting('_narrativeLink', 'blue') + " \
      }\
      .in-focus {\
        background-color: " + trySetting('_narrativeActive', '#f0f0f0') + " \
      }")
      .appendTo("head");


    endPixels = parseInt(getSetting('_pixelsAfterFinalChapter'));
    if (endPixels > 100) {
      $('#space-at-the-bottom').css({
        'height': (endPixels / 2) + 'px',
        'padding-top': (endPixels / 2) + 'px',
      });
    }

    var bounds = [];
    for (i in markers) {
      if (markers[i]) {
        markers[i].addTo(map);
        markers[i]['_pixelsAbove'] = pixelsAbove[i];
        markers[i].on('click', function() {
          var pixels = parseInt($(this)[0]['_pixelsAbove']) + 5;
          $('div#contents').animate({
            scrollTop: pixels + 'px'});
        });
        bounds.push(markers[i].getLatLng());
      }
    }
    map.fitBounds(bounds);

    $('#map, #narration, #title').css('visibility', 'visible');
    $('div.loader').css('visibility', 'hidden');

    $('div#container0').addClass("in-focus");
    $('div#contents').animate({scrollTop: '1px'});

    // On first load, check hash and if it contains an number, scroll down
    if (parseInt(location.hash.substr(1))) {
      var containerId = parseInt( location.hash.substr(1) ) - 1;
      $('#contents').animate({
        scrollTop: $('#container' + containerId).offset().top
      }, 2000);
    }

    const swissImageLayer = L.tileLayer('http://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/4326/{z}/{x}/{y}.png', {
      subdomains: '56789',
      minZoom: 8,
      maxZoom: 17,
      attribution: '<a href="//www.swisstopo.admin.ch/internet/swisstopo/en/home.html">swisstopo</a>'
    }).addTo(map);
  }); 
  }
});

/**
 * Function caled to change the map's layout
 * @param {*} layout 
 */
function changeLayout(){
  var wmsLayerSat = L.tileLayer.wms('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    layers: 'TOPO-OSM-WMS'
  })
  var wmsLayerRoad = L.tileLayer.wms('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    layers: 'TOPO-OSM-WMS'
  })
  var wmsLayerSwiss = L.tileLayer.wms('https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/4326/{z}/{x}/{y}.jpeg', {
    layers: 'TOPO-OSM-WMS'
  })
  var wmsLayerTerr = L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
    layers: 'TOPO-OSM-WMS'
  })
  if(document.getElementById("satellite").checked){

    map.removeLayer(wmsLayerSwiss)
    map.removeLayer(wmsLayerTerr)
    map.removeLayer(wmsLayerRoad)
    map.removeLayer(wmsLayerSat)
    wmsLayerSat.addTo(map);
  }else if(document.getElementById("roadmap").checked){
    map.removeLayer(wmsLayerSwiss)
    map.removeLayer(wmsLayerTerr)
    map.removeLayer(wmsLayerRoad)
    map.removeLayer(wmsLayerSat)
    wmsLayerRoad.addTo(map);
  }else if(document.getElementById("swisstopo").checked){
    map.removeLayer(wmsLayerSwiss)
    map.removeLayer(wmsLayerTerr)
    map.removeLayer(wmsLayerRoad)
    map.removeLayer(wmsLayerSat)
    wmsLayerSwiss.addTo(map);
  }else if(document.getElementById("terrain").checked){
    map.removeLayer(wmsLayerSwiss)
    map.removeLayer(wmsLayerTerr)
    map.removeLayer(wmsLayerRoad)
    map.removeLayer(wmsLayerSat)

    wmsLayerTerr.addTo(map);
  }

}

/**
 * Class that represents a chapter of the storymap
 */
class Chapter{
     
  constructor(Chapter, Media_Link, Media_Credit, Media_Credit_Link, Description, Zoom, Marker, Marker_Color, Location, Latitude, Longitude, Overlay, Overlay_Transparency,
    GeoJSON_Overlay,
    GeoJSON_Feature_Properties){
      this.Chapter = Chapter
      this.Media_Link = Media_Link
      this.Media_Credit = Media_Credit
      this.Media_Credit_Link = Media_Credit_Link
      this.Description = Description
      this.Zoom = Zoom
      this.Marker = Marker
      this.Marker_Color = Marker_Color
      this.Location = Location
      this.Latitude = Latitude
      this.Longitude = Longitude
      this.Overlay = Overlay
      this.Overlay_Transparency = Overlay_Transparency
      this.GeoJSON_Overlay = GeoJSON_Overlay
      this.GeoJSON_Feature_Properties = GeoJSON_Feature_Properties
      
  }

  /**
   * Convert a json's content into a chapter
   * @param {*} jsonObject the JsonObject to convert
   * @returns null if it was not able to be converted, else the converted JsonObject
   */
  static toObject(jsonObject) {
    let ret = null;
    if (jsonObject) {
      ret = new Chapter(
        jsonObject.Chapter,
        jsonObject.Media_Link,
        jsonObject.Media_Credit,
        jsonObject.Media_Credit_Link,
        jsonObject.Description,
        jsonObject.Zoom,
        jsonObject.Marker,
        jsonObject.Marker_Color,
        jsonObject.Location,
        jsonObject.Latitude,
        jsonObject.Longitude,
        jsonObject.Overlay,
        jsonObject.Overlay_Transparency,
        jsonObject.GeoJSON_Overlay,
        jsonObject.GeoJSON_Feature_Properties
      );
    }
    return ret;
  }

  static readJSON(file){

    let ret = []
    try{
      let data = file
      for(let i = 0; i < data.length; i++){

          ret.push(Chapter.toObject(data[i]))
      }
    }catch(e){
      console.log("une erreur : ", e)
    }
    return ret
  }
}

  /**
   * Synchronous version
   */
  function requestAPI(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse JSON response: ${error.message}`));
          }
        } else {
          reject(new Error(`Request failed with status ${xhr.status}`));
        }
      };
      xhr.onerror = () => {
        reject(new Error('Failed to make request'));
      };
      xhr.send();
    });
  }




  async function jsonToObject(jsonList) {
    const promises = jsonList.map(async (item) => {
      const data = await requestAPI(
        `https://smapshot.heig-vd.ch/api/v1/images/${item.id}/attributes/?lang=fr`
      );
      const chapter = new Chapter(
        data.title,
        data.media.image_url,
        data.license,
        item.Media_Credit_Link,
        item.Description,
        item.Zoom,
        item.Marker,
        item.Marker_Color,
        item.Location,
        data.pose.latitude,
        data.pose.longitude,
        item.Overlay,
        item.Overlay_Transparency,
        item.GeoJSON_Overlay,
        item.GeoJSON_Feature_Properties
      );
      return chapter;
    });
  
    const chapters = await Promise.all(promises);
  
    return chapters;
  }


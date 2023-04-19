
const https = require('https');
const request = require('sync-request');


const fs = require('fs');
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
     * Convert a JsonObject into a chapter
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
    static readJSON(json){

        let ret = []
        let data = JSON.parse(json)
        for(let i = 0; i < data.length; i++){

            ret.push(Chapter.toObject(data[i]))
        }

        return ret
    }
  }


  /**
   * Asynchronous versions
   * @param {*} jsonContent 
   */
  /*
  function readJSON(json) {
    try {
      return requestAPI('https://smapshot.heig-vd.ch/api/v1/images/' + json.id + '/attributes/?lang=fr')
        .then(data => {
          let chapter = new Chapter(data.title, data.media.image_url, data.license, json.Media_Credit_Link, json.Description, json.Zoom, json.Marker, json.Marker_Color, json.Location, data.apriori_locations[0].latitude,  data.apriori_locations[0].longitude, json.Overlay, json.Overlay_Transparency, json.GeoJSON_Overlay, json.GeoJSON_Feature_Properties);
          return chapter;
        })
        .catch(e => {
          console.log(e);
          return null;
        });
    } catch(e) {
      console.log(e);
      return null;
    }
  }
  


  function requestAPI(url) {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      });
  
      req.on('error', (error) => {
        reject(error);
      });
  
      req.end();
    });
  }
  */


  /**
   * Synchronous version
   */
  function requestAPI(url) {
    const res = request('GET', url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (res.statusCode === 200) {
      return JSON.parse(res.getBody('utf8'));
    } else {
      throw new Error(`Request failed with status code ${res.statusCode}`);
    }
  }

  function jsonToObject(jsonList){
    const chapters = [];

    for (const element of jsonList) {
        let json = element;
        let data = requestAPI(`https://smapshot.heig-vd.ch/api/v1/images/${json.id}/attributes/?lang=fr`);
        let chapter = new Chapter(data.title, data.media.image_url, data.license, json.Media_Credit_Link, json.Description, json.Zoom, json.Marker, json.Marker_Color, json.Location, data.pose.latitude, data.pose.longitude, json.Overlay, json.Overlay_Transparency, json.GeoJSON_Overlay, json.GeoJSON_Feature_Properties);
        chapters.push(chapter);
    }

    return chapters

  }

/**
 * Tests the Chapter class and its toObject() and readJSON() functions
 */
fs.readFile('csv/TestApi.json', 'utf8', (err, data) => {
console.log("-----Test Chapter class-----")

if (err) {
    console.error(err);
    return;
}

data = JSON.parse(data)
//console.log(data[0])
let chapters = null

/**
 * Async version
 */
/*
readJSON(data[0])
    .then(chapter => {

        chapters = chapter
        console.log(chapters)

    });*/

    let chapter = jsonToObject(data)
    console.log(chapter)

})

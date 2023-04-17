
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


  const fs = require('fs');

  fs.readFile('tests/Chapters.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let json = JSON.parse(data)
    let chapters = Chapter.readJSON(data)
    console.log(chapters);
  });



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


  class Settings{

  constructor(Title, Subtitle, Logo, Google_Analytics_Tracking_ID, Basemap_Tiles, Zoom_Controls, Narrative_Background_Color, Narrative_Text_Color, Narrative_Link_Color, Active_Chapter_Background_Color, Media_Container_Height, Pixels_After_Final_Chapter, Enable_Lightbox_for_Images, Author_Name, Author_Email_or_Website, Author_Github_Repo_Link, Code_Credit){

      this.Title = Title
      this.Subtitle = Subtitle
      this.Logo  = Logo
      this.Google_Analytics_Tracking_ID  = Google_Analytics_Tracking_ID
      this.Basemap_Tiles  = Basemap_Tiles
      this.Zoom_Controls  = Zoom_Controls
      this.Narrative_Background_Color  = Narrative_Background_Color
      this.Narrative_Text_Color  = Narrative_Text_Color
      this.Narrative_Link_Color  = Narrative_Link_Color
      this.Active_Chapter_Background_Color  = Active_Chapter_Background_Color
      this.Media_Container_Height  = Media_Container_Height
      this.Pixels_After_Final_Chapter  = Pixels_After_Final_Chapter
      this.Enable_Lightbox_for_Images  = Enable_Lightbox_for_Images
      this.Author_Name  = Author_Name
      this.Author_Email_or_Website  = Author_Email_or_Website
      this.Author_Github_Repo_Link  = Author_Github_Repo_Link
      this.Code_Crefit  = Code_Credit
    }

    /**
   * Convert a JsonObject into a Settings
   * @param {*} jsonObject the JsonObject to convert
   * @returns null if it was not able to be converted, else the converted JsonObject
   */
  static toObject(jsonObject) {
    let ret = null;
    if (jsonObject) {
      ret = new Settings(
        jsonObject.Title, 
        jsonObject.Subtitle, 
        jsonObject.Logo, 
        jsonObject.Google_Analytics_Tracking_ID, 
        jsonObject.Basemap_Tiles, 
        jsonObject.Zoom_Controls, 
        jsonObject.Narrative_Background_Color, 
        jsonObject.Narrative_Text_Color, 
        jsonObject.Narrative_Link_Color, 
        jsonObject.Active_Chapter_Background_Color, 
        jsonObject.Media_Container_Height, 
        jsonObject.Pixels_After_Final_Chapter, 
        jsonObject.Enable_Lightbox_for_Images, 
        jsonObject.Author_Name, 
        jsonObject.Author_Email_or_Website, 
        jsonObject.Author_Github_Repo_Link, 
        jsonObject.Code_Credit
      );
    }
    return ret;
  }
  }

  const fs = require('fs');

  /**
   * Tests the Chapter class and its toObject() and readJSON() functions
   */
  fs.readFile('csv/Chapters.json', 'utf8', (err, data) => {
    console.log("-----Test Chapter class-----")

    if (err) {
      console.error(err);
      return;
    }

    let json = JSON.parse(data)
    let chapter = Chapter.toObject(json[0])
    let chapters = Chapter.readJSON(data)
    console.log(chapters);
  })

  /**
   * Test the toObject() of the Settings class
   */
  fs.readFile('csv/Options.json', 'utf8', (err, data) => {
    console.log("-----Test Settings class-----")

    if (err) {
      console.error(err);
      return;
    }
    let json = JSON.parse(data)
    let settings = Settings.toObject(json)
    console.log(settings);
  });



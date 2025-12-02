import { MapPoint } from "./MapWidget";

export class MapWidgetModel {
  private _points: MapPoint[] = []; //points to be drawn on the map

  private _minLon: number = 0;
  private _maxLon: number = 0;
  private _minLat: number = 0;
  private _maxLat: number = 0;

  constructor(points: MapPoint[]) {
    this.points = points;
  }

  public get points(): MapPoint[] {
    return this._points;
  }

  public set points(points: MapPoint[]) {
    this._points = points;
    this._setMinMax();
  }

  private _setMinMax(): void {
    //determine the min and max values for scaling
    //the map while drawing, so that everything is visible
    this._minLon =
      this._points.reduce((prev, curr) =>
        prev.longitude < curr.longitude ? prev : curr
      ).longitude - 0.0015;
    this._minLat =
      this._points.reduce((prev, curr) =>
        prev.latitude < curr.latitude ? prev : curr
      ).latitude - 0.0015;
    this._maxLon =
      this._points.reduce((prev, curr) =>
        prev.longitude > curr.longitude ? prev : curr
      ).longitude + 0.0015;
    this._maxLat =
      this._points.reduce((prev, curr) =>
        prev.latitude > curr.latitude ? prev : curr
      ).latitude + 0.0015;
  }

  // Function to convert latitude and longitude to canvas coordinates
  public latLonToCanvas(
    lat: number,
    lon: number,
    canvasWidth: number = 400,
    canvasHeight: number = 400
  ) {
    const x =
      ((lon - this._minLon) / (this._maxLon - this._minLon)) * canvasWidth;
    const y =
      canvasHeight -
      ((lat - this._minLat) / (this._maxLat - this._minLat)) * canvasHeight;
    return { x,y };
  }

  // Function to convert canvas coordinates to latitude and longitude
  public canvasToLatLon(
    x: number,
    y: number,
    canvasWidth: number = 400,
    canvasHeight: number = 400
  ) {
    // Convert x coordinate to longitude
    const lon = this._minLon + (x / canvasWidth) * (this._maxLon - this._minLon);
    
    // Convert y coordinate to latitude (note: y is inverted in canvas coordinates)
    const lat = this._minLat + ((canvasHeight - y) / canvasHeight) * (this._maxLat - this._minLat);
    
    return { latitude: lat, longitude: lon };
  }
}
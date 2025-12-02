import { SKElement } from "../../simplekit/src/widget/";
import { SKEvent, SKMouseEvent } from "../../simplekit/src/events";
import { MapWidgetController } from "./MapWidgetController";
import { MapWidgetModel } from "./MapWidgetModel";
import { MapWidgetView } from "./MapWidgetView";

/** 
 * A Map Widget for SimpleKit that displays an interactive map
 * 
*/ 
export class MapWidget extends SKElement {
  private _model: MapWidgetModel;
  private _view: MapWidgetView;
  private _controller: MapWidgetController;
  private _onPointClick: ((mapPoint: MapPoint) => void) | null = null;
  private _onMapClick: ((latitude: number, longitude: number) => void) | null = null;
  private _selectionPoint1: { latitude: number; longitude: number } | null = null;
  private _selectionPoint2: { latitude: number; longitude: number } | null = null;
  private _maxDistance: number = 5; // Default 5 km

  constructor(
    points: MapPoint[],
    {
      x = 0,
      y = 0,
      width = 400,
      height = 400,
      fill = "lightgreen",
      border = "black",
    } = {}
  ) {
    super({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: fill,
      border: border,
    });
    this._model = new MapWidgetModel(points);
    this._view = new MapWidgetView(this, this._model);
    this._controller = new MapWidgetController(this, this._model);
  }

  draw(gc: CanvasRenderingContext2D) {
    super.draw(gc);
    this._view.draw(gc);
  }

  public sendEvent(e: SKEvent, capture?: boolean): boolean {
    return super.sendEvent(e, capture);
  }

  // Handle mouse events.
  handleMouseEvent(me: SKMouseEvent): boolean {
    const handled = this._controller.handleMouseEvent(me);
    //console.log(`MapWidget received mouse event: ${me.type} at (${me.x}, ${me.y})`);
    // Return true if click was handled to allow event propagation
    return handled;
  }

  public get drawMapFeatureFunctions(): Array<
    (
      gc: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number | undefined,
      height: number | undefined,
      data: {} | undefined
    ) => void
  > {
    return this._view.drawMapFeatureFunctions;
  }

  // Update points on the map
  public set points(points: MapPoint[]) {
    this._model.points = points;
  }

  public get points(): MapPoint[] {
    return this._model.points;
  }

  // Set click handler callback
  public set onPointClick(handler: ((mapPoint: MapPoint) => void) | null) {
    this._onPointClick = handler;
  }

  public get onPointClick(): ((mapPoint: MapPoint) => void) | null {
    return this._onPointClick;
  }

  // Set map area click handler callback (for empty area clicks)
  public set onMapClick(handler: ((latitude: number, longitude: number) => void) | null) {
    this._onMapClick = handler;
  }

  public get onMapClick(): ((latitude: number, longitude: number) => void) | null {
    return this._onMapClick;
  }

  // Selection points for distance filter
  public set selectionPoint1(point: { latitude: number; longitude: number } | null) {
    this._selectionPoint1 = point;
  }

  public get selectionPoint1(): { latitude: number; longitude: number } | null {
    return this._selectionPoint1;
  }

  public set selectionPoint2(point: { latitude: number; longitude: number } | null) {
    this._selectionPoint2 = point;
  }

  public get selectionPoint2(): { latitude: number; longitude: number } | null {
    return this._selectionPoint2;
  }

  // Maximum distance for distance filter (in kilometers)
  public set maxDistance(km: number) {
    this._maxDistance = Math.max(0, km);
  }

  public get maxDistance(): number {
    return this._maxDistance;
  }
}

// Define the property interface based on JSON structure
export interface MapPoint {
    latitude: number;
    longitude: number;
    data: {};
    dataDisplay: string;
}
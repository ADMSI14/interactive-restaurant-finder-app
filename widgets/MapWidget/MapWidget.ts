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
    this._controller.handleMouseEvent(me);
    //console.log(`MapWidget received mouse event: ${me.type} at (${me.x}, ${me.y})`);
    return false;
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
}

// Define the property interface based on JSON structure
export interface MapPoint {
    latitude: number;
    longitude: number;
    data: {};
    dataDisplay: string;
}
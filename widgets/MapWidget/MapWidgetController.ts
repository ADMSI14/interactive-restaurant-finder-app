import { 
  SKEvent, 
  SKMouseEvent } from "../../simplekit/src/imperative-mode";
import { MapWidget, MapPoint } from ".";
import { MapWidgetModel } from "./MapWidgetModel";

export class MapWidgetController {
  private _map: MapWidget;
  private _model: MapWidgetModel;
  private _currentHoverPointData = {};

  public get currentHoverPointData() {
    return this._currentHoverPointData;
  }

  public eventHandlers: Array<
    (
      e: SKEvent,
      map: MapWidget,
      model: MapWidgetModel
    ) => void
  > = [];

  constructor(map: MapWidget, model: MapWidgetModel) {
    this._map = map;
    this._model = model;
  }

  handleMouseEvent(me: SKMouseEvent): boolean {
      let hoveredPoint: MapPoint | null = null;
      let clickHandled = false;
      
      // Check if click is within map bounds
      const isWithinMapBounds = 
        me.x >= this._map.x && 
        me.x <= this._map.x + (this._map.width || 0) &&
        me.y >= this._map.y && 
        me.y <= this._map.y + (this._map.height || 0);
      
      // First pass: find the hovered point and set its dataDisplay
      this._model.points.forEach((p) => {
            const { x, y } = this._model.latLonToCanvas(
                p.latitude,
                p.longitude,
                this._map.width,
                this._map.height
            );
            // considered a hit if less than 5 pixels away
            if (
              this.calculateDistance(
                this._map.x + x,
                this._map.y + y,
                me.x,
                me.y
              ) <= 5
            ) {
              hoveredPoint = p;
              
              if (me.type === "mousemove")
              {
                // Set dataDisplay directly for hovered point
                // Extract restaurant data and format display text: "Type – Rating"
                if (p.data && typeof p.data === 'object' && 'type' in p.data && 'ratings' in p.data) {
                  const restaurant = p.data as any;
                  p.dataDisplay = `${restaurant.type} – ${restaurant.ratings.toFixed(1)}`;
                }
                
                // Also send hover event for any external handlers (e.g., RestaurantFinderController)
                this._map.sendEvent({
                  source: this,
                  timeStamp: me.timeStamp,
                  type: "point-hover",
                  data: p
                } as SKEvent);
              }
              else if (me.type === "click")
              {
                // Handle click - use callback if available, otherwise send event
                console.log(`MapWidgetController: Click detected on point at (${p.latitude}, ${p.longitude})`);
                
                // Try callback first (direct handler)
                if (this._map.onPointClick) {
                  console.log(`MapWidgetController: Calling onPointClick callback`);
                  this._map.onPointClick(p);
                }
                
                // Also send event for global listener (backup)
                const clickEvent = {
                  source: this,
                  timeStamp: me.timeStamp,
                  type: "point-click",
                  data: p
                } as SKEvent;
                this._map.sendEvent(clickEvent);
                
                clickHandled = true;
              }
            }
      });
      
      // Handle clicks on empty map area (not on a restaurant marker)
      if (me.type === "click" && isWithinMapBounds && !clickHandled) {
        // Convert canvas coordinates to map-relative coordinates
        const mapRelativeX = me.x - this._map.x;
        const mapRelativeY = me.y - this._map.y;
        
        // Convert to lat/long coordinates
        const { latitude, longitude } = this._model.canvasToLatLon(
          mapRelativeX,
          mapRelativeY,
          this._map.width,
          this._map.height
        );
        
        console.log(`MapWidgetController: Click detected on empty map area at (${latitude}, ${longitude})`);
        
        // Try callback first (direct handler)
        if (this._map.onMapClick) {
          console.log(`MapWidgetController: Calling onMapClick callback`);
          this._map.onMapClick(latitude, longitude);
        }
        
        // Also send event for global listener (backup)
        const mapClickEvent = {
          source: this,
          timeStamp: me.timeStamp,
          type: "map-click",
          data: { latitude, longitude }
        } as SKEvent;
        this._map.sendEvent(mapClickEvent);
        
        clickHandled = true;
      }
      
      // Second pass: clear dataDisplay for all non-hovered points
      this._model.points.forEach((p) => {
            if (p !== hoveredPoint) {
              p.dataDisplay = "";
            }
      });
      
      // Return true if click was handled to allow event propagation
      return clickHandled;
  }

  public calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  public runHandlers(e:SKEvent) { 
    this.eventHandlers.forEach((func)=>{
        func(e, this._map, this._model);
    });
  }
}

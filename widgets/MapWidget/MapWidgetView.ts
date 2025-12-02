import { MapWidget, MapPoint } from ".";
import { MapWidgetModel } from "./MapWidgetModel";

export class MapWidgetView {
  private _map: MapWidget;
  private _model: MapWidgetModel;

  constructor(map: MapWidget, model: MapWidgetModel) {
    this._model = model;
    this._map = map;
  }
  // a list of functions that will be called to draw different map features (e.g., a river or roads)
  public drawMapFeatureFunctions: Array<
    (
      gc: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number | undefined,
      height: number | undefined
    ) => void
  > = [];

  // Function to draw a red circle marker at a given latitude and longitude
  // todo: provide properties for drawing of markers to allow styling
  public drawMarker(
    gc: CanvasRenderingContext2D,
    lat: number,
    lon: number
  ) {
    const { x, y } = this._model.latLonToCanvas(
      lat,
      lon,
      this._map.width,
      this._map.height
    );
    gc.save();
    gc.translate(this._map.x, this._map.y);
    gc.beginPath();
    gc.arc(x, y, 5, 0, 2 * Math.PI);
    gc.fillStyle = "red";
    gc.fill();
    gc.closePath();
    gc.restore();
  }

  // Function to draw a selection point (for distance filter)
  public drawSelectionPoint(
    gc: CanvasRenderingContext2D,
    lat: number,
    lon: number,
    pointNumber: number,
    color: string
  ) {
    const { x, y } = this._model.latLonToCanvas(
      lat,
      lon,
      this._map.width,
      this._map.height
    );
    gc.save();
    gc.translate(this._map.x, this._map.y);
    
    // Clip to map bounds
    gc.beginPath();
    gc.rect(0, 0, this._map.width || 0, this._map.height || 0);
    gc.clip();
    
    const radius = 10; // Larger radius for better visibility
    
    // Draw shadow/outline for better visibility against any background
    gc.beginPath();
    gc.arc(x, y, radius + 2, 0, 2 * Math.PI);
    gc.fillStyle = "rgba(0, 0, 0, 0.3)";
    gc.fill();
    
    // Draw outer circle with main color
    gc.beginPath();
    gc.arc(x, y, radius, 0, 2 * Math.PI);
    gc.fillStyle = color;
    gc.fill();
    
    // Draw white border for contrast
    gc.strokeStyle = "white";
    gc.lineWidth = 2.5;
    gc.stroke();
    gc.closePath();
    
    // Draw number label with shadow for better readability
    gc.font = "bold 13px Arial";
    gc.textAlign = "center";
    gc.textBaseline = "middle";
    
    // Draw text shadow
    gc.fillStyle = "rgba(0, 0, 0, 0.5)";
    gc.fillText(pointNumber.toString(), x + 1, y + 1);
    
    // Draw text
    gc.fillStyle = "white";
    gc.fillText(pointNumber.toString(), x, y);
    
    gc.restore();
  }

  // Function to draw distance circle around a point
  public drawDistanceCircle(
    gc: CanvasRenderingContext2D,
    lat: number,
    lon: number,
    maxDistanceKm: number,
    color: string = "#0066cc" // Default blue, can be customized per point
  ) {
    // Calculate the radius in canvas pixels
    // We need to approximate: 1 degree of latitude ≈ 111 km
    // So maxDistanceKm / 111 gives us degrees
    const radiusInDegrees = maxDistanceKm / 111;
    
    // Get the center point in canvas coordinates
    const center = this._model.latLonToCanvas(
      lat,
      lon,
      this._map.width,
      this._map.height
    );
    
    // Calculate radius in canvas pixels
    // We need to find a point that is radiusInDegrees away
    const topPoint = this._model.latLonToCanvas(
      lat + radiusInDegrees,
      lon,
      this._map.width,
      this._map.height
    );
    const radiusPixels = Math.abs(topPoint.y - center.y);
    
    gc.save();
    gc.translate(this._map.x, this._map.y);
    
    // Clip to map bounds
    gc.beginPath();
    gc.rect(0, 0, this._map.width || 0, this._map.height || 0);
    gc.clip();
    
    // Convert hex color to rgba for transparency (cache the RGB values)
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Draw semi-transparent filled circle
    gc.beginPath();
    gc.arc(center.x, center.y, radiusPixels, 0, 2 * Math.PI);
    gc.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`; // Light fill
    gc.fill();
    
    // Draw border circle with more opacity
    gc.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`; // More visible border
    gc.lineWidth = 2.5;
    gc.stroke();
    gc.closePath();
    
    // Draw dashed inner circle for better visual reference
    gc.beginPath();
    gc.setLineDash([5, 5]);
    gc.arc(center.x, center.y, radiusPixels, 0, 2 * Math.PI);
    gc.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
    gc.lineWidth = 1;
    gc.stroke();
    gc.setLineDash([]); // Reset line dash
    gc.closePath();
    
    gc.restore();
  }

  // Function to draw label text for a marker
  // Separated from marker drawing to ensure labels appear on top
  // Ensures labels always stay within map bounds
  public drawLabel(
    gc: CanvasRenderingContext2D,
    lat: number,
    lon: number,
    displayData: string
  ) {
    if (!displayData) return;
    
    const { x, y } = this._model.latLonToCanvas(
      lat,
      lon,
      this._map.width,
      this._map.height
    );
    
    gc.save();
    gc.translate(this._map.x, this._map.y);
    
    // Clip to map bounds to ensure nothing is drawn outside
    gc.beginPath();
    gc.rect(0, 0, this._map.width || 0, this._map.height || 0);
    gc.clip();
    
    // Measure text for background sizing
    gc.font = "bold 13px Arial";
    gc.textAlign = "left";
    gc.textBaseline = "middle";
    const textMetrics = gc.measureText(displayData);
    const textWidth = textMetrics.width;
    const textHeight = 16;
    const padding = 4;
    
    // Calculate label bounds
    const labelWidth = textWidth + padding * 2;
    const labelHeight = textHeight + padding;
    
    // Initial position: above and slightly to the right of the marker
    let textX = x + 8;
    let textY = y - 12;
    
    // Adjust position to keep label within map bounds
    const mapWidth = this._map.width || 0;
    const mapHeight = this._map.height || 0;
    
    // Check right edge - if label goes outside, move it to the left of the marker
    if (textX + labelWidth > mapWidth) {
      textX = x - textWidth - padding - 8; // Position to the left of marker
    }
    
    // Check left edge - if label goes outside, move it to the right
    if (textX < padding) {
      textX = padding;
    }
    
    // Check top edge - if label goes outside, move it below the marker
    if (textY - labelHeight / 2 < padding) {
      textY = y + 12; // Position below marker
    }
    
    // Check bottom edge - if label goes outside, move it above
    if (textY + labelHeight / 2 > mapHeight - padding) {
      textY = y - 12; // Position above marker
      // If still outside, position at bottom with padding
      if (textY - labelHeight / 2 < padding) {
        textY = mapHeight - labelHeight / 2 - padding;
      }
    }
    
    // Calculate background rectangle position
    const bgX = textX - padding;
    const bgY = textY - textHeight / 2 - padding / 2;
    
    // Draw semi-transparent background rectangle for better contrast
    gc.fillStyle = "rgba(0, 0, 0, 0.7)";
    gc.fillRect(
      bgX,
      bgY,
      labelWidth,
      labelHeight
    );
    
    // Draw white text with dark outline for maximum visibility
    gc.strokeStyle = "rgba(0, 0, 0, 0.8)";
    gc.lineWidth = 3;
    gc.strokeText(displayData, textX, textY);
    
    gc.fillStyle = "white";
    gc.fillText(displayData, textX, textY);
    
    gc.restore();
  }

  //draw the widget
  draw(gc: CanvasRenderingContext2D) {
    gc.save();
    if (this._map.fill!) {
      gc.fillStyle = this._map.fill;
      gc.fillRect(
        this._map.x!,
        this._map.y!,
        this._map.width!,
        this._map.height!
      );
    }

    //call any map drawing functions to display map features
    this.drawMapFeatureFunctions.forEach((func) => {
      func(gc, this._map.x, this._map.y, this._map.width, this._map.height);
    });

    // First pass: Draw all markers (without labels)
    // This ensures markers are drawn in the correct z-order
    this._model.points.forEach((property: MapPoint) => {
      const { latitude, longitude } = property;
      this.drawMarker(
        gc,
        latitude,
        longitude
      );
    });

    // Second pass: Draw all labels on top of markers
    // This ensures labels always appear in front and are never hidden
    this._model.points.forEach((property: MapPoint) => {
      if (property.dataDisplay) {
        const { latitude, longitude } = property;
        this.drawLabel(
          gc,
          latitude,
          longitude,
          property.dataDisplay
        );
      }
    });

    // Draw distance circles and selection points (if distance filter is active)
    // Draw circles first, then points on top for proper z-ordering
    const point1Color = "#0066cc"; // Blue for point 1
    const point2Color = "#00cc66"; // Green for point 2
    
    if (this._map.selectionPoint1 && this._map.maxDistance) {
      this.drawDistanceCircle(
        gc,
        this._map.selectionPoint1.latitude,
        this._map.selectionPoint1.longitude,
        this._map.maxDistance,
        point1Color
      );
      this.drawSelectionPoint(
        gc,
        this._map.selectionPoint1.latitude,
        this._map.selectionPoint1.longitude,
        1,
        point1Color
      );
    }
    
    if (this._map.selectionPoint2 && this._map.maxDistance) {
      this.drawDistanceCircle(
        gc,
        this._map.selectionPoint2.latitude,
        this._map.selectionPoint2.longitude,
        this._map.maxDistance,
        point2Color
      );
      this.drawSelectionPoint(
        gc,
        this._map.selectionPoint2.latitude,
        this._map.selectionPoint2.longitude,
        2,
        point2Color
      );
    }

    //draw the border if there is one
    if (this._map.border) {
      gc.strokeStyle = this._map.border;
      gc.lineWidth = 1;
      let w = this._map.width || 0;
      let h = this._map.height || 0;
      gc.strokeRect(this._map.x, this._map.y, w, h);
    }
    gc.restore();
  }
}
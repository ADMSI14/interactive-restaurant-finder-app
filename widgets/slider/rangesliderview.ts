import { RangeSliderModel } from "./rangeslidermodel";
import { RangeSlider } from "./rangeslider";

export class RangeSliderView {
    // Reference to the RangeSlider widget and its model
    private _rangeSlider: RangeSlider;
    private _model: RangeSliderModel;
    private VIEW_WIDTH?: number;
    private VIEW_HEIGHT?: number;

    // RangeSlider visual constants
    private readonly TRACK_HEIGHT = 4;
    private readonly THUMB_RADIUS = 8;
    private readonly TRACK_PADDING = 10; // Padding on sides for thumbs

    // Constructor for RangeSliderView
    constructor(rangeSlider: RangeSlider, model: RangeSliderModel) {
        this._rangeSlider = rangeSlider;
        this._model = model;
        this.VIEW_WIDTH = this._rangeSlider.width;
        this.VIEW_HEIGHT = this._rangeSlider.height;
    }

    // Draws the range slider onto the provided graphics context
    public draw(gc: CanvasRenderingContext2D): void {
        gc.save();
        gc.translate(this._rangeSlider.margin, this._rangeSlider.margin);
        gc.translate(this._rangeSlider.x, this._rangeSlider.y);

        const width = this.VIEW_WIDTH || 200;
        const height = this.VIEW_HEIGHT || 20;
        const trackY = height / 2;
        const trackStartX = this.TRACK_PADDING;
        const trackEndX = width - this.TRACK_PADDING;
        const trackWidth = trackEndX - trackStartX;

        // Draw track (background line)
        gc.beginPath();
        gc.moveTo(trackStartX, trackY);
        gc.lineTo(trackEndX, trackY);
        gc.strokeStyle = this._rangeSlider.trackColor || "#cccccc";
        gc.lineWidth = this.TRACK_HEIGHT;
        gc.stroke();
        gc.closePath();

        // Draw active range (between min and max thumbs)
        const minPosition = this._model.positionFromMinValue();
        const maxPosition = this._model.positionFromMaxValue();
        // Allow thumbs to extend to edges (0 and width) when at min/max values
        // This allows the thumb to visually reach the absolute left/right edges
        const minX = minPosition === 0 ? 0 : trackStartX + minPosition * trackWidth;
        const maxX = maxPosition === 1 ? width : trackStartX + maxPosition * trackWidth;

        // Draw active range highlight
        // Use track boundaries for the highlight, but allow thumbs to extend beyond
        const highlightStartX = Math.max(trackStartX, minX);
        const highlightEndX = Math.min(trackEndX, maxX);
        if (highlightStartX < highlightEndX) {
            gc.beginPath();
            gc.moveTo(highlightStartX, trackY);
            gc.lineTo(highlightEndX, trackY);
            gc.strokeStyle = this._rangeSlider.rangeColor || "#0066cc";
            gc.lineWidth = this.TRACK_HEIGHT;
            gc.stroke();
            gc.closePath();
        }

        // Draw min thumb (left handle)
        gc.beginPath();
        gc.arc(minX, trackY, this.THUMB_RADIUS, 0, 2 * Math.PI);
        
        // Fill thumb with different color based on state
        if (this._model.draggingThumb === "min") {
            gc.fillStyle = this._rangeSlider.highlightColour || "#0066cc";
        } else if (this._model.state === "hover") {
            gc.fillStyle = this._rangeSlider.highlightColour || "#3399ff";
        } else {
            gc.fillStyle = this._rangeSlider.thumbColor || "#0066cc";
        }
        gc.fill();
        
        // Draw min thumb border
        gc.strokeStyle = this._rangeSlider.border || "black";
        gc.lineWidth = 1;
        gc.stroke();
        gc.closePath();

        // Draw max thumb (right handle)
        gc.beginPath();
        gc.arc(maxX, trackY, this.THUMB_RADIUS, 0, 2 * Math.PI);
        
        // Fill thumb with different color based on state
        if (this._model.draggingThumb === "max") {
            gc.fillStyle = this._rangeSlider.highlightColour || "#0066cc";
        } else if (this._model.state === "hover") {
            gc.fillStyle = this._rangeSlider.highlightColour || "#3399ff";
        } else {
            gc.fillStyle = this._rangeSlider.thumbColor || "#0066cc";
        }
        gc.fill();
        
        // Draw max thumb border
        gc.strokeStyle = this._rangeSlider.border || "black";
        gc.lineWidth = 1;
        gc.stroke();
        gc.closePath();

        gc.restore();
    }

    // Update view whenever model is modified.
    public update(): void {
        // Currently nothing to do here.
        // draw() will always render current model state.
        return;
    }
}


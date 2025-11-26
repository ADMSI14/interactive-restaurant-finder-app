import { SliderModel } from "./slidermodel";
import { Slider } from "./slider";

export class SliderView {
    // Reference to the Slider widget and its model
    private _slider: Slider;
    private _model: SliderModel;
    private VIEW_WIDTH?: number;
    private VIEW_HEIGHT?: number;

    // Slider visual constants
    private readonly TRACK_HEIGHT = 4;
    private readonly THUMB_RADIUS = 8;
    private readonly TRACK_PADDING = 10; // Padding on sides for thumb

    // Constructor for SliderView
    constructor(slider: Slider, model: SliderModel) {
        this._slider = slider;
        this._model = model;
        this.VIEW_WIDTH = this._slider.width;
        this.VIEW_HEIGHT = this._slider.height;
    }

    // Draws the slider onto the provided graphics context
    public draw(gc: CanvasRenderingContext2D): void {
        gc.save();
        gc.translate(this._slider.margin, this._slider.margin);
        gc.translate(this._slider.x, this._slider.y);

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
        gc.strokeStyle = this._slider.trackColor || "#cccccc";
        gc.lineWidth = this.TRACK_HEIGHT;
        gc.stroke();
        gc.closePath();

        // Calculate thumb position based on value
        const position = this._model.positionFromValue();
        const thumbX = trackStartX + position * trackWidth;

        // Draw thumb (draggable handle)
        gc.beginPath();
        gc.arc(thumbX, trackY, this.THUMB_RADIUS, 0, 2 * Math.PI);
        
        // Fill thumb with different color based on state
        if (this._model.state === "dragging") {
            gc.fillStyle = this._slider.highlightColour || "#0066cc";
        } else if (this._model.state === "hover") {
            gc.fillStyle = this._slider.highlightColour || "#3399ff";
        } else {
            gc.fillStyle = this._slider.thumbColor || "#0066cc";
        }
        gc.fill();
        
        // Draw thumb border
        gc.strokeStyle = this._slider.border || "black";
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


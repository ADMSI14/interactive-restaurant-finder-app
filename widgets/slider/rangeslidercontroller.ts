import { SKEvent, SKMouseEvent } from "../../simplekit/src/imperative-mode";
import { RangeSliderModel } from "./rangeslidermodel";
import { RangeSlider } from "./rangeslider";

export class RangeSliderController {
    private _rangeSlider: RangeSlider;
    private _model: RangeSliderModel;
    private _isDragging: boolean = false;

    public eventHandlers: Array<(e: SKEvent, rangeSlider: RangeSlider, model: RangeSliderModel) => void> = [];

    constructor(rangeSlider: RangeSlider, model: RangeSliderModel) {
        this._rangeSlider = rangeSlider;
        this._model = model;
    }

    // Calculate which thumb is closest to the mouse position
    private getClosestThumb(mouseX: number): "min" | "max" {
        const width = this._rangeSlider.width || 200;
        const TRACK_PADDING = 10;
        const visualTrackStart = TRACK_PADDING;
        const visualTrackEnd = width - TRACK_PADDING;
        const trackWidth = visualTrackEnd - visualTrackStart;

        const minPosition = this._model.positionFromMinValue();
        const maxPosition = this._model.positionFromMaxValue();
        const minX = visualTrackStart + minPosition * trackWidth;
        const maxX = visualTrackStart + maxPosition * trackWidth;

        // Determine which thumb is closer to the mouse
        const distanceToMin = Math.abs(mouseX - minX);
        const distanceToMax = Math.abs(mouseX - maxX);

        return distanceToMin < distanceToMax ? "min" : "max";
    }

    handleMouseEvent(me: SKMouseEvent) {
        const width = this._rangeSlider.width || 200;
        const TRACK_PADDING = 10;
        // Allow thumb to reach from 0 to width (full slider width)
        // Track visually starts at TRACK_PADDING but we allow interaction from 0

        // Calculate mouse position relative to range slider (accounting for slider's position and margin)
        // Mouse events are in global coordinates, so subtract slider's global position
        const mouseX = me.x - this._rangeSlider.x - this._rangeSlider.margin;

        switch (me.type) {
            case "mousedown":
                // Determine which thumb to drag (closest to mouse)
                const thumbToDrag = this.getClosestThumb(mouseX);
                this._model.draggingThumb = thumbToDrag;
                this._isDragging = true;

                // Calculate position relative to slider track
                // Map mouseX (0 to width) to track position (TRACK_PADDING to width-TRACK_PADDING)
                const clampedMouseX = Math.max(0, Math.min(width, mouseX));
                // Convert to relative position on visual track (0.0 to 1.0)
                // Visual track starts at TRACK_PADDING, so adjust accordingly
                const visualTrackStart = TRACK_PADDING;
                const visualTrackEnd = width - TRACK_PADDING;
                const visualTrackWidth = visualTrackEnd - visualTrackStart;
                
                let relativePosition: number;
                if (clampedMouseX <= visualTrackStart) {
                    relativePosition = 0;  // At or before visual track start = minimum
                } else if (clampedMouseX >= visualTrackEnd) {
                    relativePosition = 1;  // At or after visual track end = maximum
                } else {
                    relativePosition = (clampedMouseX - visualTrackStart) / visualTrackWidth;
                }
                
                const newValue = this._model.valueFromPosition(relativePosition);

                // Update the appropriate thumb
                if (thumbToDrag === "min") {
                    this._model.minValue = newValue;
                    this._model.state = "dragging-min";
                } else {
                    this._model.maxValue = newValue;
                    this._model.state = "dragging-max";
                }

                // Call the onChange callback if it's set
                if (this._rangeSlider.onChange) {
                    this._rangeSlider.onChange(this._model.minValue, this._model.maxValue);
                }

                // Trigger action event
                if (
                    this._rangeSlider.sendEvent({
                        source: this,
                        timeStamp: me.timeStamp,
                        type: "action",
                    } as SKEvent)
                )
                    return true;
                break;

            case "mousemove":
                if (this._isDragging && this._model.draggingThumb) {
                    // Calculate position relative to slider track
                    // Map mouseX (0 to width) to track position (TRACK_PADDING to width-TRACK_PADDING)
                    const clampedMouseX = Math.max(0, Math.min(width, mouseX));
                    // Convert to relative position on visual track (0.0 to 1.0)
                    // Visual track starts at TRACK_PADDING, so adjust accordingly
                    const visualTrackStart = TRACK_PADDING;
                    const visualTrackEnd = width - TRACK_PADDING;
                    const visualTrackWidth = visualTrackEnd - visualTrackStart;
                    
                    let relativePosition: number;
                    if (clampedMouseX <= visualTrackStart) {
                        relativePosition = 0;  // At or before visual track start = minimum
                    } else if (clampedMouseX >= visualTrackEnd) {
                        relativePosition = 1;  // At or after visual track end = maximum
                    } else {
                        relativePosition = (clampedMouseX - visualTrackStart) / visualTrackWidth;
                    }
                    
                    const newValue = this._model.valueFromPosition(relativePosition);

                    // Update the appropriate thumb
                    if (this._model.draggingThumb === "min") {
                        this._model.minValue = newValue;
                        this._model.state = "dragging-min";
                    } else {
                        this._model.maxValue = newValue;
                        this._model.state = "dragging-max";
                    }

                    // Call the onChange callback if it's set
                    if (this._rangeSlider.onChange) {
                        this._rangeSlider.onChange(this._model.minValue, this._model.maxValue);
                    }

                    // Trigger action event for continuous updates
                    this._rangeSlider.sendEvent({
                        source: this,
                        timeStamp: me.timeStamp,
                        type: "action",
                    } as SKEvent);
                }
                break;

            case "mouseup":
                if (this._isDragging) {
                    this._isDragging = false;
                    this._model.draggingThumb = null;
                    this._model.state = "hover";
                }
                break;

            case "mouseenter":
                if (!this._isDragging) {
                    this._model.state = "hover";
                }
                break;

            case "mouseexit":
                if (!this._isDragging) {
                    this._model.state = "idle";
                    this._model.draggingThumb = null;
                }
                break;
        }

        return false;
    }
}


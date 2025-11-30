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
        
        // Calculate thumb positions, allowing them to extend to edges when at min/max
        const minX = minPosition === 0 ? 0 : visualTrackStart + minPosition * trackWidth;
        const maxX = maxPosition === 1 ? width : visualTrackStart + maxPosition * trackWidth;

        // Determine which thumb is closer to the mouse
        const distanceToMin = Math.abs(mouseX - minX);
        const distanceToMax = Math.abs(mouseX - maxX);

        // If thumbs are very close together (within 5 pixels), use mouse position to determine
        // If mouse is on the left side of the overlap, prefer min; if on right, prefer max
        if (Math.abs(minX - maxX) < 5) {
            // Thumbs are overlapping or very close
            // Use the current dragging thumb if already dragging, otherwise use mouse position
            if (this._isDragging && this._model.draggingThumb) {
                return this._model.draggingThumb;
            }
            // If mouse is to the left of center, prefer min; otherwise prefer max
            const centerX = (minX + maxX) / 2;
            return mouseX < centerX ? "min" : "max";
        }

        return distanceToMin < distanceToMax ? "min" : "max";
    }

    handleMouseEvent(me: SKMouseEvent) {
        const width = this._rangeSlider.width || 200;
        const TRACK_PADDING = 10;
        // Allow thumb to reach from 0 to width (full slider width)
        // Track visually starts at TRACK_PADDING but we allow interaction from 0

        // Calculate mouse position relative to range slider
        // Mouse events are in global coordinates, so subtract slider's position and margin
        // The view draws with translate(margin, margin) then translate(x, y)
        // So we need to account for both to get coordinates relative to the drawing area
        const mouseX = me.x - this._rangeSlider.x - this._rangeSlider.margin;

        switch (me.type) {
            case "mousedown":
                // Determine which thumb to drag (closest to mouse)
                const thumbToDrag = this.getClosestThumb(mouseX);
                this._model.draggingThumb = thumbToDrag;
                this._isDragging = true;

                // Calculate position directly from mouse position for immediate response
                // Map mouseX to track position - thumb center should align with cursor
                const clampedMouseX = Math.max(0, Math.min(width, mouseX));
                // Visual track starts at TRACK_PADDING, so adjust accordingly
                const visualTrackStart = TRACK_PADDING;
                const visualTrackEnd = width - TRACK_PADDING;
                const visualTrackWidth = visualTrackEnd - visualTrackStart;
                
                // Calculate relative position - map cursor directly to thumb center position
                // This ensures thumb center aligns with cursor, not offset
                let relativePosition: number;
                // Allow clicking anywhere from 0 to width to set min/max
                // If mouse is at or before TRACK_PADDING, set to minimum (position 0)
                // If mouse is at or after (width - TRACK_PADDING), set to maximum (position 1)
                if (clampedMouseX <= visualTrackStart) {
                    relativePosition = 0;  // At or before visual track start = minimum
                } else if (clampedMouseX >= visualTrackEnd) {
                    relativePosition = 1;  // At or after visual track end = maximum
                } else {
                    // Map cursor position directly to thumb center on track
                    // This creates a 1:1 mapping between cursor and thumb position
                    relativePosition = (clampedMouseX - visualTrackStart) / visualTrackWidth;
                }
                
                // Ensure relativePosition is exactly 0 or 1 when at edges to avoid floating point issues
                if (relativePosition < 0.001) relativePosition = 0;
                if (relativePosition > 0.999) relativePosition = 1;
                
                // Force to exact min/max when at edges to ensure it reaches the absolute minimum/maximum
                let newValue: number;
                if (relativePosition === 0) {
                    newValue = this._model.min;  // Exact minimum
                } else if (relativePosition === 1) {
                    newValue = this._model.max;  // Exact maximum
                } else {
                    newValue = this._model.valueFromPosition(relativePosition);
                }

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
                    // Calculate position directly from mouse position for immediate response
                    // Map mouseX to track position - thumb center should align with cursor
                    const clampedMouseX = Math.max(0, Math.min(width, mouseX));
                    // Visual track starts at TRACK_PADDING, so adjust accordingly
                    const visualTrackStart = TRACK_PADDING;
                    const visualTrackEnd = width - TRACK_PADDING;
                    const visualTrackWidth = visualTrackEnd - visualTrackStart;
                    
                    // Calculate relative position - map cursor directly to thumb center position
                    // This ensures thumb center aligns with cursor, not offset
                    let relativePosition: number;
                    if (clampedMouseX <= visualTrackStart) {
                        relativePosition = 0;  // At or before visual track start = minimum
                    } else if (clampedMouseX >= visualTrackEnd) {
                        relativePosition = 1;  // At or after visual track end = maximum
                    } else {
                        // Map cursor position directly to thumb center on track
                        // This creates a 1:1 mapping between cursor and thumb position
                        relativePosition = (clampedMouseX - visualTrackStart) / visualTrackWidth;
                    }
                    
                    // Ensure relativePosition is exactly 0 or 1 when at edges to avoid floating point issues
                    if (relativePosition < 0.001) relativePosition = 0;
                    if (relativePosition > 0.999) relativePosition = 1;
                    
                    // Force to exact min/max when at edges to ensure it reaches the absolute minimum/maximum
                    let newValue: number;
                    if (relativePosition === 0) {
                        newValue = this._model.min;  // Exact minimum
                    } else if (relativePosition === 1) {
                        newValue = this._model.max;  // Exact maximum
                    } else {
                        newValue = this._model.valueFromPosition(relativePosition);
                    }

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


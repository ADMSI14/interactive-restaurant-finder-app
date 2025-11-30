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
        const width = this._rangeSlider.width;
        const TRACK_PADDING = 10;
        const trackStartX = TRACK_PADDING;
        const trackEndX = width - TRACK_PADDING;
        const trackWidth = trackEndX - trackStartX;

        const minPosition = this._model.positionFromMinValue();
        const maxPosition = this._model.positionFromMaxValue();
        const minX = trackStartX + minPosition * trackWidth;
        const maxX = trackStartX + maxPosition * trackWidth;

        // Determine which thumb is closer to the mouse
        const distanceToMin = Math.abs(mouseX - minX);
        const distanceToMax = Math.abs(mouseX - maxX);

        return distanceToMin < distanceToMax ? "min" : "max";
    }

    handleMouseEvent(me: SKMouseEvent) {
        const width = this._rangeSlider.width;
        const TRACK_PADDING = 10;
        const trackStartX = TRACK_PADDING;
        const trackEndX = width - TRACK_PADDING;
        const trackWidth = trackEndX - trackStartX;

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
                const relativePosition = (mouseX - trackStartX) / trackWidth;
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
                    const relativePosition = (mouseX - trackStartX) / trackWidth;
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


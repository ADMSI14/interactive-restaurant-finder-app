import { SKEvent, SKMouseEvent } from "../../simplekit/src/imperative-mode";
import { SliderModel } from "./slidermodel";
import { Slider } from "./slider";

export class SliderController {
    private _slider: Slider;
    private _model: SliderModel;
    private _isDragging: boolean = false;

    public eventHandlers: Array<(e: SKEvent, slider: Slider, model: SliderModel) => void> = [];

    constructor(slider: Slider, model: SliderModel) {
        this._slider = slider;
        this._model = model;
    }

    handleMouseEvent(me: SKMouseEvent) {
        const width = this._slider.width;
        const TRACK_PADDING = 10;
        const trackStartX = TRACK_PADDING;
        const trackEndX = width - TRACK_PADDING;
        const trackWidth = trackEndX - trackStartX;

        // Calculate mouse position relative to slider (accounting for slider's position and margin)
        // Mouse events are in global coordinates, so subtract slider's global position
        const mouseX = me.x - this._slider.x - this._slider.margin;

        switch (me.type) {
            case "mousedown":
                // Calculate position relative to slider track
                const relativePosition = (mouseX - trackStartX) / trackWidth;
                const newValue = this._model.valueFromPosition(relativePosition);
                
                this._model.value = newValue;
                this._model.state = "dragging";
                this._isDragging = true;

                // Trigger action event
                if (
                    this._slider.sendEvent({
                        source: this,
                        timeStamp: me.timeStamp,
                        type: "action",
                    } as SKEvent)
                )
                    return true;
                break;

            case "mousemove":
                if (this._isDragging) {
                    // Calculate position relative to slider track
                    const relativePosition = (mouseX - trackStartX) / trackWidth;
                    const newValue = this._model.valueFromPosition(relativePosition);
                    
                    this._model.value = newValue;
                    this._model.state = "dragging";

                    // Trigger action event for continuous updates
                    this._slider.sendEvent({
                        source: this,
                        timeStamp: me.timeStamp,
                        type: "action",
                    } as SKEvent);
                }
                break;

            case "mouseup":
                if (this._isDragging) {
                    this._isDragging = false;
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
                }
                break;
        }

        return false;
    }
}


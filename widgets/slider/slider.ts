import { SKEvent, SKMouseEvent } from "../../simplekit/src/events";
import { SKElement, SKElementProps, Style } from "../../simplekit/src/widget";
import { SliderController } from "./slidercontroller";
import { SliderModel } from "./slidermodel";
import { SliderView } from "./sliderview";

export type SliderProps = SKElementProps & {
    value?: number;
    min?: number;
    max?: number;
    trackColor?: string;
    thumbColor?: string;
};

export class Slider extends SKElement {
    // MVC components
    private _model: SliderModel;
    private _view: SliderView;
    private _controller: SliderController;
    
    // Callback for when slider value changes
    public onChange: ((value: number) => void) | null = null;

    // Custom colors
    protected _highlightColour = Style.highlightColour;
    protected _trackColor: string | undefined;
    protected _thumbColor: string | undefined;

    set highlightColour(hc: string) {
        this._highlightColour = hc;
    }
    get highlightColour() {
        return this._highlightColour;
    }

    set trackColor(color: string | undefined) {
        this._trackColor = color;
    }
    get trackColor() {
        return this._trackColor;
    }

    set thumbColor(color: string | undefined) {
        this._thumbColor = color;
    }
    get thumbColor() {
        return this._thumbColor;
    }

    constructor({
        value = 50,
        min = 0,
        max = 100,
        trackColor,
        thumbColor,
        fill = Style.defaultColour,
        border = "black",
        width = 200,
        height = 20,
        margin = 5,
        ...elementProps
    }: SliderProps = {}) {
        super(elementProps);
        this.fill = fill;
        this.width = width;
        this.height = height;
        this.border = border;
        this._trackColor = trackColor;
        this._thumbColor = thumbColor;

        this._model = new SliderModel(value, min, max);
        this._view = new SliderView(this, this._model);
        this._controller = new SliderController(this, this._model);

        // Initial layout calculations
        this.layout();
    }

    // Draw slider.
    public draw(gc: CanvasRenderingContext2D): void {
        super.draw(gc);
        this._view.draw(gc);
    }

    // Get/set value of slider.
    public get value() {
        return this._model.value;
    }
    public set value(value: number) {
        this._model.value = value;
        this._view.update();
    }

    // Get/set min value of slider.
    public get min() {
        return this._model.min;
    }
    public set min(value: number) {
        this._model.min = value;
        this._view.update();
    }

    // Get/set max value of slider.
    public get max() {
        return this._model.max;
    }
    public set max(value: number) {
        this._model.max = value;
        this._view.update();
    }

    public sendEvent(e: SKEvent, capture?: boolean): boolean {
        return super.sendEvent(e, capture);
    }

    // Handle mouse events.
    handleMouseEvent(me: SKMouseEvent): boolean {
        this._controller.handleMouseEvent(me);
        return true;
    }
}

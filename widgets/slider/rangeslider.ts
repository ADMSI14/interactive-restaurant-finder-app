import { SKEvent, SKMouseEvent } from "../../simplekit/src/events";
import { SKElement, SKElementProps, Style } from "../../simplekit/src/widget";
import { RangeSliderController } from "./rangeslidercontroller";
import { RangeSliderModel } from "./rangeslidermodel";
import { RangeSliderView } from "./rangesliderview";

export type RangeSliderProps = SKElementProps & {
    minValue?: number;
    maxValue?: number;
    min?: number;
    max?: number;
    trackColor?: string;
    thumbColor?: string;
    rangeColor?: string;
};

export class RangeSlider extends SKElement {
    // MVC components
    private _model: RangeSliderModel;
    private _view: RangeSliderView;
    private _controller: RangeSliderController;

    // Callback for when range slider values change
    public onChange: ((minValue: number, maxValue: number) => void) | null = null;

    // Custom colors
    protected _highlightColour = Style.highlightColour;
    protected _trackColor: string | undefined;
    protected _thumbColor: string | undefined;
    protected _rangeColor: string | undefined;

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

    set rangeColor(color: string | undefined) {
        this._rangeColor = color;
    }
    get rangeColor() {
        return this._rangeColor;
    }

    constructor({
        minValue = 25,
        maxValue = 75,
        min = 0,
        max = 100,
        trackColor,
        thumbColor,
        rangeColor,
        fill = Style.defaultColour,
        border = "black",
        width = 200,
        height = 20,
        margin = 5,
        ...elementProps
    }: RangeSliderProps = {}) {
        super(elementProps);
        this.fill = fill;
        this.width = width;
        this.height = height;
        this.border = border;
        this._trackColor = trackColor;
        this._thumbColor = thumbColor;
        this._rangeColor = rangeColor;

        this._model = new RangeSliderModel(minValue, maxValue, min, max);
        this._view = new RangeSliderView(this, this._model);
        this._controller = new RangeSliderController(this, this._model);

        // Initial layout calculations
        this.layout();
    }

    // Draw range slider.
    public draw(gc: CanvasRenderingContext2D): void {
        super.draw(gc);
        this._view.draw(gc);
    }

    // Get/set min value of range slider.
    public get minValue() {
        return this._model.minValue;
    }
    public set minValue(value: number) {
        this._model.minValue = value;
        this._view.update();
    }

    // Get/set max value of range slider.
    public get maxValue() {
        return this._model.maxValue;
    }
    public set maxValue(value: number) {
        this._model.maxValue = value;
        this._view.update();
    }

    // Get/set min range of range slider.
    public get min() {
        return this._model.min;
    }
    public set min(value: number) {
        this._model.min = value;
        this._view.update();
    }

    // Get/set max range of range slider.
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

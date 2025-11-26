import { SKEvent, SKMouseEvent } from "../../simplekit/src/events";
import { SKElement, SKElementProps, Style } from "../../simplekit/src/widget"
import { CheckBoxController } from "./cbcontroller";
import { CheckBoxModel } from "./cbmodel";
import { CheckBoxView } from "./cbview";

export type CheckBoxProps = SKElementProps & {checked?: boolean};

export class CheckBox extends SKElement {
  // MVC components
  private _model: CheckBoxModel;
  private _view: CheckBoxView;
  private _controller: CheckBoxController;

  // Callback for when checkbox state changes
  public onChange: ((checked: boolean) => void) | null = null;

  // colour on hover
  protected _highlightColour = Style.highlightColour;
  set highlightColour(hc: string) {
    this._highlightColour = hc;
  }
  get highlightColour() {
    return this._highlightColour;
  }
 
  constructor({
    checked = false,
    fill = Style.defaultColour,
    border = "black",
    width = 20,
    height = 20,
    margin = 5,
    ...elementProps
  }: CheckBoxProps = {}) {
    super(elementProps);
    this.fill = fill;
    this.width = width;
    this.height = height;
    this.border = border;

    this._model = new CheckBoxModel(checked);
    this._view = new CheckBoxView(this, this._model);
    this._controller = new CheckBoxController(this, this._model);

    // Initial layout calculations
    this.layout();
  }

  // Draw checkbox.
  public draw(gc: CanvasRenderingContext2D): void {
    super.draw(gc);
    this._view.draw(gc); 
  }

  // Get/set check state of checkbox.
  public get checked() {
    return this._model.checked;
  }
  public set checked(value: boolean) {
    this._model.checked = value;
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
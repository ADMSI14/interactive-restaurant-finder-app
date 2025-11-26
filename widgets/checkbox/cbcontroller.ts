import { SKEvent, SKMouseEvent } from "../../simplekit/src/imperative-mode";
import { CheckBoxModel } from "./cbmodel";
import { CheckBox } from "./checkbox";

export class CheckBoxController
{
    private _checkbox: CheckBox;
    private _model: CheckBoxModel;

    public eventHandlers: Array<(e: SKEvent, checkbox: CheckBox, model: CheckBoxModel) => void> = [];

    constructor(checkbox: CheckBox, model: CheckBoxModel)
    {
        this._checkbox = checkbox;
        this._model = model;
    }

    handleMouseEvent(me: SKMouseEvent) {
        switch (me.type) {
          case "mousedown":
            this._model.state = "check-started";
            // return true;
            break;
          case "mouseup":
            if (this._model.state === "check-started"
            ){
                this._model.state = "hover";
                this._model.checked = !this._model.checked;

                // Call the onChange callback if it's set
                if (this._checkbox.onChange) {
                    this._checkbox.onChange(this._model.checked);
                }

                // Still send the event for backwards compatibility
                if (
                  this._checkbox.sendEvent({
                    source: this,
                    timeStamp: me.timeStamp,
                    type: "action",
                  } as SKEvent)
                )
                  return true;
            }
            break;
            
          case "mouseenter":
            this._model.state = "hover";
            break;
          case "mouseexit":
            this._model.state = "idle";
            break;
        }
    
        return false;
      }
}
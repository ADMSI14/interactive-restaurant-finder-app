import { SKEvent, SKMouseEvent } from "../../simplekit/src/imperative-mode";
import { RadioButtonModel } from "./rbmodel";
import { RadioButton } from "./radiobutton";

export class RadioButtonController {
    private _radioButton: RadioButton;
    private _model: RadioButtonModel;

    public eventHandlers: Array<(e: SKEvent, radioButton: RadioButton, model: RadioButtonModel) => void> = [];

    constructor(radioButton: RadioButton, model: RadioButtonModel) {
        this._radioButton = radioButton;
        this._model = model;
    }

    handleMouseEvent(me: SKMouseEvent) {
        console.log(`RadioButtonController.handleMouseEvent: ${me.type}, state: ${this._model.state}`);
        switch (me.type) {
            case "mousedown":
                this._model.state = "select-started";
                console.log(`RadioButtonController: State set to select-started`);
                break;
            case "mouseup":
                console.log(`RadioButtonController: mouseup, current state: ${this._model.state}`);
                if (this._model.state === "select-started") {
                    this._model.state = "hover";
                    // RadioButton selection is handled by RadioButtonGroup
                    // Use the group's selectRadioButton which will trigger the callback
                    const group = (this._radioButton as any)._group;
                    if (group) {
                        console.log(`RadioButtonController: Selecting radio button via group`);
                        group.selectRadioButton(this._radioButton);
                    } else {
                        console.log(`RadioButtonController: No group found, sending action event as fallback`);
                        // Fallback: send action event if no group
                        this._radioButton.sendEvent({
                            source: this,
                            timeStamp: me.timeStamp,
                            type: "action",
                        } as SKEvent);
                    }
                    return true;
                } else {
                    console.log(`RadioButtonController: State is not select-started, not sending event`);
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


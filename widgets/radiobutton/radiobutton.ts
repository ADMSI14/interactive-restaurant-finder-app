import { SKEvent, SKMouseEvent } from "../../simplekit/src/events";
import { SKElement, SKElementProps, Style } from "../../simplekit/src/widget";
import { RadioButtonController } from "./rbcontroller";
import { RadioButtonModel } from "./rbmodel";
import { RadioButtonView } from "./rbview";

export type RadioButtonProps = SKElementProps & { selected?: boolean };

export class RadioButton extends SKElement {
    // MVC components
    private _model: RadioButtonModel;
    private _view: RadioButtonView;
    private _controller: RadioButtonController;

    // Reference to group for exclusivity management
    private _group: RadioButtonGroup | null = null;

    // colour on hover
    protected _highlightColour = Style.highlightColour;
    set highlightColour(hc: string) {
        this._highlightColour = hc;
    }
    get highlightColour() {
        return this._highlightColour;
    }

    constructor({
        selected = false,
        fill = Style.defaultColour,
        border = "black",
        width = 20,
        height = 20,
        margin = 5,
        ...elementProps
    }: RadioButtonProps = {}) {
        super(elementProps);
        this.fill = fill;
        this.width = width;
        this.height = height;
        this.border = border;

        this._model = new RadioButtonModel(selected);
        this._view = new RadioButtonView(this, this._model);
        this._controller = new RadioButtonController(this, this._model);

        // Set up action event listener to handle selection
        this.setSKEventListener("action", (e: SKEvent) => {
            if (this._group) {
                this._group.selectRadioButton(this);
            } else {
                // If no group, toggle selection
                this.selected = !this.selected;
            }
        });

        // Initial layout calculations
        this.layout();
    }

    // Draw radio button.
    public draw(gc: CanvasRenderingContext2D): void {
        super.draw(gc);
        this._view.draw(gc);
    }

    // Get/set selected state of radio button.
    public get selected() {
        return this._model.selected;
    }
    public set selected(value: boolean) {
        this._model.selected = value;
        this._view.update();
    }

    // Set the group this radio button belongs to
    public setGroup(group: RadioButtonGroup | null): void {
        this._group = group;
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

// RadioButtonGroup manages exclusivity - only one radio button in a group can be selected
export class RadioButtonGroup {
    private _radioButtons: RadioButton[] = [];
    private _selectedRadioButton: RadioButton | null = null;

    // Add a radio button to this group
    public addRadioButton(radioButton: RadioButton): void {
        if (!this._radioButtons.includes(radioButton)) {
            this._radioButtons.push(radioButton);
            radioButton.setGroup(this);
            // If this is the first button and it's selected, set it as selected
            if (radioButton.selected && this._selectedRadioButton === null) {
                this._selectedRadioButton = radioButton;
            } else if (radioButton.selected) {
                // If another button is already selected, deselect this one
                radioButton.selected = false;
            }
        }
    }

    // Remove a radio button from this group
    public removeRadioButton(radioButton: RadioButton): void {
        const index = this._radioButtons.indexOf(radioButton);
        if (index > -1) {
            this._radioButtons.splice(index, 1);
            radioButton.setGroup(null);
            if (this._selectedRadioButton === radioButton) {
                this._selectedRadioButton = null;
            }
        }
    }

    // Select a radio button (deselects all others in the group)
    public selectRadioButton(radioButton: RadioButton): void {
        if (!this._radioButtons.includes(radioButton)) {
            return; // Radio button not in this group
        }

        // Deselect all other radio buttons in the group
        this._radioButtons.forEach(rb => {
            if (rb !== radioButton) {
                rb.selected = false;
            }
        });

        // Select the clicked radio button
        radioButton.selected = true;
        this._selectedRadioButton = radioButton;
    }

    // Get the currently selected radio button
    public get selectedRadioButton(): RadioButton | null {
        return this._selectedRadioButton;
    }

    // Get all radio buttons in this group
    public get radioButtons(): RadioButton[] {
        return [...this._radioButtons];
    }
}

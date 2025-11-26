import { RadioButtonModel } from "./rbmodel";
import { RadioButton } from "./radiobutton";

export class RadioButtonView {
    // Reference to the RadioButton widget and its model
    private _radioButton: RadioButton;
    private _model: RadioButtonModel;
    private VIEW_WIDTH?: number;
    private VIEW_HEIGHT?: number;

    // Constructor for RadioButtonView
    constructor(radioButton: RadioButton, model: RadioButtonModel) {
        this._radioButton = radioButton;
        this._model = model;
        this.VIEW_WIDTH = this._radioButton.width;
        this.VIEW_HEIGHT = this._radioButton.height;
    }

    // Draws the radio button onto the provided graphics context
    public draw(gc: CanvasRenderingContext2D): void {
        gc.save();
        gc.translate(this._radioButton.margin, this._radioButton.margin);
        gc.translate(this._radioButton.x, this._radioButton.y);
        
        // Calculate center and radius for circular radio button
        const centerX = (this.VIEW_WIDTH || 20) / 2;
        const centerY = (this.VIEW_HEIGHT || 20) / 2;
        const radius = Math.min((this.VIEW_WIDTH || 20), (this.VIEW_HEIGHT || 20)) / 2 - 2;
        
        // Draw outer circle
        gc.beginPath();
        gc.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        gc.fillStyle = this._radioButton.fill;
        gc.fill();
        
        // Draw border with hover highlight
        if (this._model.state === "hover") {
            gc.strokeStyle = this._radioButton.highlightColour;
        } else {
            gc.strokeStyle = this._radioButton.border;
        }
        gc.lineWidth = 2;
        gc.stroke();
        gc.closePath();
        
        // Draw inner filled circle if selected
        if (this._model.selected) {
            gc.beginPath();
            const innerRadius = radius * 0.5; // Inner circle is 50% of outer radius
            gc.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            gc.fillStyle = "black";
            gc.fill();
            gc.closePath();
        }
        
        gc.restore();
    }

    // Update view whenever model is modified.
    public update(): void {
        // Currently nothing to do here.
        // draw() will always render current model state.
        return;
    }
}


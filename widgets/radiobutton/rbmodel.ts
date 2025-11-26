/* 
   Model for RadioButton widget
*/
export class RadioButtonModel {
  private _state: "idle" | "select-started" | "hover" = "idle";
  private _selectedValue: boolean = false;

  constructor(isSelected: boolean = false) {
    this._selectedValue = isSelected;
  }

  public get selected() {
    return this._selectedValue;
  }

  public set selected(value: boolean) {
    this._selectedValue = value;
  }

  public get state() {
    return this._state;
  }
  public set state(value) {
    this._state = value;
  }
}


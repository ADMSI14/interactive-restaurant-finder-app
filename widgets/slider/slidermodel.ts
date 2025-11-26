/* 
   Model for Slider widget
*/
export class SliderModel {
  private _value: number;
  private _min: number;
  private _max: number;
  private _state: "idle" | "dragging" | "hover" = "idle";

  constructor(value: number, min: number = 0, max: number = 100) {
    this._min = min;
    this._max = max;
    // Clamp value to valid range
    this._value = Math.max(min, Math.min(max, value));
  }

  public get value() {
    return this._value;
  }

  public set value(value: number) {
    // Clamp value to valid range
    this._value = Math.max(this._min, Math.min(this._max, value));
  }

  public get min() {
    return this._min;
  }

  public set min(value: number) {
    this._min = value;
    // Ensure current value is still valid
    if (this._value < this._min) {
      this._value = this._min;
    }
  }

  public get max() {
    return this._max;
  }

  public set max(value: number) {
    this._max = value;
    // Ensure current value is still valid
    if (this._value > this._max) {
      this._value = this._max;
    }
  }

  public get state() {
    return this._state;
  }
  public set state(value) {
    this._state = value;
  }

  // Calculate value from position (0.0 to 1.0)
  public valueFromPosition(position: number): number {
    const clampedPosition = Math.max(0, Math.min(1, position));
    return this._min + clampedPosition * (this._max - this._min);
  }

  // Calculate position (0.0 to 1.0) from value
  public positionFromValue(): number {
    if (this._max === this._min) return 0;
    return (this._value - this._min) / (this._max - this._min);
  }
}


/* 
   Model for RangeSlider widget
*/
export class RangeSliderModel {
  private _minValue: number;
  private _maxValue: number;
  private _min: number;
  private _max: number;
  private _state: "idle" | "dragging-min" | "dragging-max" | "hover" = "idle";
  private _draggingThumb: "min" | "max" | null = null;

  constructor(minValue: number, maxValue: number, min: number = 0, max: number = 100) {
    this._min = min;
    this._max = max;
    // Clamp values to valid range and ensure minValue <= maxValue
    this._minValue = Math.max(min, Math.min(max, minValue));
    this._maxValue = Math.max(min, Math.min(max, maxValue));
    // Ensure minValue doesn't exceed maxValue
    if (this._minValue > this._maxValue) {
      this._minValue = this._maxValue;
    }
  }

  public get minValue() {
    return this._minValue;
  }

  public set minValue(value: number) {
    // Clamp value to valid range and ensure it doesn't exceed maxValue
    this._minValue = Math.max(this._min, Math.min(this._maxValue, value));
  }

  public get maxValue() {
    return this._maxValue;
  }

  public set maxValue(value: number) {
    // Clamp value to valid range and ensure it's not less than minValue
    this._maxValue = Math.max(this._minValue, Math.min(this._max, value));
  }

  public get min() {
    return this._min;
  }

  public set min(value: number) {
    this._min = value;
    // Ensure current values are still valid
    if (this._minValue < this._min) {
      this._minValue = this._min;
    }
    if (this._maxValue < this._min) {
      this._maxValue = this._min;
    }
  }

  public get max() {
    return this._max;
  }

  public set max(value: number) {
    this._max = value;
    // Ensure current values are still valid
    if (this._minValue > this._max) {
      this._minValue = this._max;
    }
    if (this._maxValue > this._max) {
      this._maxValue = this._max;
    }
  }

  public get state() {
    return this._state;
  }
  public set state(value) {
    this._state = value;
  }

  public get draggingThumb() {
    return this._draggingThumb;
  }
  public set draggingThumb(value: "min" | "max" | null) {
    this._draggingThumb = value;
  }

  // Calculate value from position (0.0 to 1.0)
  public valueFromPosition(position: number): number {
    const clampedPosition = Math.max(0, Math.min(1, position));
    return this._min + clampedPosition * (this._max - this._min);
  }

  // Calculate position (0.0 to 1.0) from min value
  public positionFromMinValue(): number {
    if (this._max === this._min) return 0;
    return (this._minValue - this._min) / (this._max - this._min);
  }

  // Calculate position (0.0 to 1.0) from max value
  public positionFromMaxValue(): number {
    if (this._max === this._min) return 1;
    return (this._maxValue - this._min) / (this._max - this._min);
  }
}


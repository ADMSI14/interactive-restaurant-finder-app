# RestaurantFinder Application - Project Report

## Overview

The RestaurantFinder application is an interactive web application that allows users to explore and filter restaurants in Fredericton, New Brunswick. The application displays restaurants on an interactive map, provides detailed information on click, and offers comprehensive filtering capabilities using custom-built widgets.

## Architecture

### Model-View-Controller (MVC) Pattern

The application follows the MVC architectural pattern at multiple levels:

1. **Application Level (RestaurantFinder)**
   - **Model** (`RestaurantFinderModel`): Manages restaurant data, filter state, and business logic
   - **View** (`RestaurantFinderView`): Handles UI rendering and layout
   - **Controller** (`RestaurantFinderController`): Coordinates between model and view, handles user interactions

2. **Widget Level**
   - Each custom widget (RadioButton, Slider, RangeSlider, CheckBox) follows MVC pattern
   - Model: Manages widget state
   - View: Handles visual rendering
   - Controller: Processes user interactions

## Features

### 1. Interactive Map Display
- Displays all restaurants as clickable markers on a map
- Shows restaurant type and rating on hover
- Displays full restaurant details on click
- Automatically updates when filters change

### 2. Filtering System

#### Cost Range Filter
- **Widget**: RangeSlider (custom)
- **Functionality**: Select minimum and maximum cost range
- **Implementation**: Dual-thumb slider allowing users to set both min and max values simultaneously

#### Rating Range Filter
- **Widget**: RangeSlider (custom)
- **Functionality**: Select minimum and maximum rating
- **Implementation**: Dual-thumb slider for rating selection (0.0 to 5.0)

#### Restaurant Type Filter
- **Widget**: RadioButton (custom) with RadioButtonGroup
- **Functionality**: Select a single restaurant type or "All Types"
- **Implementation**: Exclusive selection - only one type can be selected at a time

#### Features Filter
- **Widget**: CheckBox (custom)
- **Functionality**: Select multiple features (free parking, pets allowed, vegetarian options, gluten free options)
- **Implementation**: Multiple checkboxes with AND logic - restaurants must have ALL selected features

### 3. Restaurant Details Panel
- Displays comprehensive information when a restaurant is clicked
- Shows: name, type, cost, rating, parking availability, pets allowed status
- Updates dynamically based on selection
- Clears when selected restaurant is filtered out

### 4. Result Count Display
- Shows the number of restaurants matching current filters
- Updates in real-time as filters change

## Custom Widgets

### 1. RadioButton Widget
- **Location**: `widgets/radiobutton/`
- **Components**:
  - `RadioButtonModel`: Manages selected state and interaction state
  - `RadioButtonView`: Renders circular radio button with filled center when selected
  - `RadioButtonController`: Handles mouse events and selection
  - `RadioButtonGroup`: Manages exclusivity - ensures only one button in group is selected

**Features**:
- Visual feedback on hover
- Circular design with filled center when selected
- Group management for exclusive selection

### 2. Slider Widget
- **Location**: `widgets/slider/`
- **Components**:
  - `SliderModel`: Manages value, min/max bounds, and state
  - `SliderView`: Renders horizontal track with draggable thumb
  - `SliderController`: Handles mouse drag interactions

**Features**:
- Single value selection
- Visual feedback during dragging
- Value clamping to valid range

### 3. RangeSlider Widget
- **Location**: `widgets/slider/`
- **Components**:
  - `RangeSliderModel`: Manages min/max values, bounds, and dragging state
  - `RangeSliderView`: Renders track with two thumbs and active range highlight
  - `RangeSliderController`: Handles dragging of both thumbs

**Features**:
- Dual-thumb control for range selection
- Active range highlighting between thumbs
- Automatic constraint (minValue <= maxValue)
- Visual feedback for which thumb is being dragged

### 4. CheckBox Widget
- **Location**: `widgets/checkbox/` (provided)
- **Used for**: Feature filtering

## Design Principles

### CRAP Design Principles

The application follows CRAP (Contrast, Repetition, Alignment, Proximity) design principles:

1. **Contrast**
   - Clear visual hierarchy with different font sizes and weights
   - Color coding for different UI elements
   - Distinct styling for selected vs. unselected states

2. **Repetition**
   - Consistent color scheme throughout
   - Uniform spacing and padding
   - Repeated layout patterns for filter sections

3. **Alignment**
   - All elements aligned to consistent margins
   - Filter panel aligned with map
   - Details panel aligned with map top

4. **Proximity**
   - Related elements grouped together
   - Filters grouped in filter panel
   - Map and details panel positioned adjacent for context

## Data Structure

### Restaurant Interface
```typescript
interface Restaurant {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    avg_price: number;
    type: string;
    ratings: number;
    features: string[];
    description: string;
}
```

### Filter State
```typescript
interface FilterState {
    minCost: number;
    maxCost: number;
    minRating: number;
    maxRating: number;
    selectedType: string | null;
    selectedFeatures: string[];
}
```

## Implementation Details

### Filter Logic
- All filters use AND logic - restaurants must match ALL active filters
- Features filter uses AND logic within itself - restaurant must have ALL selected features
- Filter ranges are inclusive on both ends
- Filters are applied sequentially for efficiency

### Event Handling
- Map widget events: `point-hover` and `point-click`
- Widget action events: Triggered when widgets change value
- Global event listener pattern for map interactions
- Direct event listeners for widget interactions

### Initialization Flow
1. Create MVC components
2. Load restaurant data into model
3. Initialize filter ranges from data
4. Initialize controller (sets up widgets, filters, displays)
5. Set SimpleKit root container
6. Start SimpleKit application

## File Structure

```
RestaurantFinder/
├── model.ts          # RestaurantFinderModel - data and business logic
├── view.ts           # RestaurantFinderView - UI rendering
├── controller.ts     # RestaurantFinderController - coordination
└── index.ts          # Exports

widgets/
├── checkbox/         # CheckBox widget (provided)
├── radiobutton/      # RadioButton widget (custom)
├── slider/           # Slider and RangeSlider widgets (custom)
└── MapWidget/        # Map widget (provided)

main.ts               # Application entry point
```

## Testing and Verification

### Verified Functionality
- All widgets render correctly
- Filter interactions update model and view
- Map displays restaurants correctly
- Restaurant details display on click
- Filters apply correctly with AND logic
- Result count updates dynamically
- Selected restaurant clears when filtered out
- Slider bounds initialize from actual data ranges

## Future Enhancements

Potential improvements for future versions:
1. Distance filter (bonus feature) - filter restaurants by distance from a point
2. Search functionality - search restaurants by name
3. Sorting options - sort results by rating, cost, or distance
4. Save/load filter presets
5. Export filtered results

## Conclusion

The RestaurantFinder application successfully implements an interactive restaurant exploration tool with comprehensive filtering capabilities. The use of custom widgets following MVC pattern demonstrates good software engineering practices, and the application provides an intuitive user experience for exploring restaurant data.


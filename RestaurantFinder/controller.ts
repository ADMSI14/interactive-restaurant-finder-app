import { setSKEventListener, SKEvent } from "../simplekit/src/imperative-mode";
import { RestaurantFinderModel } from "./model";
import { RestaurantFinderView } from "./view";
import { MapWidget, MapPoint } from "../widgets/MapWidget";
import { Restaurant } from "./model";

export class RestaurantFinderController {
    private _model: RestaurantFinderModel;
    private _view: RestaurantFinderView;

    constructor(model: RestaurantFinderModel, view: RestaurantFinderView) {
        this._model = model;
        this._view = view;
        this._view.setController(this);  // Set controller reference in view for widget event handling
        this.setupEventListeners();
    }

    // Set up event listeners for map interactions and widget actions
    private setupEventListeners(): void {
        // Listen for events from widgets and map
        setSKEventListener((e: SKEvent) => {
            // Check if event is a map widget event
            if (e.type === "point-hover" || e.type === "point-click") {
                console.log(`Received map event: ${e.type}`, e);
                const eventData = (e as any).data;
                // Verify it's a MapPoint with restaurant data
                if (eventData && eventData.data && eventData.latitude && eventData.longitude) {
                    if (e.type === "point-hover") {
                        this.handleMapHover(e);
                    } else if (e.type === "point-click") {
                        this.handleMapClick(e);
                    }
                } else {
                    console.log("Map event data validation failed:", eventData);
                }
            }
            // Check if event is a map area click (empty area, not a restaurant marker)
            else if (e.type === "map-click") {
                console.log(`Received map-click event:`, e);
                const eventData = (e as any).data;
                // Verify it has latitude and longitude
                if (eventData && typeof eventData.latitude === 'number' && typeof eventData.longitude === 'number') {
                    this.handleMapAreaClick(eventData.latitude, eventData.longitude);
                } else {
                    console.log("Map-click event data validation failed:", eventData);
                }
            }
            // Check if event is an action event from widgets
            else if (e.type === "action") {
                console.log("Received action event:", e);
                this.handleWidgetAction(e);
            } else {
                console.log("Received other event type:", e.type, e);
            }
        });
    }

    // Handle action events from widgets
    private handleWidgetAction(e: SKEvent): void {
        const source = e.source;
        if (!source) {
            console.log("handleWidgetAction: No event source");
            return;
        }
        
        console.log("handleWidgetAction: Received action event, source:", source);
        
        // Check if event is from cost range slider
        const costSlider = this._view.costRangeSlider;
        if (costSlider && (costSlider as any)._controller === source) {
            console.log("handleWidgetAction: Event from cost range slider");
            this.handleCostRangeChange(
                costSlider.minValue,
                costSlider.maxValue
            );
            return;
        }
        
        // Check if event is from rating range slider
        const ratingSlider = this._view.ratingRangeSlider;
        if (ratingSlider && (ratingSlider as any)._controller === source) {
            console.log("handleWidgetAction: Event from rating range slider");
            this.handleRatingRangeChange(
                ratingSlider.minValue,
                ratingSlider.maxValue
            );
            return;
        }
        
        // Check if event is from a radio button (type filter)
        const typeGroup = this._view.typeRadioGroup;
        if (typeGroup) {
            console.log("handleWidgetAction: Checking radio buttons, group has", typeGroup.radioButtons.length, "buttons");
            // Check all radio buttons in the group to find which one sent the event
            // The event source is the RadioButtonController, so we need to find the radio button that owns it
            for (let i = 0; i < typeGroup.radioButtons.length; i++) {
                const radio = typeGroup.radioButtons[i];
                // Access the private _controller property
                const radioController = (radio as any)._controller;
                console.log(`handleWidgetAction: Checking radio button ${i}, controller:`, radioController, "source:", source, "match:", radioController === source);
                if (radioController === source) {
                    console.log(`handleWidgetAction: Match found! Radio button ${i} was clicked`);
                    // Use RadioButtonGroup to handle selection (ensures exclusivity)
                    typeGroup.selectRadioButton(radio);
                    // First radio button (index 0) is "All Types"
                    if (i === 0) {
                        console.log("handleWidgetAction: All Types selected");
                        this.handleTypeChange(null);
                    } else {
                        // Find the type name for this radio button
                        let typeName: string | null = null;
                        this._view.typeRadioButtons.forEach((r, name) => {
                            if (r === radio) {
                                typeName = name;
                            }
                        });
                        if (typeName) {
                            console.log("handleWidgetAction: Type selected:", typeName);
                            this.handleTypeChange(typeName);
                        } else {
                            console.log("handleWidgetAction: Warning - could not find type name for radio button");
                        }
                    }
                    return;
                }
            }
            console.log("handleWidgetAction: No matching radio button found");
        } else {
            console.log("handleWidgetAction: No type group available");
        }
        
        // Check if event is from a checkbox (feature filter)
        this._view.featureCheckboxes.forEach((checkbox, feature) => {
            if ((checkbox as any)._controller === source) {
                this.handleFeatureToggle(feature, checkbox.checked);
                return;
            }
        });
        
        // Check if event is from distance filter checkbox
        const distanceFilterCheckbox = this._view.distanceFilterCheckbox;
        if (distanceFilterCheckbox && (distanceFilterCheckbox as any)._controller === source) {
            console.log("handleWidgetAction: Event from distance filter checkbox");
            this.handleDistanceFilterToggle(distanceFilterCheckbox.checked);
            return;
        }
        
        // Check if event is from max distance slider
        const maxDistanceSlider = this._view.maxDistanceSlider;
        if (maxDistanceSlider && (maxDistanceSlider as any)._controller === source) {
            console.log("handleWidgetAction: Event from max distance slider");
            this.handleMaxDistanceChange(maxDistanceSlider.value);
            return;
        }
    }

    // Handle hover event on map marker
    private handleMapHover(e: SKEvent): void {
        const mapPoint = (e as any).data as MapPoint;
        console.log("handleMapHover called", mapPoint);
        if (mapPoint && mapPoint.data) {
            const restaurant = mapPoint.data as Restaurant;
            // Update dataDisplay to show "Type – Rating"
            // The mapPoint should be the same reference as the one in the model
            const displayText = `${restaurant.type} – ${restaurant.ratings.toFixed(1)}`;
            mapPoint.dataDisplay = displayText;
            console.log(`Hover: Set dataDisplay to "${displayText}" for restaurant ${restaurant.name}, dataDisplay is now: "${mapPoint.dataDisplay}"`);
            
            // Verify the MapPoint is in the model
            const mapWidget = this._view.mapWidget;
            if (mapWidget) {
                const foundInModel = mapWidget.points.find(p => p === mapPoint);
                console.log(`MapPoint found in model: ${foundInModel !== undefined}`);
            }
        } else {
            console.log("Hover: mapPoint or mapPoint.data is missing", mapPoint);
        }
    }

    // Handle click event on map marker
    private handleMapClick(e: SKEvent): void {
        console.log("handleMapClick called", e);
        const mapPoint = (e as any).data as MapPoint;
        console.log("mapPoint:", mapPoint);
        if (mapPoint && mapPoint.data) {
            const restaurant = mapPoint.data as Restaurant;
            console.log("Restaurant extracted:", restaurant ? restaurant.name : "null");
            // Set selected restaurant in model
            this._model.selectedRestaurant = restaurant;
            // Update view to show restaurant details
            this._view.updateRestaurantDetails(restaurant);
            console.log("View updated with restaurant details");
        } else {
            console.log("handleMapClick: mapPoint or mapPoint.data is missing", mapPoint);
        }
    }

    // Handle click event on empty map area (for distance filter point selection)
    private handleMapAreaClick(latitude: number, longitude: number): void {
        console.log("handleMapAreaClick called", latitude, longitude);
        
        // Check if distance filter is enabled
        const filterState = this._model.filterState;
        if (!filterState.distanceFilterEnabled) {
            console.log("Distance filter is not enabled, ignoring map area click");
            return;
        }

        // Determine which point to set
        if (filterState.point1 === null) {
            // Set point 1
            console.log("Setting point 1");
            this._model.setDistancePoint1(latitude, longitude);
        } else if (filterState.point2 === null) {
            // Set point 2
            console.log("Setting point 2");
            this._model.setDistancePoint2(latitude, longitude);
        } else {
            // Both points are set, cycle: replace point 1 with new click
            console.log("Both points set, replacing point 1");
            this._model.setDistancePoint1(latitude, longitude);
        }

        // Update view to show selection points
        const updatedFilterState = this._model.filterState;
        this._view.updateSelectionPoints(
            updatedFilterState.point1,
            updatedFilterState.point2
        );

        // Update map widget with selection points
        const mapWidget = this._view.mapWidget;
        if (mapWidget) {
            mapWidget.selectionPoint1 = updatedFilterState.point1;
            mapWidget.selectionPoint2 = updatedFilterState.point2;
            mapWidget.maxDistance = updatedFilterState.maxDistance;
        }

        console.log("Map area click handled, points updated");
    }

    // Called when map widget is created (from view)
    public onMapWidgetCreated(mapWidget: MapWidget): void {
        console.log("onMapWidgetCreated called, setting up click handler");
        // Set up map click handler using callback
        mapWidget.onPointClick = (mapPoint: MapPoint) => {
            console.log("MapWidget onPointClick callback called", mapPoint);
            if (mapPoint && mapPoint.data) {
                const restaurant = mapPoint.data as Restaurant;
                console.log("Restaurant from callback:", restaurant ? restaurant.name : "null");
                this._model.selectedRestaurant = restaurant;
                this._view.updateRestaurantDetails(restaurant);
            }
        };
        
        // Set up map area click handler for distance filter point selection
        mapWidget.onMapClick = (latitude: number, longitude: number) => {
            console.log("MapWidget onMapClick callback called", latitude, longitude);
            this.handleMapAreaClick(latitude, longitude);
        };
        
        console.log("Click handlers set on map widget");
    }

    // Initialize the view with initial data
    public initialize(): void {
        // Initialize type radio buttons based on available types
        const availableTypes = this._model.getAvailableTypes();
        this._view.initializeTypeRadioButtons(availableTypes);
        
        // Set up radio button selection callback (similar to map widget callback)
        const typeGroup = this._view.typeRadioGroup;
        if (typeGroup) {
            console.log("Setting up radio button selection callback");
            typeGroup.onSelectionChange = (radioButton: any, index: number) => {
                console.log(`RadioButtonGroup: Selection changed, index: ${index}`);
                // Index 0 is "All Types"
                if (index === 0) {
                    console.log("RadioButtonGroup: All Types selected");
                    this.handleTypeChange(null);
                } else {
                    // Find the type name for this radio button
                    let typeName: string | null = null;
                    this._view.typeRadioButtons.forEach((r, name) => {
                        if (r === radioButton) {
                            typeName = name;
                        }
                    });
                    if (typeName) {
                        console.log("RadioButtonGroup: Type selected:", typeName);
                        this.handleTypeChange(typeName);
                    } else {
                        console.log("RadioButtonGroup: Warning - could not find type name for radio button");
                    }
                }
            };
            console.log("Radio button selection callback set");
        }
        
        // Set up checkbox onChange callbacks for feature filters
        console.log("Setting up checkbox onChange callbacks");
        this._view.featureCheckboxes.forEach((checkbox, feature) => {
            checkbox.onChange = (checked: boolean) => {
                console.log(`Checkbox onChange callback: ${feature} = ${checked}`);
                this.handleFeatureToggle(feature, checked);
            };
        });
        console.log(`Checkbox onChange callbacks set for ${this._view.featureCheckboxes.size} checkboxes`);
        
        // Set up range slider onChange callbacks for cost and rating filters
        console.log("Setting up range slider onChange callbacks");
        const costSlider = this._view.costRangeSlider;
        if (costSlider) {
            costSlider.onChange = (minValue: number, maxValue: number) => {
                console.log(`Cost range slider onChange callback: ${minValue} - ${maxValue}`);
                this.handleCostRangeChange(minValue, maxValue);
            };
            console.log("Cost range slider onChange callback set");
        }
        
        const ratingSlider = this._view.ratingRangeSlider;
        if (ratingSlider) {
            ratingSlider.onChange = (minValue: number, maxValue: number) => {
                console.log(`Rating range slider onChange callback: ${minValue} - ${maxValue}`);
                this.handleRatingRangeChange(minValue, maxValue);
            };
            console.log("Rating range slider onChange callback set");
        }
        
        // Set up distance filter checkbox onChange callback
        const distanceFilterCheckbox = this._view.distanceFilterCheckbox;
        if (distanceFilterCheckbox) {
            distanceFilterCheckbox.onChange = (checked: boolean) => {
                console.log(`Distance filter checkbox onChange callback: ${checked}`);
                this.handleDistanceFilterToggle(checked);
            };
            console.log("Distance filter checkbox onChange callback set");
        }
        
        // Set up max distance slider onChange callback
        const maxDistanceSlider = this._view.maxDistanceSlider;
        if (maxDistanceSlider) {
            maxDistanceSlider.onChange = (value: number) => {
                console.log(`Max distance slider onChange callback: ${value}`);
                this.handleMaxDistanceChange(value);
            };
            console.log("Max distance slider onChange callback set");
        }
        
        // Initialize slider bounds with actual data ranges
        const dataRanges = this._model.getDataRanges();
        this._view.updateCostRangeBounds(dataRanges.minCost, dataRanges.maxCost);
        this._view.updateRatingRangeBounds(dataRanges.minRating, dataRanges.maxRating);
        
        // Update map with filtered restaurants
        this._view.updateMap(this._model.filteredRestaurants);
        
        // Set up map click handler after map is created/updated
        const mapWidget = this._view.mapWidget;
        if (mapWidget) {
            console.log("Setting up click handler on map widget in initialize()");
            mapWidget.onPointClick = (mapPoint: MapPoint) => {
                console.log("MapWidget onPointClick callback called", mapPoint);
                if (mapPoint && mapPoint.data) {
                    const restaurant = mapPoint.data as Restaurant;
                    console.log("Restaurant from callback:", restaurant ? restaurant.name : "null");
                    this._model.selectedRestaurant = restaurant;
                    this._view.updateRestaurantDetails(restaurant);
                }
            };
            
            // Set up map area click handler for distance filter point selection
            mapWidget.onMapClick = (latitude: number, longitude: number) => {
                console.log("MapWidget onMapClick callback called", latitude, longitude);
                this.handleMapAreaClick(latitude, longitude);
            };
            
            console.log("Click handlers set on map widget");
        } else {
            console.log("Map widget not available in initialize()");
        }
        
        // Initialize details panel (no restaurant selected)
        this._view.updateRestaurantDetails(null);
        // Initialize filter displays from model
        const filterState = this._model.filterState;
        this._view.updateCostRange(filterState.minCost, filterState.maxCost);
        this._view.updateRatingRange(filterState.minRating, filterState.maxRating);
        this._view.updateRestaurantType(filterState.selectedType);
        this._view.updateFeatures(filterState.selectedFeatures);
        
        // Initialize distance filter display
        this._view.updateDistanceFilterState(
            filterState.distanceFilterEnabled,
            filterState.point1,
            filterState.point2,
            filterState.maxDistance
        );
        
        // Initialize map widget with distance filter state
        if (mapWidget) {
            mapWidget.selectionPoint1 = filterState.point1;
            mapWidget.selectionPoint2 = filterState.point2;
            mapWidget.maxDistance = filterState.maxDistance;
        }
        
        // Initialize result count
        this._view.updateResultCount(this._model.filteredRestaurants.length);
    }

    // Update view when filters change
    // This method ensures the map and UI stay synchronized with filtered results
    public updateView(): void {
        // Update map with filtered restaurants
        this._view.updateMap(this._model.filteredRestaurants);
        
        // Update map widget with distance filter selection state
        // Only show selection points if distance filter is enabled
        const mapWidget = this._view.mapWidget;
        if (mapWidget) {
            const filterState = this._model.filterState;
            if (filterState.distanceFilterEnabled) {
                mapWidget.selectionPoint1 = filterState.point1;
                mapWidget.selectionPoint2 = filterState.point2;
            } else {
                // Hide selection points when filter is disabled
                mapWidget.selectionPoint1 = null;
                mapWidget.selectionPoint2 = null;
            }
            mapWidget.maxDistance = filterState.maxDistance;
        }
        
        // Update result count for clarity
        this._view.updateResultCount(this._model.filteredRestaurants.length);
        
        // Check if currently selected restaurant is still in filtered list
        const selectedRestaurant = this._model.selectedRestaurant;
        if (selectedRestaurant) {
            const isStillVisible = this._model.filteredRestaurants.some(
                r => r.id === selectedRestaurant.id
            );
            
            // If selected restaurant is no longer in filtered list, clear selection
            if (!isStillVisible) {
                this._model.selectedRestaurant = null;
                this._view.updateRestaurantDetails(null);
            }
        }
    }

    // Filter change handlers - connect filter inputs to model methods
    // These will be called by interactive widgets when they replace placeholders

    // Handle cost range filter changes
    public handleCostRangeChange(minCost: number, maxCost: number): void {
        this._model.setMinCost(minCost);
        this._model.setMaxCost(maxCost);
        // Update view displays
        const filterState = this._model.filterState;
        this._view.updateCostRange(filterState.minCost, filterState.maxCost);
        // Update map with filtered results
        this.updateView();
    }

    // Handle rating range filter changes
    public handleRatingRangeChange(minRating: number, maxRating: number): void {
        this._model.setMinRating(minRating);
        this._model.setMaxRating(maxRating);
        // Update view displays
        const filterState = this._model.filterState;
        this._view.updateRatingRange(filterState.minRating, filterState.maxRating);
        // Update map with filtered results
        this.updateView();
    }

    // Handle restaurant type filter change
    public handleTypeChange(selectedType: string | null): void {
        this._model.setSelectedType(selectedType);
        // Update view display
        this._view.updateRestaurantType(selectedType);
        // Update map with filtered results
        this.updateView();
    }

    // Handle feature filter change (toggle a feature)
    public handleFeatureToggle(feature: string, isSelected: boolean): void {
        const filterState = this._model.filterState;
        let selectedFeatures = [...filterState.selectedFeatures];
        
        if (isSelected) {
            // Add feature if not already present
            if (!selectedFeatures.includes(feature)) {
                selectedFeatures.push(feature);
            }
        } else {
            // Remove feature
            selectedFeatures = selectedFeatures.filter(f => f !== feature);
        }
        
        this._model.setSelectedFeatures(selectedFeatures);
        // Update view display
        this._view.updateFeatures(selectedFeatures);
        // Update map with filtered results
        this.updateView();
    }

    // Handle multiple features change at once
    public handleFeaturesChange(selectedFeatures: string[]): void {
        this._model.setSelectedFeatures(selectedFeatures);
        // Update view display
        this._view.updateFeatures(selectedFeatures);
        // Update map with filtered results
        this.updateView();
    }

    // Handle distance filter toggle (enable/disable)
    public handleDistanceFilterToggle(enabled: boolean): void {
        console.log("handleDistanceFilterToggle called, enabled:", enabled);
        
        // Edge case: If enabling but no points are set, allow it but filter won't apply until points are set
        // The filter logic already handles this by checking if both points exist
        // When disabling, hide the selection points on the map
        
        this._model.setDistanceFilterEnabled(enabled);
        
        // Update view display
        const filterState = this._model.filterState;
        this._view.updateDistanceFilterEnabled(enabled);
        
        // Update map widget with selection points and max distance
        const mapWidget = this._view.mapWidget;
        if (mapWidget) {
            // Only show selection points if filter is enabled
            if (enabled) {
                mapWidget.selectionPoint1 = filterState.point1;
                mapWidget.selectionPoint2 = filterState.point2;
            } else {
                // Hide selection points when filter is disabled
                mapWidget.selectionPoint1 = null;
                mapWidget.selectionPoint2 = null;
            }
            mapWidget.maxDistance = filterState.maxDistance;
        }
        
        // Update view selection points display
        // Keep showing the points in labels (so users know they're saved) but they won't appear on map when disabled
        this._view.updateSelectionPoints(
            filterState.point1,
            filterState.point2
        );
        
        // Update map with filtered results (this will trigger a redraw)
        this.updateView();
    }

    // Handle max distance change
    public handleMaxDistanceChange(km: number): void {
        console.log("handleMaxDistanceChange called, km:", km);
        this._model.setMaxDistance(km);
        
        // Update view display
        const filterState = this._model.filterState;
        this._view.updateMaxDistance(filterState.maxDistance);
        
        // Update map widget with new max distance
        const mapWidget = this._view.mapWidget;
        if (mapWidget) {
            mapWidget.maxDistance = filterState.maxDistance;
        }
        
        // Update map with filtered results
        this.updateView();
    }

    // Handle clear distance points
    public handleClearDistancePoints(): void {
        console.log("handleClearDistancePoints called");
        this._model.clearDistancePoints();
        
        // Update view display
        const filterState = this._model.filterState;
        this._view.updateSelectionPoints(
            filterState.point1,
            filterState.point2
        );
        
        // Update map widget to clear selection points
        const mapWidget = this._view.mapWidget;
        if (mapWidget) {
            mapWidget.selectionPoint1 = null;
            mapWidget.selectionPoint2 = null;
        }
        
        // Update map with filtered results
        this.updateView();
    }
}

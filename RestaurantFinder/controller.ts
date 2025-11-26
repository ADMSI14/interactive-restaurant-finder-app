import { setSKEventListener, SKEvent } from "../simplekit/src/imperative-mode";
import { RestaurantFinderModel } from "./model";
import { RestaurantFinderView } from "./view";
import { MapPoint } from "../widgets/MapWidget";
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
                const eventData = (e as any).data;
                // Verify it's a MapPoint with restaurant data
                if (eventData && eventData.data && eventData.latitude && eventData.longitude) {
                    if (e.type === "point-hover") {
                        this.handleMapHover(e);
                    } else if (e.type === "point-click") {
                        this.handleMapClick(e);
                    }
                }
            }
            // Check if event is an action event from widgets
            else if (e.type === "action") {
                this.handleWidgetAction(e);
            }
        });
    }

    // Handle action events from widgets
    private handleWidgetAction(e: SKEvent): void {
        const source = e.source;
        if (!source) return;
        
        // Check if event is from cost range slider
        const costSlider = this._view.costRangeSlider;
        if (costSlider && (costSlider as any)._controller === source) {
            this.handleCostRangeChange(
                costSlider.minValue,
                costSlider.maxValue
            );
            return;
        }
        
        // Check if event is from rating range slider
        const ratingSlider = this._view.ratingRangeSlider;
        if (ratingSlider && (ratingSlider as any)._controller === source) {
            this.handleRatingRangeChange(
                ratingSlider.minValue,
                ratingSlider.maxValue
            );
            return;
        }
        
        // Check if event is from a radio button (type filter)
        const typeGroup = this._view.typeRadioGroup;
        if (typeGroup) {
            // Check "All Types" radio button (first in group)
            if (typeGroup.radioButtons.length > 0) {
                const allTypesRadio = typeGroup.radioButtons[0];
                if ((allTypesRadio as any)._controller === source) {
                    this.handleTypeChange(null);
                    return;
                }
            }
            // Check other type radio buttons
            this._view.typeRadioButtons.forEach((radio, typeName) => {
                if ((radio as any)._controller === source) {
                    this.handleTypeChange(typeName);
                    return;
                }
            });
        }
        
        // Check if event is from a checkbox (feature filter)
        this._view.featureCheckboxes.forEach((checkbox, feature) => {
            if ((checkbox as any)._controller === source) {
                this.handleFeatureToggle(feature, checkbox.checked);
                return;
            }
        });
    }

    // Handle hover event on map marker
    private handleMapHover(e: SKEvent): void {
        const mapPoint = (e as any).data as MapPoint;
        if (mapPoint && mapPoint.data) {
            const restaurant = mapPoint.data as Restaurant;
            // Update dataDisplay to show "Type – Rating"
            mapPoint.dataDisplay = `${restaurant.type} – ${restaurant.ratings.toFixed(1)}`;
        }
    }

    // Handle click event on map marker
    private handleMapClick(e: SKEvent): void {
        const mapPoint = (e as any).data as MapPoint;
        if (mapPoint && mapPoint.data) {
            const restaurant = mapPoint.data as Restaurant;
            // Set selected restaurant in model
            this._model.selectedRestaurant = restaurant;
            // Update view to show restaurant details
            this._view.updateRestaurantDetails(restaurant);
        }
    }

    // Initialize the view with initial data
    public initialize(): void {
        // Initialize type radio buttons based on available types
        const availableTypes = this._model.getAvailableTypes();
        this._view.initializeTypeRadioButtons(availableTypes);
        
        // Initialize slider bounds with actual data ranges
        const dataRanges = this._model.getDataRanges();
        this._view.updateCostRangeBounds(dataRanges.minCost, dataRanges.maxCost);
        this._view.updateRatingRangeBounds(dataRanges.minRating, dataRanges.maxRating);
        
        // Update map with filtered restaurants
        this._view.updateMap(this._model.filteredRestaurants);
        // Initialize details panel (no restaurant selected)
        this._view.updateRestaurantDetails(null);
        // Initialize filter displays from model
        const filterState = this._model.filterState;
        this._view.updateCostRange(filterState.minCost, filterState.maxCost);
        this._view.updateRatingRange(filterState.minRating, filterState.maxRating);
        this._view.updateRestaurantType(filterState.selectedType);
        this._view.updateFeatures(filterState.selectedFeatures);
        // Initialize result count
        this._view.updateResultCount(this._model.filteredRestaurants.length);
    }

    // Update view when filters change
    // This method ensures the map and UI stay synchronized with filtered results
    public updateView(): void {
        // Update map with filtered restaurants
        this._view.updateMap(this._model.filteredRestaurants);
        
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
}

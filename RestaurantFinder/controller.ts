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
        this.setupEventListeners();
    }

    // Set up event listeners for map interactions
    private setupEventListeners(): void {
        // Listen for events from the map widget
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
    }

    // Update view when filters change
    public updateView(): void {
        this._view.updateMap(this._model.filteredRestaurants);
    }
}

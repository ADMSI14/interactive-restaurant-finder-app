// Restaurant interface matching JSON structure
export interface Restaurant {
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

// Filter state interface
export interface FilterState {
    minCost: number;
    maxCost: number;
    minRating: number;
    maxRating: number;
    selectedType: string | null;
    selectedFeatures: string[];
}

export class RestaurantFinderModel {
    private _allRestaurants: Restaurant[] = [];
    private _filteredRestaurants: Restaurant[] = [];
    private _selectedRestaurant: Restaurant | null = null;
    
    // Filter state
    private _filterState: FilterState = {
        minCost: 0,
        maxCost: 1000,
        minRating: 0,
        maxRating: 5,
        selectedType: null,
        selectedFeatures: []
    };

    constructor() {
        // Initialize with empty arrays
    }

    // Load restaurants from JSON data
    public loadRestaurants(restaurants: Restaurant[]): void {
        this._allRestaurants = restaurants;
        this.initializeFilterRanges();
        this.applyFilters();
    }

    // Get all restaurants
    public get allRestaurants(): Restaurant[] {
        return this._allRestaurants;
    }

    // Get filtered restaurants
    public get filteredRestaurants(): Restaurant[] {
        return this._filteredRestaurants;
    }

    // Set filtered restaurants
    public set filteredRestaurants(restaurants: Restaurant[]) {
        this._filteredRestaurants = restaurants;
    }

    // Get selected restaurant
    public get selectedRestaurant(): Restaurant | null {
        return this._selectedRestaurant;
    }

    // Set selected restaurant
    public set selectedRestaurant(restaurant: Restaurant | null) {
        this._selectedRestaurant = restaurant;
    }

    // Get filter state
    public get filterState(): FilterState {
        return { ...this._filterState };
    }

    // Set filter state properties
    public setMinCost(value: number): void {
        this._filterState.minCost = value;
        this.applyFilters();
    }

    public setMaxCost(value: number): void {
        this._filterState.maxCost = value;
        this.applyFilters();
    }

    public setMinRating(value: number): void {
        this._filterState.minRating = value;
        this.applyFilters();
    }

    public setMaxRating(value: number): void {
        this._filterState.maxRating = value;
        this.applyFilters();
    }

    public setSelectedType(type: string | null): void {
        this._filterState.selectedType = type;
        this.applyFilters();
    }

    public setSelectedFeatures(features: string[]): void {
        this._filterState.selectedFeatures = features;
        this.applyFilters();
    }

    // Apply all filters to restaurants
    public applyFilters(): void {
        let filtered = [...this._allRestaurants];

        // Filter by cost range
        filtered = filtered.filter(
            r => r.avg_price >= this._filterState.minCost && 
                 r.avg_price <= this._filterState.maxCost
        );

        // Filter by rating range
        filtered = filtered.filter(
            r => r.ratings >= this._filterState.minRating && 
                 r.ratings <= this._filterState.maxRating
        );

        // Filter by type
        if (this._filterState.selectedType !== null) {
            filtered = filtered.filter(
                r => r.type === this._filterState.selectedType
            );
        }

        // Filter by features (restaurant must have ALL selected features)
        if (this._filterState.selectedFeatures.length > 0) {
            filtered = filtered.filter(r => {
                return this._filterState.selectedFeatures.every(
                    feature => r.features.includes(feature)
                );
            });
        }

        this._filteredRestaurants = filtered;
    }

    // Initialize filter ranges based on restaurant data
    public initializeFilterRanges(): void {
        if (this._allRestaurants.length === 0) return;

        const prices = this._allRestaurants.map(r => r.avg_price);
        const ratings = this._allRestaurants.map(r => r.ratings);

        this._filterState.minCost = Math.min(...prices);
        this._filterState.maxCost = Math.max(...prices);
        this._filterState.minRating = Math.min(...ratings);
        this._filterState.maxRating = Math.max(...ratings);
    }
}
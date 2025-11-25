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

    // Set filter state properties with validation
    public setMinCost(value: number): void {
        // Ensure min doesn't exceed max
        if (value > this._filterState.maxCost) {
            this._filterState.minCost = this._filterState.maxCost;
        } else {
            this._filterState.minCost = Math.max(0, value);
        }
        this.applyFilters();
    }

    public setMaxCost(value: number): void {
        // Ensure max is not less than min
        if (value < this._filterState.minCost) {
            this._filterState.maxCost = this._filterState.minCost;
        } else {
            this._filterState.maxCost = value;
        }
        this.applyFilters();
    }

    public setMinRating(value: number): void {
        // Ensure min doesn't exceed max and is within valid range
        const clampedValue = Math.max(0, Math.min(5, value));
        if (clampedValue > this._filterState.maxRating) {
            this._filterState.minRating = this._filterState.maxRating;
        } else {
            this._filterState.minRating = clampedValue;
        }
        this.applyFilters();
    }

    public setMaxRating(value: number): void {
        // Ensure max is not less than min and is within valid range
        const clampedValue = Math.max(0, Math.min(5, value));
        if (clampedValue < this._filterState.minRating) {
            this._filterState.maxRating = this._filterState.minRating;
        } else {
            this._filterState.maxRating = clampedValue;
        }
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
    // This method applies all active filters in sequence to filter the restaurant list
    public applyFilters(): void {
        // Start with all restaurants
        let filtered = [...this._allRestaurants];

        // Filter by cost range (inclusive on both ends)
        filtered = filtered.filter(
            r => r.avg_price >= this._filterState.minCost && 
                 r.avg_price <= this._filterState.maxCost
        );

        // Filter by rating range (inclusive on both ends)
        filtered = filtered.filter(
            r => r.ratings >= this._filterState.minRating && 
                 r.ratings <= this._filterState.maxRating
        );

        // Filter by restaurant type (if a type is selected)
        if (this._filterState.selectedType !== null && this._filterState.selectedType.trim() !== "") {
            filtered = filtered.filter(
                r => r.type === this._filterState.selectedType
            );
        }

        // Filter by features (restaurant must have ALL selected features)
        // This uses AND logic - all selected features must be present
        if (this._filterState.selectedFeatures.length > 0) {
            filtered = filtered.filter(r => {
                return this._filterState.selectedFeatures.every(
                    feature => r.features.includes(feature)
                );
            });
        }

        // Update filtered restaurants list
        this._filteredRestaurants = filtered;
    }

    // Initialize filter ranges based on restaurant data
    public initializeFilterRanges(): void {
        if (this._allRestaurants.length === 0) {
            // Default values if no restaurants
            this._filterState.minCost = 0;
            this._filterState.maxCost = 1000;
            this._filterState.minRating = 0;
            this._filterState.maxRating = 5;
            return;
        }

        const prices = this._allRestaurants.map(r => r.avg_price);
        const ratings = this._allRestaurants.map(r => r.ratings);

        // Set initial ranges to match actual data ranges
        this._filterState.minCost = Math.min(...prices);
        this._filterState.maxCost = Math.max(...prices);
        this._filterState.minRating = Math.min(...ratings);
        this._filterState.maxRating = Math.max(...ratings);
    }

    // Get list of unique restaurant types from all restaurants
    public getAvailableTypes(): string[] {
        const types = new Set<string>();
        this._allRestaurants.forEach(r => types.add(r.type));
        return Array.from(types).sort();
    }

    // Get list of all available features from all restaurants
    public getAvailableFeatures(): string[] {
        const features = new Set<string>();
        this._allRestaurants.forEach(r => {
            r.features.forEach(f => features.add(f));
        });
        return Array.from(features).sort();
    }
}
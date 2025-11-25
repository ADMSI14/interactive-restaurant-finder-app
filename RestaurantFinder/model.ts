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

export class RestaurantFinderModel {
    private _allRestaurants: Restaurant[] = [];
    private _filteredRestaurants: Restaurant[] = [];
    private _selectedRestaurant: Restaurant | null = null;

    constructor() {
        // Initialize with empty arrays
    }

    // Load restaurants from JSON data
    public loadRestaurants(restaurants: Restaurant[]): void {
        this._allRestaurants = restaurants;
        this._filteredRestaurants = restaurants;
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
}
import { SKContainer } from "../simplekit/src/imperative-mode";
import { MapWidget, MapPoint } from "../widgets/MapWidget";
import { Restaurant } from "./model";

export class RestaurantFinderView {
    private _mapWidget: MapWidget | null = null;
    private _container: SKContainer;

    constructor() {
        // Create main container
        this._container = new SKContainer({
            x: 0,
            y: 0,
            width: 800,
            height: 600,
        });
    }

    // Get the main container
    public get container(): SKContainer {
        return this._container;
    }

    // Convert Restaurant to MapPoint
    private restaurantToMapPoint(restaurant: Restaurant): MapPoint {
        return {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            data: restaurant,
            dataDisplay: "" // Will be set on hover
        };
    }

    // Update map with filtered restaurants
    public updateMap(restaurants: Restaurant[]): void {
        // Convert restaurants to map points
        const mapPoints: MapPoint[] = restaurants.map(r => 
            this.restaurantToMapPoint(r)
        );

        // Create or update map widget
        if (this._mapWidget) {
            // Update existing map widget's points
            this._mapWidget.points = mapPoints;
        } else {
            // Create new map widget
            this._mapWidget = new MapWidget(mapPoints, {
                x: 50,
                y: 50,
                width: 500,
                height: 400,
                fill: "lightgreen",
                border: "black"
            });
            
            // Add map widget to container
            this._container.addChild(this._mapWidget);
        }
    }

    // Get map widget (for event handling)
    public get mapWidget(): MapWidget | null {
        return this._mapWidget;
    }
}
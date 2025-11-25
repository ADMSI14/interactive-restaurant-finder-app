import { SKContainer, SKLabel } from "../simplekit/src/imperative-mode";
import { MapWidget, MapPoint } from "../widgets/MapWidget";
import { Restaurant } from "./model";

export class RestaurantFinderView {
    private _mapWidget: MapWidget | null = null;
    private _container: SKContainer;
    private _detailsContainer: SKContainer | null = null;
    private _detailsLabels: SKLabel[] = [];
    private _filtersContainer: SKContainer | null = null;
    private _costMinLabel: SKLabel | null = null;
    private _costMaxLabel: SKLabel | null = null;

    constructor() {
        // Create main container
        this._container = new SKContainer({
            x: 0,
            y: 0,
            width: 800,
            height: 600,
        });
        this.createFiltersPanel();
    }

    // Create filters panel with placeholder widgets
    private createFiltersPanel(): void {
        // Create filters container positioned below the map
        this._filtersContainer = new SKContainer({
            x: 50,
            y: 470,
            width: 500,
            height: 120,
            fill: "#f0f0f0",
            border: "#cccccc"
        });
        this._container.addChild(this._filtersContainer);

        // Cost Range Filter Section
        const costTitle = new SKLabel({
            text: "Cost Range ($):",
            x: 10,
            y: 10,
            width: 120,
            height: 20
        });
        costTitle.font = "bold 12px Arial";
        costTitle.fill = "#000000";
        this._filtersContainer.addChild(costTitle);

        // Min Cost Label
        const minCostLabel = new SKLabel({
            text: "Min:",
            x: 10,
            y: 35,
            width: 40,
            height: 20
        });
        minCostLabel.font = "12px Arial";
        this._filtersContainer.addChild(minCostLabel);

        // Min Cost Value (placeholder - will be updated from model)
        this._costMinLabel = new SKLabel({
            text: "0",
            x: 55,
            y: 35,
            width: 60,
            height: 20
        });
        this._costMinLabel.font = "12px Arial";
        this._costMinLabel.fill = "#333333";
        this._filtersContainer.addChild(this._costMinLabel);

        // Max Cost Label
        const maxCostLabel = new SKLabel({
            text: "Max:",
            x: 130,
            y: 35,
            width: 40,
            height: 20
        });
        maxCostLabel.font = "12px Arial";
        this._filtersContainer.addChild(maxCostLabel);

        // Max Cost Value (placeholder - will be updated from model)
        this._costMaxLabel = new SKLabel({
            text: "1000",
            x: 175,
            y: 35,
            width: 60,
            height: 20
        });
        this._costMaxLabel.font = "12px Arial";
        this._costMaxLabel.fill = "#333333";
        this._filtersContainer.addChild(this._costMaxLabel);

        // Placeholder text indicating these will be replaced with sliders
        const placeholderNote = new SKLabel({
            text: "(Placeholder - will be replaced with sliders)",
            x: 10,
            y: 60,
            width: 300,
            height: 15
        });
        placeholderNote.font = "10px Arial";
        placeholderNote.fill = "#666666";
        this._filtersContainer.addChild(placeholderNote);
    }

    // Update cost range display from model
    public updateCostRange(minCost: number, maxCost: number): void {
        if (this._costMinLabel) {
            this._costMinLabel.text = minCost.toString();
        }
        if (this._costMaxLabel) {
            this._costMaxLabel.text = maxCost.toString();
        }
    }

    // Get the main container
    public get container(): SKContainer {
        return this._container;
    }

    // Convert Restaurant to MapPoint format for MapWidget
    // Maps restaurant data to the MapPoint interface required by MapWidget
    private restaurantToMapPoint(restaurant: Restaurant): MapPoint {
        // Validate that restaurant has valid coordinates
        if (typeof restaurant.latitude !== 'number' || typeof restaurant.longitude !== 'number') {
            throw new Error(`Invalid coordinates for restaurant ${restaurant.name}`);
        }
        
        return {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            data: restaurant, // Store full restaurant object for access in events
            dataDisplay: "" // Will be set on hover to show "Type – Rating"
        };
    }

    // Convert array of restaurants to MapPoint array
    private restaurantsToMapPoints(restaurants: Restaurant[]): MapPoint[] {
        return restaurants.map(r => this.restaurantToMapPoint(r));
    }

    // Update map with filtered restaurants
    public updateMap(restaurants: Restaurant[]): void {
        // Convert restaurants to map points
        const mapPoints: MapPoint[] = this.restaurantsToMapPoints(restaurants);

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

    // Update restaurant details display
    // Applies CRAP design principles: Contrast, Repetition, Alignment, Proximity
    public updateRestaurantDetails(restaurant: Restaurant | null): void {
        // Remove existing details labels
        if (this._detailsContainer) {
            this._detailsLabels.forEach(label => {
                this._detailsContainer!.removeChild(label);
            });
            this._detailsLabels = [];
        } else {
            // Create details container if it doesn't exist
            // Positioned to the right of the map with consistent spacing
            this._detailsContainer = new SKContainer({
                x: 570,
                y: 50,
                width: 220,
                height: 400,
                fill: "#f8f8f8", // Light gray background for contrast
                border: "#333333" // Dark border for definition
            });
            this._container.addChild(this._detailsContainer);
        }

        if (!restaurant) {
            // Show placeholder when no restaurant is selected
            const placeholder = new SKLabel({
                text: "Click on a restaurant marker to see details",
                x: 15,
                y: 20,
                width: 190,
                height: 40
            });
            placeholder.font = "12px Arial";
            placeholder.fill = "#666666"; // Muted color for placeholder
            this._detailsContainer.addChild(placeholder);
            this._detailsLabels.push(placeholder);
            return;
        }

        // Design constants following CRAP principles
        const leftMargin = 15;        // Consistent left alignment
        const topMargin = 15;          // Consistent top margin
        const labelWidth = 190;        // Consistent width for alignment
        const sectionSpacing = 15;     // Spacing between sections (Proximity)
        const itemSpacing = 8;         // Spacing between items (Proximity)
        const lineHeight = 20;         // Consistent line height (Repetition)
        
        let yOffset = topMargin;

        // Name - Primary heading with strong contrast
        const nameLabel = new SKLabel({
            text: restaurant.name,
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: 24
        });
        nameLabel.font = "bold 18px Arial";
        nameLabel.fill = "#000000"; // Strong contrast for heading
        this._detailsContainer.addChild(nameLabel);
        this._detailsLabels.push(nameLabel);
        yOffset += 28; // Extra space after heading (Proximity)

        // Basic Information Section - Grouped together (Proximity)
        // Type
        const typeLabel = new SKLabel({
            text: `Type: ${restaurant.type}`,
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight
        });
        typeLabel.font = "12px Arial";
        typeLabel.fill = "#333333";
        this._detailsContainer.addChild(typeLabel);
        this._detailsLabels.push(typeLabel);
        yOffset += lineHeight + itemSpacing;

        // Average Cost
        const costLabel = new SKLabel({
            text: `Avg. Cost: $${restaurant.avg_price}`,
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight
        });
        costLabel.font = "12px Arial";
        costLabel.fill = "#333333";
        this._detailsContainer.addChild(costLabel);
        this._detailsLabels.push(costLabel);
        yOffset += lineHeight + itemSpacing;

        // Rating
        const ratingLabel = new SKLabel({
            text: `Rating: ${restaurant.ratings.toFixed(1)}`,
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight
        });
        ratingLabel.font = "12px Arial";
        ratingLabel.fill = "#333333";
        this._detailsContainer.addChild(ratingLabel);
        this._detailsLabels.push(ratingLabel);
        yOffset += lineHeight + sectionSpacing;

        // Features section - Section heading with visual separation
        const featuresTitle = new SKLabel({
            text: "Features:",
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight
        });
        featuresTitle.font = "bold 13px Arial";
        featuresTitle.fill = "#000000"; // Bold for section heading (Contrast)
        this._detailsContainer.addChild(featuresTitle);
        this._detailsLabels.push(featuresTitle);
        yOffset += lineHeight + itemSpacing;

        // Check for specific features
        const hasParking = restaurant.features.includes("free parking");
        const hasPets = restaurant.features.includes("pets allowed");
        const hasVegetarian = restaurant.features.includes("vegetarian options");
        const hasGlutenFree = restaurant.features.includes("gluten free options");

        // Parking
        const parkingLabel = new SKLabel({
            text: `Parking: ${hasParking ? "Yes" : "No"}`,
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight
        });
        parkingLabel.font = "12px Arial";
        parkingLabel.fill = hasParking ? "#006600" : "#666666"; // Color coding (Contrast)
        this._detailsContainer.addChild(parkingLabel);
        this._detailsLabels.push(parkingLabel);
        yOffset += lineHeight + itemSpacing;

        // Pets Allowed
        const petsLabel = new SKLabel({
            text: `Pets Allowed: ${hasPets ? "Yes" : "No"}`,
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight
        });
        petsLabel.font = "12px Arial";
        petsLabel.fill = hasPets ? "#006600" : "#666666"; // Color coding (Contrast)
        this._detailsContainer.addChild(petsLabel);
        this._detailsLabels.push(petsLabel);
        yOffset += lineHeight + itemSpacing;

        // Additional features - Grouped with features (Proximity)
        if (hasVegetarian || hasGlutenFree) {
            const additionalFeatures: string[] = [];
            if (hasVegetarian) additionalFeatures.push("Vegetarian");
            if (hasGlutenFree) additionalFeatures.push("Gluten Free");
            
            const additionalLabel = new SKLabel({
                text: additionalFeatures.join(", "),
                x: leftMargin,
                y: yOffset,
                width: labelWidth,
                height: lineHeight
            });
            additionalLabel.font = "11px Arial";
            additionalLabel.fill = "#006600"; // Green for available features (Contrast)
            this._detailsContainer.addChild(additionalLabel);
            this._detailsLabels.push(additionalLabel);
            yOffset += lineHeight + itemSpacing;
        }

        // Address section - Visual separation before address
        yOffset += sectionSpacing - itemSpacing;
        const addressTitle = new SKLabel({
            text: "Address:",
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight
        });
        addressTitle.font = "bold 12px Arial";
        addressTitle.fill = "#000000";
        this._detailsContainer.addChild(addressTitle);
        this._detailsLabels.push(addressTitle);
        yOffset += lineHeight + itemSpacing;
        
        const addressLabel = new SKLabel({
            text: restaurant.address,
            x: leftMargin,
            y: yOffset,
            width: labelWidth,
            height: lineHeight * 2
        });
        addressLabel.font = "11px Arial";
        addressLabel.fill = "#333333";
        this._detailsContainer.addChild(addressLabel);
        this._detailsLabels.push(addressLabel);
        yOffset += lineHeight * 2 + sectionSpacing;

        // Description section - Visual separation
        if (restaurant.description) {
            const descTitle = new SKLabel({
                text: "Description:",
                x: leftMargin,
                y: yOffset,
                width: labelWidth,
                height: lineHeight
            });
            descTitle.font = "bold 12px Arial";
            descTitle.fill = "#000000";
            this._detailsContainer.addChild(descTitle);
            this._detailsLabels.push(descTitle);
            yOffset += lineHeight + itemSpacing;
            
            const descLabel = new SKLabel({
                text: restaurant.description,
                x: leftMargin,
                y: yOffset,
                width: labelWidth,
                height: lineHeight * 3
            });
            descLabel.font = "11px Arial";
            descLabel.fill = "#333333";
            this._detailsContainer.addChild(descLabel);
            this._detailsLabels.push(descLabel);
        }
    }
}
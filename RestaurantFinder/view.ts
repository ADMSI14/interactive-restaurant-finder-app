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
    private _ratingMinLabel: SKLabel | null = null;
    private _ratingMaxLabel: SKLabel | null = null;
    private _typeLabel: SKLabel | null = null;
    private _featuresLabels: Map<string, SKLabel> = new Map();

    // Layout constants following CRAP principles
    private readonly MARGIN = 20;           // Consistent margin around all elements
    private readonly SECTION_SPACING = 15;   // Spacing between major sections
    private readonly HEADER_HEIGHT = 40;     // Height for header/title area
    
    constructor() {
        // Create main container with consistent background
        this._container = new SKContainer({
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            fill: "#ffffff",  // White background for contrast
        });
        this.createHeader();
        this.createFiltersPanel();
    }

    // Create application header/title
    private createHeader(): void {
        const header = new SKLabel({
            text: "Restaurant Finder",
            x: this.MARGIN,
            y: this.MARGIN,
            width: 760,
            height: this.HEADER_HEIGHT
        });
        header.font = "bold 24px Arial";
        header.fill = "#000000";
        this._container.addChild(header);
    }

    // Create filters panel with placeholder widgets
    // Following CRAP principles: Proximity (grouped filters), Alignment, Repetition
    private createFiltersPanel(): void {
        // Calculate filter panel position (below map with consistent spacing)
        const mapY = this.MARGIN + this.HEADER_HEIGHT + this.SECTION_SPACING;
        const mapHeight = 400;
        const filterY = mapY + mapHeight + this.SECTION_SPACING;
        
        // Create filters container positioned below the map with consistent alignment
        this._filtersContainer = new SKContainer({
            x: this.MARGIN,  // Aligned with map (CRAP: Alignment)
            y: filterY,
            width: 500,
            height: 240,
            fill: "#f5f5f5",  // Slightly darker for subtle contrast
            border: "#9e9e9e"  // Medium gray border
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

        // Rating Range Filter Section
        const ratingTitle = new SKLabel({
            text: "Rating Range:",
            x: 10,
            y: 85,
            width: 120,
            height: 20
        });
        ratingTitle.font = "bold 12px Arial";
        ratingTitle.fill = "#000000";
        this._filtersContainer.addChild(ratingTitle);

        // Min Rating Label
        const minRatingLabel = new SKLabel({
            text: "Min:",
            x: 10,
            y: 110,
            width: 40,
            height: 20
        });
        minRatingLabel.font = "12px Arial";
        this._filtersContainer.addChild(minRatingLabel);

        // Min Rating Value (placeholder - will be updated from model)
        this._ratingMinLabel = new SKLabel({
            text: "0.0",
            x: 55,
            y: 110,
            width: 60,
            height: 20
        });
        this._ratingMinLabel.font = "12px Arial";
        this._ratingMinLabel.fill = "#333333";
        this._filtersContainer.addChild(this._ratingMinLabel);

        // Max Rating Label
        const maxRatingLabel = new SKLabel({
            text: "Max:",
            x: 130,
            y: 110,
            width: 40,
            height: 20
        });
        maxRatingLabel.font = "12px Arial";
        this._filtersContainer.addChild(maxRatingLabel);

        // Max Rating Value (placeholder - will be updated from model)
        this._ratingMaxLabel = new SKLabel({
            text: "5.0",
            x: 175,
            y: 110,
            width: 60,
            height: 20
        });
        this._ratingMaxLabel.font = "12px Arial";
        this._ratingMaxLabel.fill = "#333333";
        this._filtersContainer.addChild(this._ratingMaxLabel);

        // Restaurant Type Filter Section
        const typeTitle = new SKLabel({
            text: "Restaurant Type:",
            x: 10,
            y: 160,
            width: 120,
            height: 20
        });
        typeTitle.font = "bold 12px Arial";
        typeTitle.fill = "#000000";
        this._filtersContainer.addChild(typeTitle);

        // Type Selection Label (placeholder - will be replaced with radio buttons)
        this._typeLabel = new SKLabel({
            text: "All Types",
            x: 10,
            y: 185,
            width: 200,
            height: 20
        });
        this._typeLabel.font = "12px Arial";
        this._typeLabel.fill = "#333333";
        this._filtersContainer.addChild(this._typeLabel);

        // Features Filter Section
        const featuresTitle = new SKLabel({
            text: "Features:",
            x: 250,
            y: 10,
            width: 100,
            height: 20
        });
        featuresTitle.font = "bold 12px Arial";
        featuresTitle.fill = "#000000";
        this._filtersContainer.addChild(featuresTitle);

        // Feature checkboxes (placeholder - will be replaced with actual checkboxes)
        const features = [
            "free parking",
            "pets allowed",
            "vegetarian options",
            "gluten free options"
        ];

        let featureY = 35;
        features.forEach((feature) => {
            // Feature label with checkbox indicator
            const featureLabel = new SKLabel({
                text: `[ ] ${feature}`,
                x: 250,
                y: featureY,
                width: 200,
                height: 20
            });
            featureLabel.font = "12px Arial";
            featureLabel.fill = "#333333";
            this._filtersContainer.addChild(featureLabel);
            this._featuresLabels.set(feature, featureLabel);
            featureY += 25;
        });

        // Placeholder text indicating these will be replaced with widgets
        const placeholderNote = new SKLabel({
            text: "(Placeholder - will be replaced with interactive widgets)",
            x: 10,
            y: 135,
            width: 350,
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

    // Update rating range display from model
    public updateRatingRange(minRating: number, maxRating: number): void {
        if (this._ratingMinLabel) {
            this._ratingMinLabel.text = minRating.toFixed(1);
        }
        if (this._ratingMaxLabel) {
            this._ratingMaxLabel.text = maxRating.toFixed(1);
        }
    }

    // Update restaurant type display from model
    public updateRestaurantType(selectedType: string | null): void {
        if (this._typeLabel) {
            this._typeLabel.text = selectedType ? selectedType : "All Types";
        }
    }

    // Update features display from model
    public updateFeatures(selectedFeatures: string[]): void {
        // Update all feature labels to show checked/unchecked state
        this._featuresLabels.forEach((label, feature) => {
            const isSelected = selectedFeatures.includes(feature);
            label.text = isSelected ? `[✓] ${feature}` : `[ ] ${feature}`;
            label.fill = isSelected ? "#006600" : "#333333";
        });
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

        // Calculate map position using layout constants (CRAP: Alignment)
        const mapX = this.MARGIN;
        const mapY = this.MARGIN + this.HEADER_HEIGHT + this.SECTION_SPACING;
        const mapWidth = 500;
        const mapHeight = 400;

        // Create or update map widget
        if (this._mapWidget) {
            // Update existing map widget's points
            this._mapWidget.points = mapPoints;
        } else {
            // Create new map widget with consistent styling
            this._mapWidget = new MapWidget(mapPoints, {
                x: mapX,
                y: mapY,
                width: mapWidth,
                height: mapHeight,
                fill: "#e8f5e9",  // Light green background (softer than before)
                border: "#2e7d32"  // Dark green border for contrast
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
            // Positioned to the right of map with consistent spacing (CRAP: Alignment, Proximity)
            const mapX = this.MARGIN;
            const mapWidth = 500;
            const detailsX = mapX + mapWidth + this.SECTION_SPACING;
            const detailsY = this.MARGIN + this.HEADER_HEIGHT + this.SECTION_SPACING;
            
            this._detailsContainer = new SKContainer({
                x: detailsX,
                y: detailsY,
                width: 240,  // Slightly wider for better readability
                height: 400,
                fill: "#fafafa",  // Very light gray for subtle contrast
                border: "#424242"  // Dark gray border for definition
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
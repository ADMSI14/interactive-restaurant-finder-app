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
    private _resultCountLabel: SKLabel | null = null;

    // Layout constants following CRAP principles
    private readonly MARGIN = 20;           // Consistent margin around all elements
    private readonly SECTION_SPACING = 15;   // Spacing between major sections
    private readonly HEADER_HEIGHT = 40;     // Height for header/title area
    private readonly FILTER_PANEL_PADDING = 10;  // Internal padding for filter panel
    private readonly DETAILS_PANEL_WIDTH = 240;  // Width of details panel
    private readonly DETAILS_PANEL_PADDING = 15;  // Internal padding for details panel
    
    // Style constants for consistent styling (CRAP: Repetition)
    private readonly COLORS = {
        // Text colors
        PRIMARY_TEXT: "#000000",        // Black for headings and important text
        SECONDARY_TEXT: "#333333",      // Dark gray for body text
        MUTED_TEXT: "#666666",          // Medium gray for secondary/placeholder text
        SUCCESS: "#006600",              // Green for positive states (selected features)
        
        // Background colors
        MAIN_BG: "#ffffff",              // White for main container
        PANEL_BG: "#f5f5f5",            // Light gray for filter panel
        DETAILS_BG: "#fafafa",           // Very light gray for details panel
        MAP_BG: "#e8f5e9",              // Light green for map background
        
        // Border colors
        PRIMARY_BORDER: "#424242",       // Dark gray for details panel
        SECONDARY_BORDER: "#9e9e9e",     // Medium gray for filter panel
        MAP_BORDER: "#2e7d32"            // Dark green for map border
    };
    
    private readonly FONTS = {
        HEADER: "bold 24px Arial",       // Main application title
        SECTION_TITLE: "bold 14px Arial", // Section titles (Map, Filters, Details)
        FILTER_TITLE: "bold 12px Arial", // Filter section titles
        BODY: "12px Arial",               // Regular body text
        SMALL: "11px Arial",              // Small text (instructions, counts)
        TINY: "10px Arial"                // Tiny text (placeholders, notes)
    };
    
    private readonly SPACING = {
        ITEM: 8,          // Spacing between items in a section
        SECTION: 15,      // Spacing between major sections
        LARGE_SECTION: 25 // Larger spacing for visual separation
    };
    
    constructor() {
        // Create main container with consistent background
        this._container = new SKContainer({
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            fill: this.COLORS.MAIN_BG,  // Consistent background color
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
        header.font = this.FONTS.HEADER;
        header.fill = this.COLORS.PRIMARY_TEXT;
        this._container.addChild(header);
    }

    // Create filters panel with placeholder widgets
    // Following CRAP principles: Proximity (grouped filters), Alignment, Repetition
    private createFiltersPanel(): void {
        // Calculate filter panel position (below map with consistent spacing)
        // Use getMapLayout() for consistency
        const mapLayout = this.getMapLayout();
        const filterY = mapLayout.y + mapLayout.height + this.SECTION_SPACING;
        
        // Create filters container positioned below the map with consistent alignment
        // Positioned at bottom of available space, aligned with map left edge
        this._filtersContainer = new SKContainer({
            x: this.MARGIN,  // Aligned with map left edge (CRAP: Alignment)
            y: filterY,
            width: 500,  // Same width as map for alignment
            height: 240,
            fill: this.COLORS.PANEL_BG,  // Consistent panel background
            border: this.COLORS.SECONDARY_BORDER  // Consistent border color
        });
        this._container.addChild(this._filtersContainer);

        // Cost Range Filter Section - Left side of filter panel
        const costTitle = new SKLabel({
            text: "Cost Range ($):",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING,
            width: 120,
            height: 20
        });
        costTitle.font = this.FONTS.FILTER_TITLE;
        costTitle.fill = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(costTitle);

        // Min Cost Label - Aligned with consistent padding
        const minCostLabel = new SKLabel({
            text: "Min:",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 25,
            width: 40,
            height: 20
        });
        minCostLabel.font = this.FONTS.BODY;
        this._filtersContainer.addChild(minCostLabel);

        // Min Cost Value (placeholder - will be updated from model)
        this._costMinLabel = new SKLabel({
            text: "0",
            x: this.FILTER_PANEL_PADDING + 45,
            y: this.FILTER_PANEL_PADDING + 25,
            width: 60,
            height: 20
        });
        this._costMinLabel.font = this.FONTS.BODY;
        this._costMinLabel.fill = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._costMinLabel);

        // Max Cost Label - Aligned with min cost label
        const maxCostLabel = new SKLabel({
            text: "Max:",
            x: this.FILTER_PANEL_PADDING + 120,
            y: this.FILTER_PANEL_PADDING + 25,
            width: 40,
            height: 20
        });
        maxCostLabel.font = this.FONTS.BODY;
        this._filtersContainer.addChild(maxCostLabel);

        // Max Cost Value (placeholder - will be updated from model)
        this._costMaxLabel = new SKLabel({
            text: "1000",
            x: this.FILTER_PANEL_PADDING + 165,
            y: this.FILTER_PANEL_PADDING + 25,
            width: 60,
            height: 20
        });
        this._costMaxLabel.font = this.FONTS.BODY;
        this._costMaxLabel.fill = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._costMaxLabel);

        // Rating Range Filter Section - Below cost range, aligned left
        const ratingTitle = new SKLabel({
            text: "Rating Range:",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 60,
            width: 120,
            height: 20
        });
        ratingTitle.font = this.FONTS.FILTER_TITLE;
        ratingTitle.fill = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(ratingTitle);

        // Min Rating Label - Aligned with cost labels
        const minRatingLabel = new SKLabel({
            text: "Min:",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 85,
            width: 40,
            height: 20
        });
        minRatingLabel.font = this.FONTS.BODY;
        this._filtersContainer.addChild(minRatingLabel);

        // Min Rating Value (placeholder - will be updated from model)
        this._ratingMinLabel = new SKLabel({
            text: "0.0",
            x: this.FILTER_PANEL_PADDING + 45,
            y: this.FILTER_PANEL_PADDING + 85,
            width: 60,
            height: 20
        });
        this._ratingMinLabel.font = this.FONTS.BODY;
        this._ratingMinLabel.fill = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._ratingMinLabel);

        // Max Rating Label - Aligned with cost labels
        const maxRatingLabel = new SKLabel({
            text: "Max:",
            x: this.FILTER_PANEL_PADDING + 120,
            y: this.FILTER_PANEL_PADDING + 85,
            width: 40,
            height: 20
        });
        maxRatingLabel.font = this.FONTS.BODY;
        this._filtersContainer.addChild(maxRatingLabel);

        // Max Rating Value (placeholder - will be updated from model)
        this._ratingMaxLabel = new SKLabel({
            text: "5.0",
            x: this.FILTER_PANEL_PADDING + 165,
            y: this.FILTER_PANEL_PADDING + 85,
            width: 60,
            height: 20
        });
        this._ratingMaxLabel.font = this.FONTS.BODY;
        this._ratingMaxLabel.fill = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._ratingMaxLabel);

        // Restaurant Type Filter Section - Below rating range, aligned left
        const typeTitle = new SKLabel({
            text: "Restaurant Type:",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 120,
            width: 120,
            height: 20
        });
        typeTitle.font = this.FONTS.FILTER_TITLE;
        typeTitle.fill = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(typeTitle);

        // Type Selection Label (placeholder - will be replaced with radio buttons)
        this._typeLabel = new SKLabel({
            text: "All Types",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 145,
            width: 200,
            height: 20
        });
        this._typeLabel.font = this.FONTS.BODY;
        this._typeLabel.fill = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._typeLabel);

        // Features Filter Section - Right side of filter panel (CRAP: Proximity - grouped separately)
        const featuresTitle = new SKLabel({
            text: "Features:",
            x: 250,  // Right side of panel
            y: this.FILTER_PANEL_PADDING,
            width: 100,
            height: 20
        });
        featuresTitle.font = this.FONTS.FILTER_TITLE;
        featuresTitle.fill = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(featuresTitle);

        // Feature checkboxes (placeholder - will be replaced with actual checkboxes)
        // Positioned on right side, aligned vertically
        const features = [
            "free parking",
            "pets allowed",
            "vegetarian options",
            "gluten free options"
        ];

        let featureY = this.FILTER_PANEL_PADDING + 25;
        features.forEach((feature) => {
            // Feature label with checkbox indicator - Right side alignment
            const featureLabel = new SKLabel({
                text: `[ ] ${feature}`,
                x: 250,  // Right side of panel
                y: featureY,
                width: 200,
                height: 20
            });
            featureLabel.font = this.FONTS.BODY;
            featureLabel.fill = this.COLORS.SECONDARY_TEXT;
            this._filtersContainer.addChild(featureLabel);
            this._featuresLabels.set(feature, featureLabel);
            featureY += 25;  // Consistent spacing between features
        });

        // Filter panel title for clarity
        const filterPanelTitle = new SKLabel({
            text: "Filters",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING - 18,
            width: 200,
            height: 16
        });
        filterPanelTitle.font = this.FONTS.SECTION_TITLE;
        filterPanelTitle.fill = this.COLORS.PRIMARY_TEXT;
        this._container.addChild(filterPanelTitle);
        
        // Placeholder text indicating these will be replaced with widgets
        const placeholderNote = new SKLabel({
            text: "(Placeholder - will be replaced with interactive widgets)",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 170,
            width: 350,
            height: 15
        });
        placeholderNote.font = this.FONTS.TINY;
        placeholderNote.fill = this.COLORS.MUTED_TEXT;
        this._filtersContainer.addChild(placeholderNote);
        
        // Add result count label (will be updated dynamically)
        this._resultCountLabel = new SKLabel({
            text: `Showing: 0 restaurants`,
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 195,
            width: 200,
            height: 16
        });
        this._resultCountLabel.font = this.FONTS.SMALL;
        this._resultCountLabel.fill = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._resultCountLabel);
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
            label.fill = isSelected ? this.COLORS.SUCCESS : this.COLORS.SECONDARY_TEXT;
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

    // Get map position and size (used for consistent positioning)
    private getMapLayout(): { x: number; y: number; width: number; height: number } {
        const mapX = this.MARGIN;
        const mapY = this.MARGIN + this.HEADER_HEIGHT + this.SECTION_SPACING;
        const mapWidth = 500;
        const mapHeight = 400;
        return { x: mapX, y: mapY, width: mapWidth, height: mapHeight };
    }

    // Update result count display
    public updateResultCount(count: number): void {
        if (this._resultCountLabel) {
            this._resultCountLabel.text = `Showing: ${count} restaurant${count !== 1 ? 's' : ''}`;
        }
    }

    // Update map with filtered restaurants
    public updateMap(restaurants: Restaurant[]): void {
        // Convert restaurants to map points
        const mapPoints: MapPoint[] = this.restaurantsToMapPoints(restaurants);

        // Get map layout using layout constants (CRAP: Alignment, Repetition)
        const mapLayout = this.getMapLayout();

        // Create or update map widget
        if (this._mapWidget) {
            // Update existing map widget's points
            // Position and size are set during creation and maintained
            this._mapWidget.points = mapPoints;
        } else {
            // Create new map widget with consistent styling and positioning
            this._mapWidget = new MapWidget(mapPoints, {
                x: mapLayout.x,
                y: mapLayout.y,
                width: mapLayout.width,
                height: mapLayout.height,
                fill: this.COLORS.MAP_BG,  // Consistent map background
                border: this.COLORS.MAP_BORDER  // Consistent map border
            });
            
            // Add map widget to container
            this._container.addChild(this._mapWidget);
            
            // Add map title/label for clarity
            const mapTitle = new SKLabel({
                text: "Restaurant Locations",
                x: mapLayout.x,
                y: mapLayout.y - 18,
                width: mapLayout.width,
                height: 16
            });
            mapTitle.font = this.FONTS.SECTION_TITLE;
            mapTitle.fill = this.COLORS.PRIMARY_TEXT;
            this._container.addChild(mapTitle);
            
            // Add instruction text below map title
            const mapInstruction = new SKLabel({
                text: "Hover over markers to see details • Click to select",
                x: mapLayout.x,
                y: mapLayout.y - 2,
                width: mapLayout.width,
                height: 14
            });
            mapInstruction.font = this.FONTS.SMALL;
            mapInstruction.fill = this.COLORS.MUTED_TEXT;
            this._container.addChild(mapInstruction);
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
            // Use getMapLayout() for consistency - aligned with map top and height
            const mapLayout = this.getMapLayout();
            const detailsX = mapLayout.x + mapLayout.width + this.SECTION_SPACING;
            const detailsY = mapLayout.y;  // Aligned with map top (CRAP: Alignment)
            
            this._detailsContainer = new SKContainer({
                x: detailsX,
                y: detailsY,
                width: this.DETAILS_PANEL_WIDTH,  // Consistent width
                height: mapLayout.height,  // Same height as map for alignment
                fill: this.COLORS.DETAILS_BG,  // Consistent details background
                border: this.COLORS.PRIMARY_BORDER  // Consistent details border
            });
            this._container.addChild(this._detailsContainer);
            
            // Add details panel title for clarity
            const detailsTitle = new SKLabel({
                text: "Restaurant Details",
                x: detailsX,
                y: detailsY - 18,
                width: this.DETAILS_PANEL_WIDTH,
                height: 16
            });
            detailsTitle.font = this.FONTS.SECTION_TITLE;
            detailsTitle.fill = this.COLORS.PRIMARY_TEXT;
            this._container.addChild(detailsTitle);
        }

        if (!restaurant) {
            // Show placeholder when no restaurant is selected
            // Positioned with consistent padding (CRAP: Alignment)
            const placeholder = new SKLabel({
                text: "Click on a restaurant marker to see details",
                x: this.DETAILS_PANEL_PADDING,
                y: this.DETAILS_PANEL_PADDING + 10,
                width: this.DETAILS_PANEL_WIDTH - (this.DETAILS_PANEL_PADDING * 2),
                height: 40
            });
            placeholder.font = this.FONTS.BODY;
            placeholder.fill = this.COLORS.MUTED_TEXT; // Consistent muted color
            this._detailsContainer.addChild(placeholder);
            this._detailsLabels.push(placeholder);
            return;
        }

        // Design constants following CRAP principles
        // Use layout constants for consistency
        const leftMargin = this.DETAILS_PANEL_PADDING;        // Consistent left alignment
        const topMargin = this.DETAILS_PANEL_PADDING;          // Consistent top margin
        const labelWidth = this.DETAILS_PANEL_WIDTH - (this.DETAILS_PANEL_PADDING * 2);  // Consistent width for alignment
        const sectionSpacing = this.SPACING.SECTION;     // Spacing between sections (Proximity)
        const itemSpacing = this.SPACING.ITEM;         // Spacing between items (Proximity)
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
        nameLabel.font = "bold 18px Arial";  // Restaurant name - larger than section titles
        nameLabel.fill = this.COLORS.PRIMARY_TEXT; // Strong contrast for heading
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
        typeLabel.font = this.FONTS.BODY;
        typeLabel.fill = this.COLORS.SECONDARY_TEXT;
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
        costLabel.font = this.FONTS.BODY;
        costLabel.fill = this.COLORS.SECONDARY_TEXT;
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
        ratingLabel.font = this.FONTS.BODY;
        ratingLabel.fill = this.COLORS.SECONDARY_TEXT;
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
        featuresTitle.font = "bold 13px Arial";  // Slightly larger than filter titles
        featuresTitle.fill = this.COLORS.PRIMARY_TEXT; // Bold for section heading (Contrast)
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
        parkingLabel.font = this.FONTS.BODY;
        parkingLabel.fill = hasParking ? this.COLORS.SUCCESS : this.COLORS.MUTED_TEXT; // Color coding (Contrast)
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
        petsLabel.font = this.FONTS.BODY;
        petsLabel.fill = hasPets ? this.COLORS.SUCCESS : this.COLORS.MUTED_TEXT; // Color coding (Contrast)
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
            additionalLabel.font = this.FONTS.SMALL;
            additionalLabel.fill = this.COLORS.SUCCESS; // Green for available features (Contrast)
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
        addressTitle.font = this.FONTS.FILTER_TITLE;
        addressTitle.fill = this.COLORS.PRIMARY_TEXT;
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
        addressLabel.font = this.FONTS.SMALL;
        addressLabel.fill = this.COLORS.SECONDARY_TEXT;
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
            descTitle.font = this.FONTS.FILTER_TITLE;
            descTitle.fill = this.COLORS.PRIMARY_TEXT;
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
            descLabel.font = this.FONTS.SMALL;
            descLabel.fill = this.COLORS.SECONDARY_TEXT;
            this._detailsContainer.addChild(descLabel);
            this._detailsLabels.push(descLabel);
        }
    }
}
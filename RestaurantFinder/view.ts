import { SKContainer, SKLabel } from "../simplekit/src/imperative-mode";
import { MapWidget, MapPoint } from "../widgets/MapWidget";
import { RangeSlider, Slider } from "../widgets/slider";
import { RadioButton, RadioButtonGroup } from "../widgets/radiobutton";
import { CheckBox } from "../widgets/checkbox";
import { Restaurant } from "./model";

export class RestaurantFinderView {
    private _mapWidget: MapWidget | null = null;
    private _container: SKContainer;
    private _detailsContainer: SKContainer | null = null;
    private _detailsLabels: SKLabel[] = [];
    private _filtersContainer: SKContainer | null = null;
    private _rightSideContainer: SKContainer | null = null;
    private _costRangeSlider: RangeSlider | null = null;
    private _ratingRangeSlider: RangeSlider | null = null;
    private _costRangeLabel: SKLabel | null = null;
    private _ratingRangeLabel: SKLabel | null = null;
    private _typeRadioGroup: RadioButtonGroup | null = null;
    private _typeRadioButtons: Map<string, RadioButton> = new Map();
    private _typeLabels: Map<string, SKLabel> = new Map();
    private _featureCheckboxes: Map<string, CheckBox> = new Map();
    private _resultCountLabel: SKLabel | null = null;
    private _distanceFilterCheckbox: CheckBox | null = null;
    private _distanceFilterLabel: SKLabel | null = null;
    private _maxDistanceSlider: Slider | null = null;
    private _maxDistanceLabel: SKLabel | null = null;
    private _point1StatusLabel: SKLabel | null = null;
    private _point2StatusLabel: SKLabel | null = null;
    private _clearPointsLabel: SKLabel | null = null;
    private _mapInstructionLabel: SKLabel | null = null;
    
    // Reference to controller for event handling (set after construction)
    private _controller: any = null;
    public setController(controller: any): void {
        this._controller = controller;
    }

    // Layout constants following CRAP principles
    private readonly MARGIN = 20;           // Consistent margin around all elements
    private readonly SECTION_SPACING = 15;   // Spacing between major sections
    private readonly HEADER_HEIGHT = 40;     // Height for header/title area
    private readonly FILTER_PANEL_PADDING = 10;  // Internal padding for filter panel
    private readonly DETAILS_PANEL_WIDTH = 410;  // Width of details panel (increased for better readability)
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
        // Height will be adjusted dynamically if filter panel expands
        this._container = new SKContainer({
            x: 0,
            y: 0,
            width: 800,
            height: 600,  // Base height, may be adjusted
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
        header.fill = "";  // No background fill
        header.fontColour = this.COLORS.PRIMARY_TEXT;
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
        // Layout ensures everything fits within container (responsive)
        // Map (350px) + spacing (15px) + filters (240px) = 605px total
        // With margins and header: header(40) + margin(20) + mapY(75) + map(350) + spacing(15) + filters(240) = 740px
        // This exceeds 600px, so we adjust map height to 350px to fit better
        this._filtersContainer = new SKContainer({
            x: this.MARGIN,  // Aligned with map left edge (CRAP: Alignment)
            y: filterY,
            width: 1238,  // spans the width of the screen - right container 
            height: 145,  // reduced height to fit the screen
            fill: this.COLORS.PANEL_BG,  // Consistent panel background
            border: this.COLORS.SECONDARY_BORDER  // Consistent border color
        });
        this._container.addChild(this._filtersContainer);

        // Cost Range Filter Section - Left side of filter panel
        const costTitle = new SKLabel({
            text: "Cost Range ($):",
            x: this.FILTER_PANEL_PADDING + 60,  // Moved 10px to the right
            y: this.FILTER_PANEL_PADDING,
            width: 120,
            height: 20
        });
        costTitle.font = this.FONTS.FILTER_TITLE;
        costTitle.fill = "";  // No background fill
        costTitle.fontColour = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(costTitle);

        // Cost Range Slider - Interactive widget for selecting cost range
        this._costRangeSlider = new RangeSlider({
            minValue: 0,
            maxValue: 1000,
            min: 0,
            max: 1000,
            x: this.FILTER_PANEL_PADDING + 60,  // Moved 10px to the right
            y: this.FILTER_PANEL_PADDING + 25,
            width: 300,  // Increased width to make slider longer
            height: 20,
            trackColor: "#cccccc",
            thumbColor: "#0066cc",
            rangeColor: "#0066cc"
        });
        // Event listener will be set up in controller using global event listener
        this._filtersContainer.addChild(this._costRangeSlider);

        // Cost Range Label - Shows the selected cost range
        this._costRangeLabel = new SKLabel({
            text: "$0 - $1000",
            x: this.FILTER_PANEL_PADDING + 60 + 300 + 10,  // To the right of the slider
            y: this.FILTER_PANEL_PADDING + 25,
            width: 120,
            height: 20
        });
        this._costRangeLabel.font = this.FONTS.BODY;
        this._costRangeLabel.fill = "";  // No background fill
        this._costRangeLabel.fontColour = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._costRangeLabel);

        // Rating Range Filter Section - Below cost range, aligned left
        const ratingTitle = new SKLabel({
            text: "Rating Range:",
            x: this.FILTER_PANEL_PADDING + 60,  // Moved 10px to the right
            y: this.FILTER_PANEL_PADDING + 60,
            width: 120,
            height: 20
        });
        ratingTitle.font = this.FONTS.FILTER_TITLE;
        ratingTitle.fill = "";  // No background fill
        ratingTitle.fontColour = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(ratingTitle);

        // Rating Range Slider - Interactive widget for selecting rating range
        this._ratingRangeSlider = new RangeSlider({
            minValue: 0,
            maxValue: 5,
            min: 0,
            max: 5,
            x: this.FILTER_PANEL_PADDING + 60,  // Moved 10px to the right
            y: this.FILTER_PANEL_PADDING + 85,
            width: 300,  // Increased width to make slider longer
            height: 20,
            trackColor: "#cccccc",
            thumbColor: "#0066cc",
            rangeColor: "#0066cc"
        });
        // Event listener will be set up in controller using global event listener
        this._filtersContainer.addChild(this._ratingRangeSlider);

        // Rating Range Label - Shows the selected rating range
        this._ratingRangeLabel = new SKLabel({
            text: "0.0 - 5.0",
            x: this.FILTER_PANEL_PADDING + 60 + 300 + 10,  // To the right of the slider
            y: this.FILTER_PANEL_PADDING + 85,
            width: 120,
            height: 20
        });
        this._ratingRangeLabel.font = this.FONTS.BODY;
        this._ratingRangeLabel.fill = "";  // No background fill
        this._ratingRangeLabel.fontColour = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._ratingRangeLabel);

        // Distance Filter Section - Positioned to the right of rating range
        const distanceFilterX = this.FILTER_PANEL_PADDING + 60 + 300 + 10 + 120 + 60; // After rating range label
        const distanceFilterY = this.FILTER_PANEL_PADDING;
        
        // Distance Filter Title
        const distanceFilterTitle = new SKLabel({
            text: "Distance Filter:",
            x: distanceFilterX,
            y: distanceFilterY,
            width: 120,
            height: 20
        });
        distanceFilterTitle.font = this.FONTS.FILTER_TITLE;
        distanceFilterTitle.fill = "";
        distanceFilterTitle.fontColour = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(distanceFilterTitle);

        // Enable Distance Filter Checkbox
        this._distanceFilterCheckbox = new CheckBox({
            checked: false,
            x: distanceFilterX,
            y: distanceFilterY + 25,
            width: 20,
            height: 20
        });
        this._filtersContainer.addChild(this._distanceFilterCheckbox);

        // Distance Filter Label
        this._distanceFilterLabel = new SKLabel({
            text: "Enable distance filter",
            x: distanceFilterX + 25,
            y: distanceFilterY + 25,
            width: 150,
            height: 20
        });
        this._distanceFilterLabel.font = this.FONTS.BODY;
        this._distanceFilterLabel.fill = "";
        this._distanceFilterLabel.fontColour = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._distanceFilterLabel);

        // Max Distance Slider
        const maxDistanceTitle = new SKLabel({
            text: "Max Distance (km):",
            x: distanceFilterX,
            y: distanceFilterY + 50,
            width: 130,
            height: 20
        });
        maxDistanceTitle.font = this.FONTS.FILTER_TITLE;
        maxDistanceTitle.fill = "";
        maxDistanceTitle.fontColour = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(maxDistanceTitle);

        this._maxDistanceSlider = new Slider({
            value: 5,
            min: 1,
            max: 20, // Allow up to 20 km
            x: distanceFilterX,
            y: distanceFilterY + 75,
            width: 200,
            height: 20,
            trackColor: "#cccccc",
            thumbColor: "#0066cc"
        });
        this._filtersContainer.addChild(this._maxDistanceSlider);

        // Max Distance Value Label
        this._maxDistanceLabel = new SKLabel({
            text: "5 km",
            x: distanceFilterX + 200 + 10,
            y: distanceFilterY + 75,
            width: 60,
            height: 20
        });
        this._maxDistanceLabel.font = this.FONTS.BODY;
        this._maxDistanceLabel.fill = "";
        this._maxDistanceLabel.fontColour = this.COLORS.SECONDARY_TEXT;
        this._filtersContainer.addChild(this._maxDistanceLabel);

        // Point Status Labels
        this._point1StatusLabel = new SKLabel({
            text: "Point 1: Not selected",
            x: distanceFilterX,
            y: distanceFilterY + 100,
            width: 180,
            height: 20
        });
        this._point1StatusLabel.font = this.FONTS.SMALL;
        this._point1StatusLabel.fill = "";
        this._point1StatusLabel.fontColour = this.COLORS.MUTED_TEXT;
        this._filtersContainer.addChild(this._point1StatusLabel);

        this._point2StatusLabel = new SKLabel({
            text: "Point 2: Not selected",
            x: distanceFilterX,
            y: distanceFilterY + 115,
            width: 180,
            height: 20
        });
        this._point2StatusLabel.font = this.FONTS.SMALL;
        this._point2StatusLabel.fill = "";
        this._point2StatusLabel.fontColour = this.COLORS.MUTED_TEXT;
        this._filtersContainer.addChild(this._point2StatusLabel);

        // Clear Points Label (clickable instruction)
        this._clearPointsLabel = new SKLabel({
            text: "Click map to select points",
            x: distanceFilterX,
            y: distanceFilterY + 130,
            width: 180,
            height: 20
        });
        this._clearPointsLabel.font = this.FONTS.TINY;
        this._clearPointsLabel.fill = "";
        this._clearPointsLabel.fontColour = this.COLORS.MUTED_TEXT;
        this._filtersContainer.addChild(this._clearPointsLabel);

        // Note: Restaurant Type section has been moved to the right-side container

        // Features Filter Section - Positioned to the right in filters container, below details container, centered to details container width
        // Calculate position relative to details container
        const mapLayoutForFeatures = this.getMapLayout();
        const detailsX = mapLayoutForFeatures.x + mapLayoutForFeatures.width + this.SECTION_SPACING;
        
        // Calculate x position to center Features relative to details container width
        // Details container center: detailsX + (DETAILS_PANEL_WIDTH / 2)
        // Features x relative to filters container: (details container center) - (filters container x) - (features section width / 2)
        const featuresSectionWidth = 200;
        const featuresX = (detailsX + (this.DETAILS_PANEL_WIDTH / 2)) - this.MARGIN - (featuresSectionWidth / 2);
        
        // Position Features at the top of filters container (below details container visually)
        const featuresY = this.FILTER_PANEL_PADDING;
        
        const featuresTitle = new SKLabel({
            text: "Features:",
            x: featuresX,
            y: featuresY,
            width: featuresSectionWidth,
            height: 20
        });
        featuresTitle.font = this.FONTS.FILTER_TITLE;
        featuresTitle.fill = "";  // No background fill
        featuresTitle.fontColour = this.COLORS.PRIMARY_TEXT;
        this._filtersContainer.addChild(featuresTitle);

        // Feature Checkboxes - Interactive widgets for selecting features
        // Positioned below details container, centered to details container width, aligned vertically
        const features = [
            "free parking",
            "pets allowed",
            "vegetarian options",
            "gluten free options"
        ];

        let featureCheckboxY = featuresY + 25;
        features.forEach((feature) => {
            // Create checkbox widget
            const checkbox = new CheckBox({
                checked: false,
                x: featuresX,
                y: featureCheckboxY,
                width: 20,
                height: 20
            });
            // Event listener will be set up in controller using global event listener
            this._featureCheckboxes.set(feature, checkbox);
            if (this._filtersContainer) {
                this._filtersContainer.addChild(checkbox);
            }
            
            // Feature label next to checkbox
            const featureLabel = new SKLabel({
                text: feature,
                x: featuresX + 25,  // After checkbox
                y: featureCheckboxY,
                width: 175,
                height: 20
            });
            featureLabel.font = this.FONTS.BODY;
            featureLabel.fill = "";  // No background fill
            featureLabel.fontColour = this.COLORS.SECONDARY_TEXT;
            if (this._filtersContainer) {
                this._filtersContainer.addChild(featureLabel);
            }
            
            featureCheckboxY += 25;  // Consistent spacing between features
        });

        
        // Add result count label (will be updated dynamically)
        // Positioned at top center of filters container
        const resultCountLabelWidth = 200;
        const filtersContainerWidth = this._filtersContainer.width || 1238;
        this._resultCountLabel = new SKLabel({
            text: `Showing: 0 restaurants`,
            x: (filtersContainerWidth / 2) - (resultCountLabelWidth / 2),  // Centered horizontally
            y: this.FILTER_PANEL_PADDING,  // At the top
            width: resultCountLabelWidth,
            height: 16
        });
        this._resultCountLabel.font = this.FONTS.SECTION_TITLE;  // Larger font for better visibility
        this._resultCountLabel.fill = "";  // No background fill
        this._resultCountLabel.fontColour = this.COLORS.PRIMARY_TEXT;  // Use primary text color for emphasis
        this._filtersContainer.addChild(this._resultCountLabel);
    }

    // Update cost range display from model
    public updateCostRange(minCost: number, maxCost: number): void {
        if (this._costRangeSlider) {
            // Only update if slider is not currently being dragged to avoid freezing
            const isDragging = (this._costRangeSlider as any)._controller?._isDragging || false;
            if (!isDragging) {
                this._costRangeSlider.minValue = minCost;
                this._costRangeSlider.maxValue = maxCost;
            }
        }
        // Update cost range label
        if (this._costRangeLabel) {
            this._costRangeLabel.text = `$${Math.round(minCost)} - $${Math.round(maxCost)}`;
        }
    }

    // Update cost range slider bounds (min/max possible values)
    public updateCostRangeBounds(minCost: number, maxCost: number): void {
        if (this._costRangeSlider) {
            this._costRangeSlider.min = minCost;
            this._costRangeSlider.max = maxCost;
        }
    }

    // Update rating range display from model
    public updateRatingRange(minRating: number, maxRating: number): void {
        if (this._ratingRangeSlider) {
            // Only update if slider is not currently being dragged to avoid freezing
            const isDragging = (this._ratingRangeSlider as any)._controller?._isDragging || false;
            if (!isDragging) {
                this._ratingRangeSlider.minValue = minRating;
                this._ratingRangeSlider.maxValue = maxRating;
            }
        }
        // Update rating range label
        if (this._ratingRangeLabel) {
            this._ratingRangeLabel.text = `${minRating.toFixed(1)} - ${maxRating.toFixed(1)}`;
        }
    }

    // Update rating range slider bounds (min/max possible values)
    public updateRatingRangeBounds(minRating: number, maxRating: number): void {
        if (this._ratingRangeSlider) {
            this._ratingRangeSlider.min = minRating;
            this._ratingRangeSlider.max = maxRating;
        }
    }

    // Update restaurant type display from model
    // Updates radio button selections based on selected type
    public updateRestaurantType(selectedType: string | null): void {
        if (!this._typeRadioGroup || !this._filtersContainer) return;
        
        // Update existing radio buttons if they exist
        this._typeRadioButtons.forEach((radio, typeName) => {
            radio.selected = (selectedType === typeName);
        });
        
        // Find and update "All Types" radio button (first in group)
        const allTypesRadio = this._typeRadioGroup.radioButtons[0];
        if (allTypesRadio && selectedType === null) {
            allTypesRadio.selected = true;
        } else if (allTypesRadio && selectedType !== null) {
            allTypesRadio.selected = false;
        }
    }
    
    // Initialize restaurant type radio buttons based on available types
    public initializeTypeRadioButtons(availableTypes: string[]): void {
        // Ensure right-side container exists (it's created with details container)
        this.ensureRightSideContainer();
        
        if (!this._typeRadioGroup || !this._rightSideContainer) return;
        
        // Clear existing type radio buttons (except "All Types")
        this._typeRadioButtons.forEach((radio, typeName) => {
            this._typeRadioGroup!.removeRadioButton(radio);
            this._rightSideContainer!.removeChild(radio);
            // Remove associated label
            const label = this._typeLabels.get(typeName);
            if (label && this._rightSideContainer) {
                this._rightSideContainer.removeChild(label);
            }
        });
        this._typeRadioButtons.clear();
        this._typeLabels.clear();
        
        // Calculate equal spacing for all radio buttons (including "All Types")
        // Total number of options: 1 ("All Types") + availableTypes.length
        const totalOptions = 1 + availableTypes.length;
        const containerHeight = this._rightSideContainer.height || 590;
        const titleHeight = 20; // Height of "Restaurant Type:" title
        const topPadding = this.FILTER_PANEL_PADDING;
        const bottomPadding = this.FILTER_PANEL_PADDING;
        
        // Available height for radio buttons = container height - title height - top padding - bottom padding
        const availableHeight = containerHeight - titleHeight - topPadding - bottomPadding;
        
        // Calculate spacing between radio buttons (equal division of available height)
        const spacing = availableHeight / totalOptions;
        
        // Update "All Types" position to be evenly spaced (first option, index 0)
        const allTypesRadio = this._typeRadioGroup.radioButtons[0];
        if (allTypesRadio) {
            // Center the radio button in its allocated slot
            const allTypesY = topPadding + titleHeight + (spacing / 2) - 10; // -10 to center 20px high button
            allTypesRadio.y = allTypesY;
            // Update "All Types" label position - find it in the container
            const allTypesLabel = this._rightSideContainer.children.find(
                (child): child is SKLabel => child instanceof SKLabel && child.text === "All Types"
            );
            if (allTypesLabel) {
                allTypesLabel.y = allTypesY;
            }
        }
        
        // Create radio buttons for each available type, evenly distributed
        availableTypes.forEach((typeName, index) => {
            // Position: evenly space all options (index + 1 because "All Types" is at index 0)
            // Center each radio button in its allocated slot
            const typeY = topPadding + titleHeight + ((index + 1) * spacing) + (spacing / 2) - 10;
            
            const typeRadio = new RadioButton({
                selected: false,
                x: this.FILTER_PANEL_PADDING,
                y: typeY,
                width: 20,
                height: 20
            });
            // Event listener will be set up in controller using global event listener
            if (this._typeRadioGroup) {
                this._typeRadioGroup.addRadioButton(typeRadio);
            }
            this._typeRadioButtons.set(typeName, typeRadio);
            if (this._rightSideContainer) {
                this._rightSideContainer.addChild(typeRadio);
            }
            
            // Type label
            const typeLabel = new SKLabel({
                text: typeName,
                x: this.FILTER_PANEL_PADDING + 25,
                y: typeY,
                width: 200,
                height: 20
            });
            typeLabel.font = this.FONTS.BODY;
            typeLabel.fill = "";  // No background fill
            typeLabel.fontColour = this.COLORS.SECONDARY_TEXT;
            this._typeLabels.set(typeName, typeLabel);
            if (this._rightSideContainer) {
                this._rightSideContainer.addChild(typeLabel);
            }
        });
    }

    // Update features display from model
    public updateFeatures(selectedFeatures: string[]): void {
        // Update all feature checkboxes to show checked/unchecked state
        this._featureCheckboxes.forEach((checkbox, feature) => {
            const isSelected = selectedFeatures.includes(feature);
            checkbox.checked = isSelected;
        });
    }

    // Update distance filter enabled state
    public updateDistanceFilterEnabled(enabled: boolean): void {
        if (this._distanceFilterCheckbox) {
            this._distanceFilterCheckbox.checked = enabled;
        }
        // Update map instruction text based on filter state
        this.updateMapInstruction(enabled);
    }

    // Update map instruction text based on distance filter state
    private updateMapInstruction(distanceFilterEnabled: boolean): void {
        if (this._mapInstructionLabel) {
            if (distanceFilterEnabled) {
                this._mapInstructionLabel.text = "Click on map to select points • Click markers for details";
            } else {
                this._mapInstructionLabel.text = "Hover over markers to see details • Click to select";
            }
        }
    }

    // Update max distance display
    public updateMaxDistance(km: number): void {
        if (this._maxDistanceSlider) {
            // Only update if slider is not currently being dragged to avoid freezing
            const isDragging = (this._maxDistanceSlider as any)._controller?._isDragging || false;
            if (!isDragging) {
                this._maxDistanceSlider.value = km;
            }
        }
        // Update max distance label
        if (this._maxDistanceLabel) {
            this._maxDistanceLabel.text = `${km.toFixed(1)} km`;
        }
    }

    // Update selection points status labels
    public updateSelectionPoints(
        point1: { latitude: number; longitude: number } | null,
        point2: { latitude: number; longitude: number } | null
    ): void {
        if (this._point1StatusLabel) {
            if (point1) {
                this._point1StatusLabel.text = `Point 1: (${point1.latitude.toFixed(4)}, ${point1.longitude.toFixed(4)})`;
                this._point1StatusLabel.fontColour = this.COLORS.SUCCESS;
            } else {
                this._point1StatusLabel.text = "Point 1: Not selected";
                this._point1StatusLabel.fontColour = this.COLORS.MUTED_TEXT;
            }
        }

        if (this._point2StatusLabel) {
            if (point2) {
                this._point2StatusLabel.text = `Point 2: (${point2.latitude.toFixed(4)}, ${point2.longitude.toFixed(4)})`;
                this._point2StatusLabel.fontColour = this.COLORS.SUCCESS;
            } else {
                this._point2StatusLabel.text = "Point 2: Not selected";
                this._point2StatusLabel.fontColour = this.COLORS.MUTED_TEXT;
            }
        }
    }

    // Update distance filter state (comprehensive update)
    public updateDistanceFilterState(
        enabled: boolean,
        point1: { latitude: number; longitude: number } | null,
        point2: { latitude: number; longitude: number } | null,
        maxDistance: number
    ): void {
        this.updateDistanceFilterEnabled(enabled);
        this.updateSelectionPoints(point1, point2);
        this.updateMaxDistance(maxDistance);
    }

    // Get the main container
    public get container(): SKContainer {
        return this._container;
    }

    // Getters for widgets (used by controller for event handling)
    public get costRangeSlider(): RangeSlider | null {
        return this._costRangeSlider;
    }

    public get ratingRangeSlider(): RangeSlider | null {
        return this._ratingRangeSlider;
    }

    public get typeRadioButtons(): Map<string, RadioButton> {
        return this._typeRadioButtons;
    }

    public get typeRadioGroup(): RadioButtonGroup | null {
        return this._typeRadioGroup;
    }

    public get featureCheckboxes(): Map<string, CheckBox> {
        return this._featureCheckboxes;
    }

    public get distanceFilterCheckbox(): CheckBox | null {
        return this._distanceFilterCheckbox;
    }

    public get maxDistanceSlider(): Slider | null {
        return this._maxDistanceSlider;
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
    // Calculated to ensure all elements fit within container (responsive and intuitive layout)
    private getMapLayout(): { x: number; y: number; width: number; height: number } {
        const mapX = this.MARGIN;
        const mapY = this.MARGIN + this.HEADER_HEIGHT + this.SECTION_SPACING;
        // Map height matches details container height for visual balance
        const mapHeight = 439; // Same height as details container
        // Calculate proportional width: original ratio was 500/270 = 1.85185
        // New width = 439 * (500/270) = 813px (maintains aspect ratio)
        const mapWidth = Math.round(439 * (500 / 270)); // Proportionally scaled width
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
            mapTitle.fill = "";  // No background fill
            mapTitle.fontColour = this.COLORS.PRIMARY_TEXT;
            this._container.addChild(mapTitle);
            
            // Add instruction text below map title (will be updated based on filter state)
            this._mapInstructionLabel = new SKLabel({
                text: "Hover over markers to see details • Click to select",
                x: mapLayout.x,
                y: mapLayout.y - 2,
                width: mapLayout.width,
                height: 14
            });
            this._mapInstructionLabel.font = this.FONTS.SMALL;
            this._mapInstructionLabel.fill = "";  // No background fill
            this._mapInstructionLabel.fontColour = this.COLORS.MUTED_TEXT;
            this._container.addChild(this._mapInstructionLabel);
        }
    }

    // Get map widget (for event handling)
    public get mapWidget(): MapWidget | null {
        return this._mapWidget;
    }

    // Ensure right-side container exists (creates it if needed)
    private ensureRightSideContainer(): void {
        if (this._rightSideContainer) return;  // Already exists
        
        // Create details container first if it doesn't exist
        if (!this._detailsContainer) {
            const mapLayout = this.getMapLayout();
            const detailsX = mapLayout.x + mapLayout.width + this.SECTION_SPACING;
            const detailsY = mapLayout.y;
            
            this._detailsContainer = new SKContainer({
                x: detailsX,
                y: detailsY,
                width: this.DETAILS_PANEL_WIDTH,
                height: 439,
                fill: this.COLORS.DETAILS_BG,
                border: this.COLORS.PRIMARY_BORDER
            });
            this._container.addChild(this._detailsContainer);
            
            // Add details panel title
            const detailsTitle = new SKLabel({
                text: "Restaurant Details",
                x: detailsX,
                y: detailsY - 18,
                width: this.DETAILS_PANEL_WIDTH,
                height: 16
            });
            detailsTitle.font = this.FONTS.SECTION_TITLE;
            detailsTitle.fill = "";
            detailsTitle.fontColour = this.COLORS.PRIMARY_TEXT;
            this._container.addChild(detailsTitle);
        }
        
        // Now create right-side container
        const mapLayout = this.getMapLayout();
        const detailsX = mapLayout.x + mapLayout.width + this.SECTION_SPACING;
        const detailsY = mapLayout.y;
        const rightSideX = detailsX + this.DETAILS_PANEL_WIDTH + this.SECTION_SPACING;
        const rightSideY = detailsY;
        const rightSideWidth = 250;
        
        // Calculate right-side container height to align bottom with filter container bottom
        // Filter container: y = mapLayout.y + mapLayout.height + SECTION_SPACING, height = 145
        // Filter container bottom = mapLayout.y + mapLayout.height + SECTION_SPACING + 145
        // Right-side container top = mapLayout.y
        // Right-side container height = (filter container bottom) - (right-side container top)
        const filterY = mapLayout.y + mapLayout.height + this.SECTION_SPACING;
        const filterContainerBottom = filterY + 145; // Filter container height is 145
        const rightSideHeight = filterContainerBottom - rightSideY;
        
        this._rightSideContainer = new SKContainer({
            x: rightSideX,
            y: rightSideY,
            width: rightSideWidth,
            height: rightSideHeight,
            fill: this.COLORS.PANEL_BG,
            border: this.COLORS.SECONDARY_BORDER
        });
        this._container.addChild(this._rightSideContainer);
        
        // Filters title - positioned at top of right-side container, centered
        const filtersTitleWidth = 200;
        const filtersTitle = new SKLabel({
            text: "Filters",
            x: rightSideX + (rightSideWidth / 2) - (filtersTitleWidth / 2),  // Centered horizontally
            y: rightSideY - 18,  // Positioned just above the right-side container
            width: filtersTitleWidth,
            height: 16
        });
        filtersTitle.font = this.FONTS.SECTION_TITLE;
        filtersTitle.fill = "";  // No background fill
        filtersTitle.fontColour = this.COLORS.PRIMARY_TEXT;
        this._container.addChild(filtersTitle);
        
        // Restaurant Type Filter Section - Moved to right-side container
        const typeTitle = new SKLabel({
            text: "Restaurant Type:",
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING,
            width: 200,
            height: 20
        });
        typeTitle.font = this.FONTS.FILTER_TITLE;
        typeTitle.fill = "";
        typeTitle.fontColour = this.COLORS.PRIMARY_TEXT;
        this._rightSideContainer.addChild(typeTitle);

        // Restaurant Type Radio Buttons - Interactive widget for selecting type
        // Radio buttons will be created dynamically based on available types
        // Create a group for exclusivity
        this._typeRadioGroup = new RadioButtonGroup();
        
        // "All Types" radio button (null selection)
        const allTypesRadio = new RadioButton({
            selected: true,  // Default selection
            x: this.FILTER_PANEL_PADDING,
            y: this.FILTER_PANEL_PADDING + 25,
            width: 20,
            height: 20
        });
        // Event listener will be set up in controller using global event listener
        this._typeRadioGroup.addRadioButton(allTypesRadio);
        this._rightSideContainer.addChild(allTypesRadio);
        
        // "All Types" label
        const allTypesLabel = new SKLabel({
            text: "All Types",
            x: this.FILTER_PANEL_PADDING + 25,
            y: this.FILTER_PANEL_PADDING + 25,
            width: 200,
            height: 20
        });
        allTypesLabel.font = this.FONTS.BODY;
        allTypesLabel.fill = "";
        allTypesLabel.fontColour = this.COLORS.SECONDARY_TEXT;
        this._rightSideContainer.addChild(allTypesLabel);
    }

    // Update restaurant details display
    // Applies CRAP design principles: Contrast, Repetition, Alignment, Proximity
    public updateRestaurantDetails(restaurant: Restaurant | null): void {
        console.log("updateRestaurantDetails called with:", restaurant ? restaurant.name : "null");
        // Remove existing details labels
        if (this._detailsContainer) {
            console.log(`Removing ${this._detailsLabels.length} existing labels`);
            this._detailsLabels.forEach(label => {
                this._detailsContainer!.removeChild(label);
            });
            this._detailsLabels = [];
        } else {
            // Ensure containers exist (creates them if needed)
            this.ensureRightSideContainer();
        }

        if (!restaurant) {
            console.log("updateRestaurantDetails: restaurant is null, showing placeholder");
            // Ensure containers exist
            this.ensureRightSideContainer();
            if (!this._detailsContainer) return;
            
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
            placeholder.fill = "";  // No background fill
            placeholder.fontColour = this.COLORS.MUTED_TEXT; // Consistent muted color
            this._detailsContainer.addChild(placeholder);
            this._detailsLabels.push(placeholder);
            return;
        }
        
        // Ensure containers exist
        this.ensureRightSideContainer();
        if (!this._detailsContainer) return;
        
        console.log("updateRestaurantDetails: Creating labels for restaurant:", restaurant.name);

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
        nameLabel.fill = "";  // No background fill
        nameLabel.fontColour = this.COLORS.PRIMARY_TEXT; // Strong contrast for heading
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
        typeLabel.fill = "";  // No background fill
        typeLabel.fontColour = this.COLORS.SECONDARY_TEXT;
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
        costLabel.fill = "";  // No background fill
        costLabel.fontColour = this.COLORS.SECONDARY_TEXT;
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
        ratingLabel.fill = "";  // No background fill
        ratingLabel.fontColour = this.COLORS.SECONDARY_TEXT;
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
        featuresTitle.fill = "";  // No background fill
        featuresTitle.fontColour = this.COLORS.PRIMARY_TEXT; // Bold for section heading (Contrast)
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
        parkingLabel.fill = "";  // No background fill
        parkingLabel.fontColour = hasParking ? this.COLORS.SUCCESS : this.COLORS.MUTED_TEXT; // Color coding (Contrast)
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
        petsLabel.fill = "";  // No background fill
        petsLabel.fontColour = hasPets ? this.COLORS.SUCCESS : this.COLORS.MUTED_TEXT; // Color coding (Contrast)
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
            additionalLabel.fill = "";  // No background fill
            additionalLabel.fontColour = this.COLORS.SUCCESS; // Green for available features (Contrast)
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
        addressTitle.fill = "";  // No background fill
        addressTitle.fontColour = this.COLORS.PRIMARY_TEXT;
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
        addressLabel.fill = "";  // No background fill
        addressLabel.fontColour = this.COLORS.SECONDARY_TEXT;
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
            descTitle.fill = "";  // No background fill
            descTitle.fontColour = this.COLORS.PRIMARY_TEXT;
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
            descLabel.fill = "";  // No background fill
            descLabel.fontColour = this.COLORS.SECONDARY_TEXT;
            this._detailsContainer.addChild(descLabel);
            this._detailsLabels.push(descLabel);
            yOffset += lineHeight * 3;
        }
        
        // Update container height if content extends beyond current height
        // Add padding at bottom to ensure all content fits
        const requiredHeight = yOffset + this.DETAILS_PANEL_PADDING;
        if (this._detailsContainer) {
            const currentHeight = this._detailsContainer.height || 0;
            if (requiredHeight > currentHeight) {
                this._detailsContainer.height = requiredHeight;
                
                // Also update main container height if details container extends beyond it
                const detailsContainerBottom = this._detailsContainer.y + requiredHeight;
                const containerBottom = this._container.height || 600;
                if (detailsContainerBottom > containerBottom) {
                    // Add some padding at the bottom
                    this._container.height = detailsContainerBottom + this.MARGIN;
                }
            }
        }
    }
}
/**
 * Main entry point for the 
 * Restaurant Finder application.
 */

import {
  startSimpleKit,
  setSKRoot,
} from "./simplekit/src/imperative-mode";

import {
  RestaurantFinderController,
  RestaurantFinderModel,
  RestaurantFinderView,
} from "./RestaurantFinder";

import restaurantData from "./fredericton_restaurants.json";

// Initialize the RestaurantFinder application with error handling
try {
    console.log("Initializing RestaurantFinder application...");
    
    const model = new RestaurantFinderModel();
    const view = new RestaurantFinderView();
    const controller = new RestaurantFinderController(model, view);
    
    console.log("Loading restaurant data...");
    // Load restaurant data into the model
    model.loadRestaurants(restaurantData);
    
    console.log("Initializing controller...");
    // Initialize the controller (sets up widgets, filters, and displays)
    controller.initialize();
    
    console.log("Setting SimpleKit root...");
    // Set the SimpleKit root container to the view's container
    setSKRoot(view.container);
    
    console.log("Starting SimpleKit...");
    // Start the SimpleKit application
    startSimpleKit();
    
    console.log("Application started successfully!");
} catch (error) {
    console.error("Error initializing application:", error);
    // Display error on page
    document.body.innerHTML = `
        <div style="padding: 20px; font-family: Arial;">
            <h1>Error Loading Application</h1>
            <p>There was an error initializing the RestaurantFinder application.</p>
            <p><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
            <p>Please check the browser console for more details.</p>
        </div>
    `;
}
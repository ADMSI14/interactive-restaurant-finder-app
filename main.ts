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

// Initialize the RestaurantFinder application
const model = new RestaurantFinderModel();
const view = new RestaurantFinderView();
const controller = new RestaurantFinderController(model, view);

// Load restaurant data into the model
model.loadRestaurants(restaurantData);

// Initialize the controller (sets up widgets, filters, and displays)
controller.initialize();

// Set the SimpleKit root container to the view's container
setSKRoot(view.container);

// Start the SimpleKit application
startSimpleKit();
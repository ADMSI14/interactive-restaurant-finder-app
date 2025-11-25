/**
 * Main entry point for the 
 * Restaurant Finder application.
 */

import {
  startSimpleKit,
  setSKRoot,
  SKContainer,
  SKLabel,
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

// See the examples for ideas on how to set up your application
// You should follow the file layout provided
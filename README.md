## GoogleMapsCustomMarker
An extension to the default Mendix Maps widget for showing point locations on a Google Map. It offers heaps of extra features like dropping/dragging, geocoding, marker clustering and determining current location. See all features in action here:

https://googlemapscustomma.mxapps.io/index.html?profile=Responsive

This widget is a rewrite of the original GoogleMapsCustomMarker widget, originally based on the Dojo framework, see https://marketplace.mendix.com/link/component/43162

This widget uses React / TypeScript and the new pluggable widgets API. Additional features:

* Determine current location
* Support for all datasources, even nanoflows;
* Support for all types of on click behavior when clicking on a Marker;
* Editability based on Mendix Studio Pro, respecting entity access rights;


## Features
* Drawing and dragging marker. In the process the location is reverse geocoded and all possible addresses retrieved.
* Multiple symbols (cross, diamond, circle, triangle, star) supported next to default Google Maps marker 
* Polyline between all marker locations, with or without markers
* Extra Legend with custom symbols / images by enumeration
* Marker clustering when zooming out
* Search box for easy navigation to known address
* Determining current location;

## Usage
* API Key: 
	* Production: If you want to use the widget in Production a valid Google Maps API key needs to be entered in every widget instance. 
	* Development: Developing can be done without an API key, but will show messages on top of the Google Map, making it unusable in Production.

* Add the Google Maps Custom Marker widget to your page, see screenshots for Settings in Studio Pro.

* At least configure:
	* Data source: the Mendix objects containing the Location data
	* For Position: Latitude / Longitude attributes: required format: Decimal
	* For Editing of Position: Lat Attribute (for updates) / Lng Attribute (for updates)
	* For Reverse geocoding (retrieving addresses when dragging marker): Formatted Address 
	* Appearance: Enum attribute / Color + Symbol + Size attribute: 
		* If Enum attribute is selected, configure 'Enum based marker images' as well. The can be free format; doesn't need predefined values. The enumeration key used in the attribute does have to agree with the 'Enum key' of the configured 'Enum based marker images'.
		* If no Enum attribute selected then configure at least Color and Symbol attribute and optional the Size attribute. 
			* Symbol attribute; please use an enumeration attribute with possible keys: 'MARKER','CIRCLE','DIAMOND','TRIANGLE','STAR','CROSS'.
			* Size attribute; please use an enumeration attribute with possible keys: 'XXS','XS','S','M','L'

* All other features 
	1. Legend (based on enumeration or symbols)
	2. Interaction via on click infowindow or directly on click
	3. Marker Clustering
	4. SearchBox
	5. Lines (Dotted/Dashed/with/without Markers)
	6. Location based on current location
	
	should be self explanatory. A print screen for settings per feature is added in the Mendix Marketplace.

## Demo project
https://googlemapscustomma.mxapps.io/index.html?profile=Responsive

## Issues, suggestions and feature requests
This version uses the React Google Maps API library for creating React elements, without hooks for now. Currently there is a shortcoming in the Mendix Pluggable widgets API, not being able to directly change an attribute loaded by data source, hence the latitude and longitude attributes have to be selected twice in the widget settings, if updates on latitude/longitude need to be automated by the widget via dragging.

## Development and contribution
Thanks to the team maintaining the React Google Maps API library, see https://www.npmjs.com/package/@react-google-maps/api

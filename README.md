## GoogleMapsCustomMarker
An extension to the default Mendix Maps widget for showing point locations on a Google Map. It offers heaps of extra features like dropping/dragging, geocoding, marker clustering and determining current location. See all features in action here:

https://googlemapscustommarker-sandbox.mxapps.io/index.html?profile=Responsive

This widget uses React / TypeScript and the pluggable widgets API. Additional features:

## Features
DRAWING
* Drawing and dragging marker. In the process the location is reverse geocoded and all possible addresses retrieved.
* Undo/redo up to 50 steps for changing marker location

STYLING
* Multiple symbols (cross, diamond, circle, triangle, star) supported next to default Google Maps marker 
* Infowindow popup can be configured as a Mendix dataview hence fully styled to users liking

CUSTOMIZATION
* API Key can be loaded over datasource so different API per environment can be achieved
* Polyline between all marker locations, with or without markers
* Extra Legend with custom symbols / images by enumeration
* Marker clustering when zooming out
* For marker clustering, when markers overlap and clicked on, markers are spread in a spiderweb to being able to see and click them individually
* Recenter button which appears when map is dragged from initial location
* Search box for easy navigation to known address
* Determining current location;

## Usage
* API Key: 
	* Production: If you want to use the widget in Production a valid Google Maps API key needs to be entered in every widget instance. 
	* Development: Developing can be done without an API key, but will show messages on top of the Google Map, making it unusable in Production.

* Add the Google Maps Custom Marker widget to your page, see screenshots for Settings in Studio Pro.

* At least configure:
	* API Key: Feed the widget with a datasource that fetches the API Key. Easiest config is creating a non persistent entity 'Authorization' with 1 attribute 'API Key'. Create that in the data source MF, set the attribute with the constant value of the API key, add the newly created API Key object to a list (because widget always needs a list as datasource sadly..).		
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
	7. Customizable Info Window (Mendix Data View)
	
	should be self explanatory. A print screen for settings per feature is added in the Mendix Marketplace.

## Demo project
https://googlemapscustommarker-sandbox.mxapps.io/index.html?profile=Responsive

## Issues, suggestions and feature requests
This version uses the vis.gl/react-google-maps library for creating React elements. Currently there is a shortcoming in the Mendix Pluggable widgets API, not being able to directly change an attribute loaded by data source, hence the latitude and longitude attributes have to be selected twice in the widget settings, if updates on latitude/longitude need to be automated by the widget via dragging.

If you are in single object edit mode (so drawing enabled) and you would like changes to for instance color, opacity and stroke weight, to be directly reflecting in the drawn polygon/polyline, an infowindow dataview NEEDS to be placed inside the widget. This will make sure Mendix pushes direct updates to the map.

## Development and contribution
Thanks to the teams behind the React Google Maps vis-gl and Terra Draw libraries.

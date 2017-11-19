var map;
var markers = [];
var locations = [
	{name: 'Imperial Palace', location: {lat: 35.684789, lng: 139.752789}, visible: true},
	{name: 'Akihabara', location: {lat: 35.698350, lng: 139.773055}, visible: true},
	{name: 'Ueno Onshi Park', location: {lat: 35.714078, lng: 139.774075}, visible: true},
	{name: 'Sunshine City Aquarium', location: {lat: 35.728991, lng: 139.719787}, visible: true},
	{name: 'Takashimaya Shinjuku', location: {lat: 35.687588, lng: 139.702272}, visible: true},
	{name: 'Yoyogi Park', location: {lat: 35.671740, lng: 139.694939}, visible: true},
	{name: 'Shibuya Scramble', location: {lat: 35.659453, lng: 139.700437}, visible: true},
	{name: 'Tokyo Tower', location: {lat: 35.658582, lng: 139.745429}, visible: true},
	{name: 'Senso-ji', location: {lat: 35.714767, lng: 139.796653}, visible: true},
	{name: 'Tokyo Skytree', location: {lat: 35.710063, lng: 139.810697}, visible: true}
]

/*
function Location(name, lat, lng) {
	this.name = name;
	this.lat = lat;
	this.lng = lng;
}
*/

function NeighborhoodMap() {
	var self = this;
	self.searchString = ko.observable("");
	/*
	self.presetLocations = ko.computed(function() {
		var result = [];
		presetLocations.forEach(function(location) {
			result.push(location);
		});
		return result;
	});
	*/
	self.locations = ko.computed(function() {
		var result = [];
		locations.forEach(function(location) {
			if (location.name.toLowerCase().includes(self.searchString().toLowerCase())) {
				location.visible = true;
				result.push(location);
			} else {
				location.visible = false;
			}
		});
		showMarkers(locations);
		return result;
	});
}

var NM = new NeighborhoodMap();
ko.applyBindings(NM);

function initMap() {
	var tokyo = locations[0].location;
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: tokyo
	});

	locations.forEach(function(location) {
		var marker = new google.maps.Marker({
			position: location.location,
			title: location.name,
		});
		markers.push(marker)
	});

	showMarkers(locations);
}

function showMarkers() {
	markers.forEach(function(marker) {
		if (locations.find(x => x.name == marker.title).visible) {
			marker.setMap(map);
		} else {
			marker.setMap(null);
		}
	});
}
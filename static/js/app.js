// Initialize the global variables needed throughout the application
var map;
var markers = [];
var presetLocations = [
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
var CLIENT_ID='UGIXXZODUTYNTERNBXEQ3YG0WDU2GXYWHNP1OVSQWUCE0AJG'
var CLIENT_SECRET='5FZ2BI1N312UTLYZ0A2LCUPGW05OY31PWEB0WHXVLHQXZOGO'

// A model to store the information of each location
function Location(location) {
	var self = this;

	self.name = location.name;
	self.location = location.location;
	self.visible = location.visible;
	self.venues = ko.observable('<div class=\"info-windows\">Now Loading...</div>');

	// Update the venues information with the Foursquare API
	self.updateVenues = function(marker) {
		self.venues(getVenues(marker.position));
		marker.infowindow.setContent(self.venues());
	}
}

// A view model to handle the locations shown on the map and filter them 
// with the result from the search bar input
function NeighborhoodMap() {
	var self = this;

	self.searchString = ko.observable('');
	self.locations = ko.observableArray([]);

	presetLocations.forEach(function(location) {
		self.locations.push(new Location(location));
	});

	self.searchResults = ko.computed(function() {
		var result = [];
		self.locations().forEach(function(location) {
			if (location.name.toLowerCase().includes(self.searchString().toLowerCase())) {
				location.visible = true;
				result.push(location);
			} else {
				location.visible = false;
			}
		});
		showMarkers(self.locations());
		return result;
	});

	self.bounceIt =  function(location) {
		var marker = markers.find(x => x.title == location.name);
		bounceMarker(marker);
	};
}

// Initialize Knockout
var NM = new NeighborhoodMap();
ko.applyBindings(NM);

// Initialize the map at a given location and create the markers for each location.
function initMap() {
	var tokyo = presetLocations[0].location;
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: tokyo
	});

	presetLocations.forEach(function(location) {
		var marker = new google.maps.Marker({
			position: location.location,
			title: location.name,
			animation: google.maps.Animation.DROP
		});
		markers.push(marker)
	});

	showMarkers(presetLocations);
	addInfoWindow();
}

// Initialize the infowindow DOM for each of the markers
function addInfoWindow() {
	markers.forEach(function(marker) {
		var location = NM.locations().find(x => x.name == marker.title);
		marker.infowindow = new google.maps.InfoWindow({
			content: location.venues()
		});

		marker.infowindow.addListener('closeclick', function() {
			marker.setAnimation(null);
		});

		marker.addListener('click', function() {
			bounceMarker(marker);
		});
	})
}

// Show the markers on the map
function showMarkers(loc) {
	markers.forEach(function(marker) {
		if (loc.find(x => x.name == marker.title).visible) {
			marker.setMap(map);
		} else {
			marker.setMap(null);
		}
	});
}

// Animate a marker when it is clicked and open the infowindow of it
// trying to update the contents with the Foursquare API
function bounceMarker(marker) {
	var location = NM.locations().find(x => x.name == marker.title);
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
		marker.infowindow.close();
	} else {
		location.updateVenues(marker);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		marker.infowindow.open(map, marker);
	}
}

// Use the output received from the API call to Foursquare and format it
// to be used in an HTML DOM element.
function formatVenuesInfo(data) {
	var venue = data.response.groups[0].items[0];
	var name = venue.venue.name;
	var category = venue.venue.categories[0].name;
	var size = '100x100';
	var prefix = venue.venue.photos.groups[0].items[0].prefix;
	var suffix = venue.venue.photos.groups[0].items[0].suffix;
	var photoURL = prefix + size + suffix;
	var hours = venue.venue.hours.status;
	if (typeof hours == 'undefined') {
		hours = '';
	}
	var closed = venue.venue.hours.isOpen;
	var address = venue.venue.location.address;
	var crossStreet = venue.venue.location.crossStreet;
	if (typeof crossStreet == 'undefined') {
		crossStreet = '';
	}
	var location = address + crossStreet;
	
	var output = '<div class="info-windows">' +
	'<h1>' + name + '</h1>' +
	'<h2>' + category + '</h2>' +	
	'<p>' + hours + '</p>' +
	'<p>' + location + '</p>' +
	'<img src="' + photoURL + '">' +
	'</div>';
	return output;
}

// An AJAX call to the Foursquare API to get the first top pick venue information
// for a given location
function getVenues(location) {
	var info = "";
	$.ajax({
	 	async: false,
		type: 'GET',
		url: 'https://api.foursquare.com/v2/venues/explore',
		dataType: 'json',
		data: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			v: '20170801',
			ll: location.lat() + ', ' + location.lng(),
			section: 'topPicks',
			venuePhotos: 1,
			limit: 1
		},
		success: function(data) {
			info = formatVenuesInfo(data);
		},
		error: function(xhr, status, error) {
			console.log('XHR: ');
			console.log(xhr);
			console.log('Status: ');
			console.log(status);
			console.log('Error: ');
			console.log(error);
			alert('An error has occured, please check the browser console (F12)');
			info = '<div class=\"info-windows\">Couldn\'t load the information</div>';
		}
	});
	 return info;
}
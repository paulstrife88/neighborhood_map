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


function Location(location) {
	var self = this;

	self.name = location.name;
	self.location = location.location;
	self.visible = location.visible;
	self.venues = "Now Loading...";

	self.showLocationDetails = ko.observable(false);

	self.toggleDetails = function() {
		if (self.showLocationDetails()) {
			self.showLocationDetails(false);
		} else {
			self.showLocationDetails(true);
		}
	}
}


function NeighborhoodMap() {
	var self = this;
	self.searchString = ko.observable("");
	/*
	self.locations = ko.computed(function() {
		var locations = [];
		presetLocations.forEach(function(location) {
			var loc = new Location(location);
			locations.push(loc);
		});
		return locations;
	});
	*/
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
		self.locations()[0].venues = "ciao";
		console.log(location);
		location.toggleDetails();
	};

	self.venues = ko.computed(function() {
		console.log(self);
	});
}

var NM = new NeighborhoodMap();
ko.applyBindings(NM);

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
		hours = "";
	}
	var closed = venue.venue.hours.isOpen;
	var address = venue.venue.location.address;
	var crossStreet = venue.venue.location.crossStreet;
	if (typeof crossStreet == 'undefined') {
		crossStreet = "";
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

function addInfoWindow() {
	markers.forEach(function(marker) {
		var location = NM.locations().find(x => x.name == marker.title);
		console.log(location);
		var infowindow = new google.maps.InfoWindow({
			// content: getVenues(marker.position)
			content: location.venues
		});

		infowindow.addListener('closeclick', function() {
			marker.setAnimation(null);
		});

		marker.addListener('click', function() {
			populateInfoWindow(marker, infowindow);
			bounceMarker(marker);
		});
	})
}

function populateInfoWindow(marker, infowindow) {
	infowindow.open(map, marker);
}

function showMarkers(loc) {
	markers.forEach(function(marker) {
		if (loc.find(x => x.name == marker.title).visible) {
			marker.setMap(map);
		} else {
			marker.setMap(null);
		}
	});
}

function bounceMarker(marker) {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

function getVenues(location) {
	console.log('called');
	console.log(location);
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
			ll: location.lat + ', ' + location.lng,
			section: 'topPicks',
			venuePhotos: 1,
			limit: 1
		},
		success: function(data) {
			info = formatVenuesInfo(data);
		}
	});
	 return info;
}
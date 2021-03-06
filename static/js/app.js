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
];
var CLIENT_ID='UGIXXZODUTYNTERNBXEQ3YG0WDU2GXYWHNP1OVSQWUCE0AJG';
var CLIENT_SECRET='5FZ2BI1N312UTLYZ0A2LCUPGW05OY31PWEB0WHXVLHQXZOGO';

// A model to store the information of each location
function Location(location) {
	var self = this;

	self.name = location.name;
	self.location = location.location;
	self.visible = location.visible;
	self.venues = ko.observable('<div class=\"info-windows\">Now Loading...</div>');

	// Update the venues information with the Foursquare API
	self.updateVenues = function(marker) {
		getVenues(self, marker);
	};
}

// A view model to handle the locations shown on the map and filter them 
// with the result from the search bar input
function NeighborhoodMap() {
	var self = this;

	self.displaySidebar = ko.observable(false);
	
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

	self.toggleSidebar = function() {
		self.displaySidebar(!self.displaySidebar());
	};
}

// Show/Hide the left sidebar when the top-left icon is clicked.
// Also modify the css style to handle mobile users.
ko.bindingHandlers.fadeSidebar = {
    init: function(element, valueAccessor) {
		var value = valueAccessor();
		$(element).toggle(ko.unwrap(value));
	},
	update: function(element, valueAccessor) {
		var media = window.matchMedia("(min-width: 501px)");
		var value = valueAccessor();
		var elements = document.getElementsByClassName("hide");
		if (ko.unwrap(value)) {
			for (var item of elements) {
				item.style.display = "flex";
			}
			$(element).fadeIn();
			if  (media.matches) {
				document.getElementById("map").style.width = "75%";
			} else {
				document.getElementById("map").style.width = "45%";
			}
		} else {
			$(element).fadeOut();
			document.getElementById("map").style.width = "100%";
		}
	}
};
 

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
			animation: google.maps.Animation.DROP,
			map: map
		});
		markers.push(marker);
	});

	showMarkers(presetLocations);
	addInfoWindow();
}

// Callback function in case Google Maps fails to authenticate
function gm_authFailure() {
	alert('An authenication error has occured while trying to load the Google Maps API. ' +
		'Please check the browser\'s JavaScript Console (F12) for further information.');
}

// Callback function in case Google Maps fails to load
function mapErr() {
	alert('An error has occured while trying to load the Google Maps API. ' +
		'Please check the browser\'s JavaScript Console (F12) for further information.');
}

// Initialize the infowindow DOM for each of the markers
function addInfoWindow(infowindow) {
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
	});
}

// Show the markers on the map
function showMarkers(loc) {
	markers.forEach(function(marker) {
		if (loc.find(x => x.name == marker.title).visible) {
			marker.setVisible(true);
		} else {
			marker.setVisible(false);
		}
	});
}

// Animate a marker when it is clicked and open the infowindow of it
// trying to update the contents with the Foursquare API
function bounceMarker(markerToBounce) {
	var location = NM.locations().find(x => x.name == markerToBounce.title);
	markers.forEach(function(marker) {
		if (marker == markerToBounce && marker.getAnimation() === null) {
			location.updateVenues(marker);
			marker.setAnimation(google.maps.Animation.BOUNCE);
			marker.infowindow.open(map, marker);
		} else {
			marker.setAnimation(null);
			marker.infowindow.close();
		}
	});
}

// Use the output received from the API call to Foursquare and format it
// to be used in an HTML DOM element.
function formatVenuesInfo(data, location) {
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
	var fullAddress = address + crossStreet;
	
	var output = '<div class="info-windows">' +
	'<h1>' + name + '</h1>' +
	'<h2>' + category + '</h2>' +	
	'<p>' + hours + '</p>' +
	'<p>' + fullAddress + '</p>' +
	'<img src="' + photoURL + '">' +
	'</div>';
	location.venues(output);
	return output;
}

// An AJAX call to the Foursquare API to get the first top pick venue information
// for a given location
function getVenues(location, marker) {
	var info = '';
	$.ajax({
	 	//async: false,
		type: 'GET',
		url: 'https://api.foursquare.com/v2/venues/explore',
		dataType: 'json',
		data: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			v: '20170801',
			ll: location.location.lat + ', ' + location.location.lng,
			section: 'topPicks',
			venuePhotos: 1,
			limit: 1
		},
		success: function(data) {
			location.venues(formatVenuesInfo(data, location));
			marker.infowindow.setContent(location.venues());
		},
		error: function(xhr, status, error) {
			console.log('XHR: ');
			console.log(xhr.responseText);
			console.log('Status: ');
			console.log(status);
			console.log('Error: ');
			console.log(error);
			alert('An error has occured, please check the browser console (F12)');
			info = '<div class=\"info-windows\">Couldn\'t load the information</div>';
			marker.infowindow.setContent(info);
		}
	});
}
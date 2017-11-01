var map;
// Array of markers
var markers = [];

//List of locations
var locations = [{
        "title": "The Metropolitan Museum of Art",
        "location": {
            lat: 40.7794366,
            lng: -73.963244
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "Museum of Modern Art",
        "location": {
            lat: 40.7614327,
            lng: -73.9776216
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "Solomon R. Guggenheim Museum",
        "location": {
            lat: 40.7829796,
            lng: -73.9589706
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "American Museum of Natural History",
        "location": {
            lat: 40.7813241,
            lng: -73.9739882
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "Museum of the City of New York",
        "location": {
            lat: 40.792494,
            lng: -73.951909
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "New-York Historical Society",
        "location": {
            lat: 40.779351,
            lng: -73.974115
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "Intrepid Sea, Air & Space Museum",
        "location": {
            lat: 40.7645266,
            lng: -73.9996076
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "Museum of the Moving Image",
        "location": {
            lat: 40.7563454,
            lng: -73.9239496
        },
        isVisible: ko.observable(true)
    },
    {
        "title": "Whitney Museum of American Art",
        "location": {
            lat: 40.7395877,
            lng: -74.0088629
        },
        isVisible: ko.observable(true)
    }
];

//Map initialization
function initMap() {
    //Create a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7687768,
            lng: -73.996203
        },
        zoom: 13
    });

    var largeInfowindow = new google.maps.InfoWindow();

    var WikiData = function() {
        viewModel.getWikiData(this, largeInfowindow);
        this.setAnimation(google.maps.Animation.DROP);
    };

    for (var i = 0; i < locations.length; i++) {
        // get the position from the array
        var position = locations[i].location;
        var title = locations[i].title;
        //create a marker per location
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            icon: "images/marker0.png"
        });

        viewModel.cityLocations()[i].marker = marker;

        // push the marker to the markers array
        markers.push(marker);

        // create onclick event
        marker.addListener('click', WikiData);
        marker.addListener('mouseover', function() {
            this.setIcon("images/marker1.png");
        });
        marker.addListener('mouseout', function() {
            this.setIcon("images/marker0.png");
        });
    }
}

//Map onError handling method
function mapError() {
    alert('Sorry! Google Maps API is not working at the moment.');
}

var viewModel = {
    cityLocations: ko.observableArray(locations),
    locDisplay: ko.observable([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    locList: function(id) {
        if (viewModel.locDisplay().indexOf(id) > -1) {
            return true;
        } else {
            return false;
        }
    },
    listMatch: ko.observable(""),
    applyFilter: function() {
        filterLoc();
    },
    resetFilter: function() {
        resetMap();
    }
};

// http://knockoutjs.com/documentation/click-binding.html#note-1-passing-a-current-item-as-a-parameter-to-your-handler-function
viewModel.clickLoc = function(clickedLoc) {
    //console.log('click')
    console.log(clickedLoc); // use clickedLoc. marker to animate the marker and to open an info window
    google.maps.event.trigger(clickedLoc.marker, 'click');
};

function populateInfoWindow(marker, infowindow) {

    // check if the window is not already open
    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);

        infowindow.addListener('closeclick', function() {
            infowindow.setMarker(null);
        });
    }
}

function clickLoc(id) {
    populateInfoWindow(markers[id].infowindow);
    markers[id].setAnimation(google.maps.Animation.DROP);
}

viewModel.getWikiData = function(marker, infoWindow) {
    var query = marker.title,
        dt = 'jsonp',
        wikiBase = 'https://en.wikipedia.org/w/api.php',
        wikiUrl = wikiBase + '?action=opensearch&search=' + query + '&format=json&callback=wikiCallback';

    var wikiRequestTimeout = setTimeout(function() {
        alert('failed to get Wikipedia resources');
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: dt,
        success: function(response) {
            var articleName = response[1][0];
            var articleURL = response[3][0];
            var articleShortDescription = response[2][0];

            console.log(response);
            console.log(articleName);
            console.log(articleURL);

            var infoWindowContentString = '<h4>' + marker.title + '</h4>' +
                '<p>' + articleShortDescription + '</p>' +
                '<a href="' + articleURL + '">' + articleName + '</a>';

            infoWindow.setContent(infoWindowContentString);
            infoWindow.open(map, marker);
            clearTimeout(wikiRequestTimeout);

        },
        error: function() {
            alert("Wikipedia failed");
        }
    });
};

viewModel.filteredLocations = ko.computed(function() {

    var filterInput = viewModel.listMatch().toLowerCase();

    return ko.utils.arrayFilter(viewModel.cityLocations(), function(location) {
        var match = location.title.toLowerCase().indexOf(filterInput) !== -1;
        if (location.marker) {
            location.marker.setVisible(match);
        }
        return match;
    });


});

ko.applyBindings(viewModel);
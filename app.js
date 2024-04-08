// script.js
var startSelect = document.getElementById("startSelect");
var endSelect = document.getElementById("endSelect");
var navigateButton = document.getElementById("navigateButton");
var clearButton = document.getElementById("clearButton");
var nextButton = document.getElementById("nextButton");
var resultDiv = document.getElementById("result");
var pathDiv = document.getElementById("path");
var boundsDiv = document.getElementById("boundsInfo");

window.addEventListener("DOMContentLoaded", function() {
  boundsDiv = document.getElementById("boundsInfo");
});

// Disable next button
nextButton.disabled = true;

// Default options
var defaultStartOption = "Entrance";
var defaultEndOption = "HelpDesk";
var selectedfloor = "floorg";

//options
var floorg = [
    "Entrance", "HelpDesk","Referral desk","Registration desk","Admission desk","Corporate cell","ayushman bharat","arogya mitra","health check lounge",
    "1 orthopaedics speciality clinic","2 cenral sample collection area","4 orthopaedics opd","5 paediatric orthopaedics opd",
    "billing counter","Xray opd","pharmacy","satellite pharmacy","canteen","medical records department","atm","xerox","exit"
];

var floor1 = [
     "11 neurology opd","12 neurosurgery opd","14 urology and renal transplant opd","15 nephrology opd","16 respiratory medicine opd","cash counter 1",
];
var floor2 = [
    "medicine opd A","medicine opd B","21 dermatology opd","22 dermatology lab","23 dermatology laser centre","24 plastic surgery opd","25 ophthalmology opd","26 laser and diagnostics","27 audiology clinic","cash counter 2","satellite sample collection centre"   
];
var floor3 = [
    "surgery OPD","endocrinology OPD","cash counter 3","32 cardiothoracic and vascular surgery opd","33 psychiatry opd","34 cardiac non intervention lab","35 paediatric surgery opd","36 cardiology opd",
];
var floor4 = ["gastroenterology OPD","ENT surgery OPD","speech and hearing OPD","cash counter 4"];

//options
var opt = [
    "Entrance", "HelpDesk","Referral desk","Registration desk","Admission desk","Corporate cell","ayushman bharat","arogya mitra","health check lounge",
    "medicine opd A","medicine opd B","1 orthopaedics speciality clinic","2 cenral sample collection area","4 orthopaedics opd","5 paediatric orthopaedics opd",
    "11 neurology opd","12 neurosurgery opd","14 urology and renal transplant opd","15 nephrology opd","16 respiratory medicine opd","21 dermatology opd",
    "22 dermatology lab","23 dermatology laser centre","24 plastic surgery opd","25 ophthalmology opd","26 laser and diagnostics","27 audiology clinic",
    "32 cardiothoracic and vascular surgery opd","33 psychiatry opd","34 cardiac non intervention lab","35 paediatric surgery opd","36 cardiology opd",
    "gastroenterology OPD","ENT surgery OPD","speech and hearing OPD","surgery OPD","endocrinology OPD","billing counter","cash counter 1","cash counter 2",
    "cash counter 3","cash counter 4","satellite sample collection centre","Xray opd","pharmacy","satellite pharmacy","canteen","medical records department",
    "Medical Superintendent office","atm","xerox","exit"
];

// Add options for start select
var startOptions = opt;
for (var i = 0; i < startOptions.length; i++) {
  var option = new Option(startOptions[i], startOptions[i]);
  startSelect.add(option);
}

// Add options for end select
var endOptions = opt;
for (var i = 0; i < endOptions.length; i++) {
  var option = new Option(endOptions[i], endOptions[i]);
  endSelect.add(option);
}

// Set default options
startSelect.value = defaultStartOption;
endSelect.value = defaultEndOption;

// Create map
var map = L.map('map').setView([13.353736159016819, 74.79010484182015], 19);

// Adding tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 22
}).addTo(map);

L.control.zoom({ position: 'topright' }).addTo(map);

// Default overlay options
var defaultOverlayImage = "floorImageOverlay/floorg.png";
var defaultOverlayBounds = [
    [13.354337426125028, 74.78898385870616], // imageSW
    [13.353297748105362, 74.79047488608529] // imageNE
    ];

// Create the default image overlay
var defaultOverlay = createImageOverlay(defaultOverlayImage, defaultOverlayBounds);

// Display the default overlay on page load
map.addLayer(defaultOverlay);

// Variable to hold the image overlay
var imageOverlay = null;

var antpath = null;
var antpathway = null;

// Create markers for start, end, and current location
var startMarker = L.marker([0, 0], { icon: L.icon({ iconUrl: 'marker/green-marker.png', iconSize: [25, 41], iconAnchor: [12, 41] }) });
var endMarker = L.marker([0, 0], { icon: L.icon({ iconUrl: 'marker/red-marker.png', iconSize: [25, 41], iconAnchor: [12, 41] }) });
var currentMarker = null;

    // Function to create an image overlay
    function createImageOverlay(imageUrl, bounds) {
        var imageBounds = L.latLngBounds(bounds);
        var image = L.imageOverlay(imageUrl, imageBounds);
        return image;
    }

    // function to calculate image size and bounds
    function calculateImageBounds(imageCoordinate, displayWidth, imagePath) {
        // Calculate display height based on image aspect ratio
        var image = new Image();
        image.src = imagePath;

        var imageWidth = image.naturalWidth;
        var imageHeight = image.naturalHeight;

        var displayHeight = (displayWidth * imageHeight) / imageWidth;

        var imageSW = L.latLng(
            imageCoordinate[0] - displayHeight / 2,
            imageCoordinate[1] - displayWidth / 2
        );
        var imageNE = L.latLng(
            imageCoordinate[0] + displayHeight / 2,
            imageCoordinate[1] + displayWidth / 2
        );

        return L.latLngBounds(imageSW, imageNE);
    }

    // Function to update the current location marker
    function updateCurrentLocationMarker(lat, lng) {
        // Remove the existing current location marker
        if (currentMarker) {
        map.removeLayer(currentMarker);
        }
    
        // Create a new marker for the current location
        currentMarker = L.marker([lat, lng], { icon: L.icon({ iconUrl: 'marker/current-location.png', iconSize: [25, 41], iconAnchor: [12, 41] }) });
        currentMarker.addTo(map);
    }

    // Function to clear the markers
    function clearMarkers() {
        startMarker.setLatLng([0, 0]);
        endMarker.setLatLng([0, 0]);
    
        if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
        }
    }    

    // Function to display the image overlay
    function displayImageOverlay(imagePath, imageBounds) {
    // Remove previous image overlay if exists
    if (imageOverlay) {
        map.removeLayer(imageOverlay);
    }

    // Create image overlay
    imageOverlay = L.imageOverlay(imagePath, imageBounds).addTo(map);

    // Display image bounds on the webpage
    var boundsInfo =
        "Image Bounds: " +
        imageBounds.getSouthWest().toString() +
        " - " +
        imageBounds.getNorthEast().toString();
    boundsDiv.textContent = boundsInfo;
    }

    function fetchAndDisplayPath(filename) {
        function switchPosition(coordinate) {
        var temp = coordinate[0];
        coordinate[0] = coordinate[1];
        coordinate[1] = temp;
        return coordinate;
        }
    
        fetch(filename)
        .then(response => response.json())
        .then(data => {
                var testWay = data;
                for (var i = 0; i < testWay.features.length; i++) {
                var path = testWay.features[i].geometry.coordinates;
                var finalPath = path.map(switchPosition);
                console.log(finalPath);
                    
                // Remove existing AntPath if exists
                if (antpath) {
                    map.removeLayer(antpath);
                }

                // Create AntPath
                antpath = L.polyline(finalPath).addTo(map);
                map.fitBounds(antpath.getBounds());

                const movement = { use: L.polyline, delay: 600, dashArray: [10,20], weight: 5, color: "#0000FF", pulseColor: "#FFFFFF" };
                antpathway = L.polyline.antPath(finalPath,movement);
                antpathway.addTo(map);

                // Update start and end markers
                startMarker.setLatLng(finalPath[0]);
                endMarker.setLatLng(finalPath[finalPath.length - 1]);

                // Add start and end markers to the map
                startMarker.addTo(map);
                endMarker.addTo(map);

                console.log(antpath);
                console.log(antpathway);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, selectedEnd) {
        // Remove previous image overlay if exists
        if (defaultOverlay) {
            map.removeLayer(defaultOverlay);
          }
          if (imageOverlay) {
            map.removeLayer(imageOverlay);
          }
        
        // Create the selected overlay
        imageOverlay = createImageOverlay(selectedOverlayImage, selectedOverlayBounds);
      
        // Add the selected overlay to the map
        map.addLayer(imageOverlay);
      
        // Load and display GeoJSON file
        var filename = "path/" + selectedfloor + "/" + selectedStart.toLowerCase().replace(/\s/g, '') + "_" + selectedEnd.toLowerCase().replace(/\s/g, '') + ".geojson";
        console.log(filename);
      
        fetchAndDisplayPath(filename);
    }
      
    // Function to get the current location using the Geolocation API
    function getCurrentLocation() {
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            updateCurrentLocationMarker(lat, lng);
            },
            function (error) {
            console.log('Error getting current location:', error.message);
            }
        );
        } else {
        console.log('Geolocation is not supported by this browser.');
        }
    }
    
    // Update current location marker initially
    getCurrentLocation();
    
    // Update current location marker every 10 seconds
    setInterval(function () {
        getCurrentLocation();
    }, 2000);
    

    navigateButton.addEventListener("click", function() {
    
        var selectedStart = startSelect.value;
        var selectedEnd = endSelect.value;
        var result = "Selected options: " + selectedStart + " - " + selectedEnd;
        console.log(result);
        resultDiv.textContent = result;

        // Remove previous markers
        clearMarkers();

        // Remove previous image overlay if exists
        if (defaultOverlay) {
            map.removeLayer(defaultOverlay);
        }

        if (imageOverlay) {
            map.removeLayer(imageOverlay);
        }

        if (antpathway) {
            map.removeLayer(antpathway);
            antpathway = null;
        }

        // Load the image and determine its size
        var selectedOverlayImage = ""; // Variable to hold the selected overlay image URL
        var selectedOverlayBounds = [
            [13.354337426125028, 74.78898385870616], // imageSW
            [13.353297748105362, 74.79047488608529] // imageNE
            ]; // Variable to hold the selected overlay bounds

        // Set the overlay image and bounds based on selectedEnd
        if (floorg.includes(selectedStart)) {
            selectedfloor = "floorg";
            console.log("selected start value floorg");
            selectedOverlayImage = "floorImageOverlay/floorg.png";
            console.log(selectedOverlayImage)
            console.log(selectedOverlayBounds)

            if (floor1.includes(selectedEnd)) {
                console.log("selected end value floor1");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "liftg");
                nextButton.addEventListener("click", function() {     
                    map.removeLayer(antpathway);                   
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor1.png", selectedOverlayBounds, "floor1", "lift1", selectedEnd);
                });
            }
            else if (floor2.includes(selectedEnd)) {
                console.log("selected end value floor2");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "liftg");
                nextButton.addEventListener("click", function() { 
                    map.removeLayer(antpathway);  
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor2.png", selectedOverlayBounds, "floor2", "lift2", selectedEnd);
                });
            }
            else if (floor3.includes(selectedEnd)) {
                console.log("selected end value floor3");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "liftg");
                nextButton.addEventListener("click", function() {  
                    map.removeLayer(antpathway);                      
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor3.png", selectedOverlayBounds, "floor3", "lift3", selectedEnd);
                });
            }
            else if (floor4.includes(selectedEnd)) {
                console.log("selected end value floor4");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "liftg");
                nextButton.addEventListener("click", function() {  
                    map.removeLayer(antpathway);                      
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor4.png", selectedOverlayBounds, "floor4", "lift4", selectedEnd);
                });
            }else {
                console.log("selected end value floorg");
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, selectedEnd);
            }
        } else if (floor1.includes(selectedStart)) {
            selectedfloor = "floor1";
            console.log("selected start value floor1");
            selectedOverlayImage = "floorImageOverlay/floor1.png";
            console.log(selectedOverlayImage)
            console.log(selectedOverlayBounds)

            if (floor1.includes(selectedEnd)) {
                console.log("selected end value floor1");
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, selectedEnd);
            }
            else if (floor2.includes(selectedEnd)) {
                console.log("selected end value floor2");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift1");
                nextButton.addEventListener("click", function() { 
                    map.removeLayer(antpathway);                       
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor2.png", selectedOverlayBounds, "floor2", "lift2", selectedEnd);
                });
            }
            else if (floor3.includes(selectedEnd)) {
                console.log("selected end value floor3");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift1");
                nextButton.addEventListener("click", function() {  
                    map.removeLayer(antpathway);                      
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor3.png", selectedOverlayBounds, "floor3", "lift3", selectedEnd);
                });
            }
            else if (floor4.includes(selectedEnd)) {
                console.log("selected end value floor4");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift1");
                nextButton.addEventListener("click", function() { 
                    map.removeLayer(antpathway);                       
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor4.png", selectedOverlayBounds, "floor4", "lift4", selectedEnd);
                });
            }else {
                console.log("selected end value floorg");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift1");
                nextButton.addEventListener("click", function() { 
                    map.removeLayer(antpathway);                       
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floorg.png", selectedOverlayBounds, "floorg", "liftg", selectedEnd);
                });
            }
        } else if (floor2.includes(selectedStart)) {
                selectedfloor = "floor2";
                console.log("selected start value floor2");
                selectedOverlayImage = "floorImageOverlay/floor2.png";
                console.log(selectedOverlayImage)
                console.log(selectedOverlayBounds)

                if (floor1.includes(selectedEnd)) {
                    console.log("selected end value floor1");
                    nextButton.disabled = false;
                    createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift2");
                    nextButton.addEventListener("click", function() {  
                        map.removeLayer(antpathway);                      
                        console.log("next button clicked");                        
                        createOverlayAndFetchPath("floorImageOverlay/floor1.png", selectedOverlayBounds, "floor1", "lift1", selectedEnd);
                    });
                }
                else if (floor2.includes(selectedEnd)) {
                    console.log("selected end value floor2");
                    createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, selectedEnd);
                }
                else if (floor3.includes(selectedEnd)) {
                    console.log("selected end value floor3");
                    nextButton.disabled = false;
                    createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift2");
                    nextButton.addEventListener("click", function() {    
                        map.removeLayer(antpathway);                    
                        console.log("next button clicked");                        
                        createOverlayAndFetchPath("floorImageOverlay/floor3.png", selectedOverlayBounds, "floor3", "lift3", selectedEnd);
                    });
                }
                else if (floor4.includes(selectedEnd)) {
                    console.log("selected end value floor4");
                    nextButton.disabled = false;
                    createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift2");
                    nextButton.addEventListener("click", function() { 
                        map.removeLayer(antpathway);                       
                        console.log("next button clicked");                        
                        createOverlayAndFetchPath("floorImageOverlay/floor4.png", selectedOverlayBounds, "floor4", "lift4", selectedEnd);
                    });
                }else {
                    console.log("selected end value floorg");
                    nextButton.disabled = false;
                    createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift2");
                    nextButton.addEventListener("click", function() { 
                        map.removeLayer(antpathway);                       
                        console.log("next button clicked");                        
                        createOverlayAndFetchPath("floorImageOverlay/floorg.png", selectedOverlayBounds, "floorg", "liftg", selectedEnd);
                    });
                }
        } else if (floor3.includes(selectedStart)) {
            selectedfloor = "floor3";
            console.log("selected start value floor3");
            selectedOverlayImage = "floorImageOverlay/floor3.png";
            console.log(selectedOverlayImage)
            console.log(selectedOverlayBounds)

            if (floor1.includes(selectedEnd)) {
                console.log("selected end value floor1");
                    nextButton.disabled = false;
                    createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift3");
                    nextButton.addEventListener("click", function() { 
                        map.removeLayer(antpathway);                       
                        console.log("next button clicked");                        
                        createOverlayAndFetchPath("floorImageOverlay/floor1.png", selectedOverlayBounds, "floor1", "lift1", selectedEnd);
                    });
            }
            else if (floor2.includes(selectedEnd)) {
                console.log("selected end value floor2");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift3");
                nextButton.addEventListener("click", function() {   
                    map.removeLayer(antpathway);                     
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor2.png", selectedOverlayBounds, "floor2", "lift2", selectedEnd);
                });
            }
            else if (floor3.includes(selectedEnd)) {
                console.log("selected end value floor3");
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, selectedEnd);
            }
            else if (floor4.includes(selectedEnd)) {
                console.log("selected end value floor4");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift3");
                nextButton.addEventListener("click", function() {   
                    map.removeLayer(antpathway);                     
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor4.png", selectedOverlayBounds, "floor4", "lift4", selectedEnd);
                });
            }else {
                console.log("selected end value floorg");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift3");
                nextButton.addEventListener("click", function() {   
                    map.removeLayer(antpathway);                     
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floorg.png", selectedOverlayBounds, "floorg", "liftg", selectedEnd);
                });
            }
        }
        else {
            selectedfloor = "floor4";
            console.log("selected start value floor4");
            selectedOverlayImage = "floorImageOverlay/floor4.png";
            console.log(selectedOverlayImage)
            console.log(selectedOverlayBounds)

            if (floor1.includes(selectedEnd)) {
                console.log("selected end value floor1");
                    nextButton.disabled = false;
                    createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift4");
                    nextButton.addEventListener("click", function() {  
                        map.removeLayer(antpathway);                      
                        console.log("next button clicked");                        
                        createOverlayAndFetchPath("floorImageOverlay/floor1.png", selectedOverlayBounds, "floor1", "lift1", selectedEnd);
                    });
            }
            else if (floor2.includes(selectedEnd)) {
                console.log("selected end value floor2");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift4");
                nextButton.addEventListener("click", function() { 
                    map.removeLayer(antpathway);                       
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor2.png", selectedOverlayBounds, "floor2", "lift2", selectedEnd);
                });
            }
            else if (floor3.includes(selectedEnd)) {
                console.log("selected end value floor3");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift4");
                nextButton.addEventListener("click", function() {     
                    map.removeLayer(antpathway);                   
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floor3.png", selectedOverlayBounds, "floor3", "lift3", selectedEnd);
                });
            }
            else if (floor4.includes(selectedEnd)) {
                console.log("selected end value floor4");
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, selectedEnd);
            }else {
                console.log("selected end value floorg");
                nextButton.disabled = false;
                createOverlayAndFetchPath(selectedOverlayImage, selectedOverlayBounds, selectedfloor, selectedStart, "lift4");
                nextButton.addEventListener("click", function() {   
                    map.removeLayer(antpathway);                     
                    console.log("next button clicked");                        
                    createOverlayAndFetchPath("floorImageOverlay/floorg.png", selectedOverlayBounds, "floorg", "liftg", selectedEnd);
                });
            }
        }
    });


    clearButton.addEventListener("click", function () {
        // Clear the selected options and result
        startSelect.value = defaultStartOption;
        endSelect.value = defaultEndOption;
        resultDiv.textContent = "";
      
        // Remove markers and path
        clearMarkers();
        if (antpath) {
          map.removeLayer(antpath);
          antpath = null;
        }

        if (antpathway) {
          map.removeLayer(antpathway);
          antpathway = null;
        }
      
        // Reset the map view
        map.setView([13.353736159016819, 74.79010484182015], 19);
      
        // Add the default overlay
        if (!imageOverlay) {
          imageOverlay = createImageOverlay(defaultOverlayImage, defaultOverlayBounds);
          map.addLayer(imageOverlay);
        }
      });
      

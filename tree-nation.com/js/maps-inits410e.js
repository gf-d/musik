var InitMaps = {
    satellite: function () {
        map = new GMaps({
            div: '.map-hero',
            scrollwheel: false,
            zoom: 15,
            lat: parseFloat(project.lat),
            lng: parseFloat(project.long),
            mapType: 'SATELLITE'
        });
        map.addMarker({
            lat: parseFloat(project.lat),
            lng: parseFloat(project.long),
            title: project.location
        });

        /*maxZoomService = new google.maps.MaxZoomService();

        maxZoomService.getMaxZoomAtLatLng({
            lat: parseFloat(project.lat),
            lng: parseFloat(project.long)
        }, function (response) {
            if (response.status !== google.maps.MaxZoomStatus.OK) {
                console.log('Error in MaxZoomService');
            } else {
                console.log(response.zoom);
                var zoom = response.zoom;
                if (response.zoom > 17) {
                    zoom = 17;
                }
                map = new GMaps({
                    div: '.map-hero',
                    scrollwheel: false,
                    zoom: zoom,
                    lat: parseFloat(project.lat),
                    lng: parseFloat(project.long),
                    mapType: 'SATELLITE'
                });
                map.addMarker({
                    lat: parseFloat(project.lat),
                    lng: parseFloat(project.long),
                    title: project.location
                });
            }
        });*/
    },
    global: function () {
        map = new GMaps({
            div: '.map-hero',
            scrollwheel: false,
            zoom: 3,
            lat: 25.464283,
            lng: 0.8129347
        });
    },
    plantingSite: function () {
        if (!google.maps.Polygon.prototype.getBounds) {
            google.maps.Polygon.prototype.getBounds = function () {
                var bounds = new google.maps.LatLngBounds();
                this.getPath().forEach(function (element, index) {
                    bounds.extend(element)
                });
                return bounds
            }
        }
        map = new GMaps({
            div: '.map-hero',
            scrollwheel: false,
            zoom: 15,
            lat: project.lat,
            lng: project.long,
            mapType: 'SATELLITE'
        });

        var polygon_path = project_site.polygon_data ? JSON.parse(project_site.polygon_data) : [];
        if (polygon_path.length > 0) {
            polygon = map.drawPolygon({
                paths: polygon_path,
                strokeColor: '#49bc6b',
                strokeOpacity: 1,
                strokeWeight: 3,
                fillColor: '#fff',
                fillOpacity: 0.15
            });

            map.fitBounds(polygon.getBounds());
        } else {
            map.addMarker({
                lat: parseFloat(project.lat),
                lng: parseFloat(project.long),
                title: project.location
            });
        }
    },
    projectList: function () {
        map = new GMaps({
            div: '.map-hero',
            scrollwheel: false,
            zoom: 2,
            lat: 25.464283,
            lng: 0.8129347,
            minZoom: 2
        });

        /*map.on('marker_added', function (marker) {
            var index = map.markers.indexOf(marker);
            if (index == map.markers.length - 1) {
                map.fitZoom();
            }
        });*/

        var map;
        var items, markers_data = [];
        _.each(map_projects, function (project) {
            if (project.lat != undefined && project.long != undefined) {
                if (project.status == 'affiliated') {
                    var marker_image = "/images/icons/map-marker-2.svg";
                    var btn_class = "green";
                } else {
                    var marker_image = "/images/icons/map-marker-1.svg";
                    var btn_class = "red";
                }

                var rating_template = '';
                for(var n = 0; n < 5; n++){
                    var star_half = n < (5 - project.rating) && (n + 0.5) > (5 - project.rating);
                    var active = n >= 5 - project.rating;

                    rating_template += '<span class="fas fa-star star ' + ( active || star_half ? 'active' : '' ) + ' ' + (star_half ? 'fa-star-half-alt' : '' )+'">';
                }

                var image_url = '#';
                var size = '100x100';
                if (project.image) {
                    if (project.image.slice(0, 1) == '/' || project.image.slice(0, 1) == '\\')
                        image_url =  '/thumbs/' + size + '/https://treenation-uploads.s3-accelerate.amazonaws.com/' + project.image.slice(1);
                    image_url =  ajax_url + '/thumbs/' + size + '/https://treenation-uploads.s3-accelerate.amazonaws.com/' + project.image;
                }

                var plant_button = '';
                if (project.status == 'affiliated') {
                    var price_formatted = project.billings.species_price_from;
                    if (price_formatted.toString().indexOf(".")!=-1) {
                        price_formatted = price_formatted.toFixed(2).replace(/\./g, ',');
                    }
                    plant_button = '<a href="'+ajax_url + '/plant/' + project.id+'" class="btn btn-green">'+trans_jquery('projects.plant_from')+' <span>'+price_formatted+'</span>€</a>';
                }

                var trees_planted = '';
                if (project.trees_planted_or_funded) {
                    var year = project.created_at;
                    year = year.split('-');
                    year = year[0];
                    if (project.status == 'affiliated' || project.status == 'closed') {
                        var trees_planted_text = trans_jquery('projects.trees_funded_since');
                    } else {
                        var trees_planted_text = trans_jquery('projects.trees_planted_since');
                    }
                    trees_planted = '<span>'+project.trees_planted_or_funded+'</span> '+trees_planted_text+' '+year+'</span>';
                }

                markers_data.push({
                    lat: parseFloat(project.lat),
                    lng: parseFloat(project.long),
                    title: project.name,
                    icon: marker_image,
                    infoWindow: {
                        content: '<table class="table project-prev-map"><tbody><tr><td><a href="' + ajax_url + '/projects/' + project.slug + '/updates"><img src="'+image_url+'" class="img-responsive"></a></td><td><h4><a href="' + ajax_url + '/projects/' + project.slug + '/updates">'+project.name+'</a></h4><div class="rating-stars">'+rating_template+'</div><p class="mt-1">'+trees_planted+'</p><div>'+plant_button+'</td></tr></tbody></table>'
                    }
                });
            }
        });

        map.addMarkers(markers_data);
        //console.log(markers_data);
    },
    impactMap: function(current_filter_id) {
        if (typeof map == 'undefined') {
            map = new GMaps({
                div: '.map-hero',
                scrollwheel: false,
                zoom: 2,
                lat: 25.464283,
                lng: 0.8129347,
                minZoom: 2
            });
        } else {
            // clear previous markers
            for (var i = 0; i < map.markers.length; i++) {
                map.markers[i].setMap(null);
            }
            map.markers = [];
        }

        var items, markers_data = [];

        _.each(map_projects[current_filter_id], function (project) {
            if (project.lat != undefined && project.long != undefined) {
                if (project.status == 'affiliated') {
                    var marker_image = "/images/icons/map-marker-2.svg";
                    var btn_class = "green";
                } else {
                    var marker_image = "/images/icons/map-marker-1.svg";
                    var btn_class = "red";
                }

                var rating_template = '';
                for(var n = 0; n < 5; n++){
                    var star_half = n < (5 - project.rating) && (n + 0.5) > (5 - project.rating);
                    var active = n >= 5 - project.rating;

                    rating_template += '<span class="fas fa-star star ' + ( active || star_half ? 'active' : '' ) + ' ' + (star_half ? 'fa-star-half-alt' : '' )+'">';
                }

                var image_url = '#';
                var size = '100x100';
                if (project.image) {
                    if (project.image.slice(0, 1) == '/' || project.image.slice(0, 1) == '\\')
                        image_url =  '/thumbs/' + size + '/https://treenation-uploads.s3-accelerate.amazonaws.com/' + project.image.slice(1);
                    image_url =  ajax_url + '/thumbs/' + size + '/https://treenation-uploads.s3-accelerate.amazonaws.com/' + project.image;
                }

                var plant_button = '';
                if (project.status == 'affiliated') {
                    //TODO ramon en local project.billings és null i s'interromp el script
                    var price_formatted = project.billings == null ? '' : project.billings.species_price_from;
                    if (price_formatted.toString().indexOf(".")!=-1) {
                        price_formatted = price_formatted.toFixed(2).replace(/\./g, ',');
                    }
                    plant_button = '<a href="'+ajax_url + '/plant/' + project.id+'" class="btn btn-green">'+trans_jquery('projects.plant_from')+' <span>'+price_formatted+'</span>€</a>';
                }

                var planted_count = project.planted_count;
                var trees_planted = '<span>'+planted_count+'</span> '+ trans_jquery('projects.trees_planted').toLowerCase()+'</span>';

                markers_data.push({
                    lat: parseFloat(project.lat),
                    lng: parseFloat(project.long),
                    title: project.name,
                    icon: marker_image,
                    infoWindow: {
                        content: '<table class="table project-prev-map text-left"><tbody><tr><td><a href="' + ajax_url + '/projects/' + project.slug + '/updates"><img src="'+image_url+'" class="img-responsive"></a></td><td><h4><a href="' + ajax_url + '/projects/' + project.slug + '/updates">'+project.name+'</a></h4><div class="rating-stars">'+rating_template+'</div><p class="mt-2">'+trees_planted+'</p><div>'+plant_button+'</td></tr></tbody></table>'
                    }
                });
            }
        });

        map.addMarkers(markers_data);
    },
};

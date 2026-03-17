import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const imageWidth = 1906;
const imageHeight = 3810;

const map = L.map('map', {
	crs: L.CRS.Simple,
	minZoom: -3,
	maxZoom: 2
});

const bounds = [[0, 0], [imageHeight, imageWidth]];

L.imageOverlay('/Hoedoeikt/images/map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

L.marker([2000, 700]).addTo(map).bindPopup('Hier is het voederkot');

const gpsRef = {
    lat: 50.985123,
    lng: 4.575321
};

const imgRef = {
    y: 0,
    x: 1200
};

const metersPerPixelX = 0.25;
const metersPerPixelY = 0.25;

function distanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function gpsToImage(lat, lng) {
    const dx = distanceMeters(gpsRef.lat, gpsRef.lng, gpsRef.lat, lng);
    const dy = distanceMeters(gpsRef.lat, gpsRef.lng, lat, gpsRef.lng);

    return {
        x: imgRef.x + (lng > gpsRef.lng ? dx : -dx) / metersPerPixelX,
        y: imgRef.y + (lat < gpsRef.lat ? dy : -dy) / metersPerPixelY
    };
}

map.locate({ watch: true, enableHighAccuracy: true });

map.on('locationfound', (e) => {
    const pos = gpsToImage(e.latitude, e.longitude);

    if (!window.userMarker) {
        window.userMarker = L.marker([pos.y, pos.x]).addTo(map);
    } else {
        window.userMarker.setLatLng([pos.y, pos.x]);
    }

    map.panTo([pos.y, pos.x]);
});
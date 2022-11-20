import { Google_Map_Key } from 'config';

export const fetchCoordsfromPlace = async (place_id) => {
    const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?place_id=' + place_id + '&key=' + Google_Map_Key);
    const json = await response.json();
    if (json.results && json.results.length > 0 && json.results[0].geometry) {
        let coords = json.results[0].geometry.location;
        return coords;
    }
    return null;
}

export const fetchAddressfromCoords = async (latlng) => {
    const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&key=' + Google_Map_Key)
    const json = await response.json();
    if (json.results && json.results.length > 0 && json.results[0].formatted_address) {
        return json.results[0].formatted_address;
    }
    return null;
}

export const getRouteDetails = async (platform, startLoc, destLoc) => {
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destLoc}&key=${Google_Map_Key}`
    let cors_proxy = 'https://cors-proxy.dev.exicube.com/';
    url = platform == 'web'? cors_proxy + url : url;
    let response = await fetch(url)
    let json = await response.json();
    if (json.routes && json.routes.length > 0) {
        return {
            distance:json.routes[0].legs[0].distance.value,
            duration:json.routes[0].legs[0].duration.value,
            polylinePoints:json.routes[0].overview_polyline.points
        }
    }
    return null;
}

export const getDriveTime = (startLoc, destLoc) =>{
    return new Promise(function (resolve, reject) {
        fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${startLoc}&destinations=${destLoc}&key=${Google_Map_Key}`)
            .then((response) => response.json())
            .then((res) =>
                resolve({
                    distance_in_meter: res.rows[0].elements[0].distance.value,
                    time_in_secs: res.rows[0].elements[0].duration.value,
                    timein_text: res.rows[0].elements[0].duration.text
                })
            )
            .catch(error => {
                reject(error);
            });
    });
}
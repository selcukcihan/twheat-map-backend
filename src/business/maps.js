const stringSimilarity = require('string-similarity');

/* 
    Twitter'daki lokasyon bilgisi, free-text oldugu icin herkes istedigi seyi yazabiliyor.
    Bazilari bir yer bile bildirmeyebiliyor.
    Elimizdeki dataset'te yer ve koordinat bilgisi var, bunu kullanarak twitter'dan gelen
    lokasyon bilgilerini string-similarity kutuphanesini kullanarak datasetimizdeki yerlerle
    eslestirmeye calisiyoruz.
*/
const cities = require('../data/worldcities.json');
const coordinatesMap = new Map(
    cities.map(obj => [obj.city + ", " + obj.iso2 + ", " + obj.country, {
        lat: obj.lat,
        lng: obj.lng
}]));

const citiesArray = Array.from(coordinatesMap.keys());

function getCoordinates(locations) {
    return locations
        .map(l => stringSimilarity.findBestMatch(l, citiesArray).bestMatch.target)
        .map(l => coordinatesMap.get(l));
}

module.exports = exports = {
    getCoordinates: getCoordinates,
};

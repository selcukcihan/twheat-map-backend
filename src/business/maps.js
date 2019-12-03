const stringSimilarity = require('string-similarity');

/* 
    Twitter'daki lokasyon bilgisi, free-text oldugu icin herkes istedigi seyi yazabiliyor.
    Bazilari bir yer bile bildirmeyebiliyor.
    Elimizdeki dataset'te yer ve koordinat bilgisi var, bunu kullanarak twitter'dan gelen
    lokasyon bilgilerini string-similarity kutuphanesini kullanarak datasetimizdeki yerlerle
    eslestirmeye calisiyoruz.
*/
const worldCities = require('../data/worldcities.json');

const cityMap = new Map();
const countryMap = new Map();
const adminMap = new Map();
const coordinatesMap = new Map();

function getWorldCityIdentifier(worldCity) {
    return worldCity.city + ", " + worldCity.iso2 + ", " + worldCity.country;
}

function addToMap(map, key, worldCityIdentifier) {
    if (map.has(key)) {
        map.get(key).push(worldCityIdentifier);
    } else {
        map.set(key, [worldCityIdentifier]);
    }    
}

for (let i = 0; i < worldCities.length; i++) {
    let worldCity = worldCities[i];
    let worldCityIdentifier = getWorldCityIdentifier(worldCity);
    addToMap(cityMap, worldCity.city, worldCityIdentifier);
    addToMap(countryMap, worldCity.country, worldCityIdentifier);
    addToMap(adminMap, worldCity.admin_name, worldCityIdentifier);
    coordinatesMap.set(worldCityIdentifier, { lat: worldCity.lat, lng: worldCity.lng });
}

const cities = Array.from(cityMap.keys());

function getMinimumDistance(location, identifiers) {
    let maxSimilarity = null;
    let target = null;
    for (let i = 0; i < identifiers.length; i++) {
        const worldCityIdentifier = identifiers[i];
        if (worldCityIdentifier === location) {
            return location;
        }
        let similarity = stringSimilarity.compareTwoStrings(location, worldCityIdentifier);
        if (maxSimilarity == null || similarity > maxSimilarity) {
            maxSimilarity = similarity;
            target = worldCityIdentifier;
        }
        if (maxSimilarity > 0.5) {
            break;
        }
    }
    return {
        target: target,
        similarity: maxSimilarity
    };
}

function fallbackToCitySimilarity(friendLocation, city) {
    const matchingCity = stringSimilarity.findBestMatch(city, cities).bestMatch.target;
    return getMinimumDistance(friendLocation, cityMap.get(matchingCity)).target;
}

function findClosestMatch(friendLocation) {
    const tokens = friendLocation.split(",").map(s => s.trim());
    const maps = [cityMap, countryMap, adminMap];
    let closestMatch = null;

    for (let i = 0; i < tokens.length; i++) {
        for (let j = 0; j < maps.length; j++) {
            if (maps[j].has(tokens[i])) {
                const result = getMinimumDistance(friendLocation, maps[j].get(tokens[i]));
                if (closestMatch == null || closestMatch.similarity < result.similarity) {
                    closestMatch = result;
                }
            }
        }
    }
    if (closestMatch == null) {
        return fallbackToCitySimilarity(friendLocation, tokens[0]);
    } else {
        return closestMatch.target;
    }
}

function getCoordinates(friendLocations) {
    let locationCache = new Map();
    return friendLocations
        .map(l => {
            if (locationCache.has(l)) {
                return locationCache.get(l);
            } else {
                let location = findClosestMatch(l);
                locationCache.set(l, location);
                return location;
            }
        })
        .map(l => coordinatesMap.get(l));
}

module.exports = exports = {
    getCoordinates: getCoordinates,
};

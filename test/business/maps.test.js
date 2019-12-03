maps = require('business/maps');

const locations = {
    Istanbul: {
        TestValue: "İstanbul, Türkiye",
        ExpectedCoordinates: [41.0082, 28.9784]
    },
    Seattle: {
        TestValue: "Seattle, WA, USA",
        ExpectedCoordinates: [47.6062, -122.3321]
    },
    Bangalore: {
        TestValue: " India, Bangalore ",
        ExpectedCoordinates: [12.9716, 77.5946]
    },
    Sydney: {
        TestValue: "Sydney Australia",
        ExpectedCoordinates: [-33.8688, 151.2093]
    },
};

function isClose(actual, expected) {
    return (Math.abs(actual[0].lat - expected[0]) < 1
        && Math.abs(actual[0].lng - expected[1]) < 1);
}

describe('maps', () => {
    for (let l in locations) {
        test(l, () => {
            expect(isClose(
                maps.getCoordinates([locations[l].TestValue]),
                locations[l].ExpectedCoordinates))
            .toBeTruthy();
        });
    }
});

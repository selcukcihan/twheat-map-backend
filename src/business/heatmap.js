require("dotenv").config({ silent: true });

const Twitter = require('twitter');
const fetch = require('node-fetch');

const maps = require("./maps");

const { m, reportLatencies } = require("../util/metrics");

var options = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
        client_id: process.env.AUTH0_ADMIN_CLIENT_ID,
        client_secret: process.env.AUTH0_ADMIN_CLIENT_SECRET,
        audience: process.env.AUTH0_ADMIN_AUDIENCE,
        grant_type: "client_credentials",
    }),
};

function getFriendsHelper(client, userId, cursor, locations) {
    return client.get("friends/list", {
        skip_status: true,
        count: 200,
        cursor: cursor,
        user_id: userId,
    })
    .then(res => {
        locations = locations.concat(res.users.map(u => u.location));
        if (res.next_cursor_str !== "0") {
            return getFriendsHelper(client, userId, res.next_cursor_str, locations);
        } else {
            return locations.filter(l => l);
        }
    })
}

function getFriends(adminResponse) {
    if (!adminResponse.identities || adminResponse.identities[0].provider !== "twitter") {
        throw new Error("IDP is not twitter.");
    }

    const options = {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: adminResponse.identities[0].access_token,
        access_token_secret: adminResponse.identities[0].access_token_secret
    };
    const client = new Twitter(options);
    return getFriendsHelper(client, adminResponse.identities[0].user_id, "-1", []);
}

module.exports = exports = function(auth0Id) {
    /*
        auth0Id: mesela "twitter|134182720" bunu kullanarak bu kullanicinin Auth0'dan detayini cekecegiz
        Bu detaya ihtiyac duymamizin sebebi, icerisinde twitter API'lerini cagirmak icin kullanacagimiz
        bir "access token" ve "access token secret" olmasidir.

        1. Auth0 admin API'sini cagirabilmek icin oncelikle bir token istiyoruz Auth0'dan.
        2. Bu token'i kullanarak, Auth0 admin API'sinden kullanicinin detayini cekiyoruz.
        3. Detaydaki token ve secret'i alarak, twitter API'sini bu kullanici adina cagiriyoruz.
        4. Topladigimiz kullanici lokasyonlarini worldcities.json'daki koordinatlarla eslestiriyoruz.
    */
    return m("GetTokenFromAuth0", () => fetch(process.env.AUTH0_TOKEN_URL, options))()
        .then(res => res.json())
        .then(m("GetUserDetailsFromAuth0", res => {
            return fetch(process.env.AUTH0_ADMIN_GET_USER_URL + auth0Id, {
                method: "GET",
                headers: {
                    authorization: "Bearer " + res.access_token
                },
            });
        }))
        .then(res => res.json())
        .then(m("GetFriendsFromTwitter", getFriends))
        .then(m("GetCoordinates", maps.getCoordinates))
        .then(reportLatencies);
}

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

function getFriendsHelper(client, userId, cursor) {
    return client.get("friends/list", {
        skip_status: true,
        count: 200,
        cursor: cursor === '' ? "-1" : cursor,
        user_id: userId,
    })
    .then(res => {
        const locations = res.users.map(u => u.location);
        const nextCursor = (res.next_cursor_str !== "0" ? res.next_cursor_str : '');
        return {
            locations: locations.filter(l => l),
            continuation: nextCursor
        };
    });
}

function getFriends(adminResponse, continuation) {
    if (!adminResponse.identities || adminResponse.identities[0].provider !== "twitter") {
        throw new Error("IDP is not twitter.");
    }

    const options = {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: adminResponse.identities[0].access_token,
        access_token_secret: adminResponse.identities[0].access_token_secret
    };
    const client = new Twitter(options);
    return getFriendsHelper(client, adminResponse.identities[0].user_id, continuation);
}

module.exports = exports = function(auth0Id, continuation) {
    /*
        auth0Id: mesela "twitter|134182720" bunu kullanarak bu kullanicinin Auth0'dan detayini cekecegiz
        Bu detaya ihtiyac duymamizin sebebi, icerisinde twitter API'lerini cagirmak icin kullanacagimiz
        bir "access token" ve "access token secret" olmasidir.
        continuation: twitter API'sinin pagination'u icin

        1. Auth0 admin API'sini cagirabilmek icin oncelikle bir token istiyoruz Auth0'dan.
        2. Bu token'i kullanarak, Auth0 admin API'sinden kullanicinin detayini cekiyoruz.
        3. Detaydaki token ve secret'i alarak, twitter API'sini bu kullanici adina cagiriyoruz.
        4. Topladigimiz kullanici lokasyonlarini worldcities.json'daki koordinatlarla eslestiriyoruz.
    */
    let newContinuation = ''
    return m("GetTokenFromAuth0", () => fetch(process.env.AUTH0_TOKEN_URL, options))()
        .then(res => res.json())
        .then(res => {
            console.log(JSON.stringify(res));
            return res;
        })
        .then(m("GetUserDetailsFromAuth0", res => {
            return fetch(process.env.AUTH0_ADMIN_GET_USER_URL + auth0Id, {
                method: "GET",
                headers: {
                    authorization: "Bearer " + res.access_token
                },
            });
        }))
        .then(res => res.json())
        .then(m("GetFriendsFromTwitter", (adminResponse) => getFriends(adminResponse, continuation)))
        .then(res => {
            newContinuation = res.continuation
            return res.locations
        })
        .then(m("GetCoordinates", maps.getCoordinates))
        .then(reportLatencies)
        .then(res => ({
            locations: res,
            continuation: newContinuation
        }))
}

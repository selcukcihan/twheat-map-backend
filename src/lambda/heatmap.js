const heatmap = require("../business/heatmap");

module.exports.handler = async (event, context) => {
    return heatmap(event.requestContext.authorizer.principalId)
    .then(res => {
        return {
            statusCode: 200,
            body: JSON.stringify(res),
            headers: {
                "Access-Control-Allow-Origin": "https://twheat-map.selcukcihan.com,http://localhost:3000",
                "Access-Control-Allow-Credentials": true
            }
        };
    });
};

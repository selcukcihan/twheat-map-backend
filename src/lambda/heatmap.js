const heatmap = require("../business/heatmap");

module.exports.handler = async (event, context) => {
    return heatmap(event.requestContext.authorizer.principalId)
    .then(res => {
        return {
            statusCode: 200,
            body: JSON.stringify(res),
            headers: {
                "Access-Control-Allow-Origin": "selcukcihan.com",
                "Access-Control-Allow-Credentials": true
            }
        };
    });
};

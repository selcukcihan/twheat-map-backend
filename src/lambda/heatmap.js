const heatmap = require("../business/heatmap");

module.exports.handler = async (event/*, context */) => {
    let continuation = ''
    if (event.queryStringParameters && event.queryStringParameters.continuation) {
        continuation = event.queryStringParameters.continuation
    }
    return heatmap(event.requestContext.authorizer.principalId, continuation)
    .then(res => {
        return {
            statusCode: 200,
            body: JSON.stringify(res),
            headers: {
                "Access-Control-Allow-Origin": "https://twheat-map.selcukcihan.com",
                "Access-Control-Allow-Credentials": true
            }
        };
    });
};

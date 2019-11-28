const { PerformanceObserver, performance } = require('perf_hooks');

const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

const events = [];

function measureFunction(label, promise) {
    let begin;
    return (response) => {
        return new Promise(function(resolve, reject) {
            begin = performance.now();
            resolve(response);
        })
        .then(promise)
        .then(res => {
            events.push({label: label, duration: performance.now() - begin});
            return res;
        });
    };
}

function reportLatencies(response) {
    const params = {
        MetricData: events.map(e => ({
            MetricName: e.label + "Latency",
            Unit: "Milliseconds",
            Value: e.duration
        })),
        Namespace: process.env.CLOUDWATCH_NAMESPACE
    };

    return cloudwatch.putMetricData(params).promise()
        .catch(err => {
            console.log("Error while calling CloudWatch API: " + err + "\nParameters were: " + JSON.stringify(params));
        })
        .then(() => {
            events.length = 0; // event'leri bosaltalim ki bir sonraki cagrida gelmesinler
            return response;
        });
}

module.exports = exports = {
    m: measureFunction,
    reportLatencies: reportLatencies,
};

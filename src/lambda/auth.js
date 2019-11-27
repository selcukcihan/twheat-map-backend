const auth = require("../business/auth");
let data;

module.exports.handler = async event => {
    try {
        data = await auth.authenticate(event);
    } catch (err) {
        console.log(err);
        return `Unauthorized: ${err.message}`;
    }
    return data;
};

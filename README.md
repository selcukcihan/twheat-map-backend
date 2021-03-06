[![Build Status](https://travis-ci.org/selcukcihan/twheat-map-backend.svg?branch=master)](https://travis-ci.org/selcukcihan/twheat-map-backend)

This is the backend for my toy project which can be accessed from [twheat-map.selcukcihan.com](https://twheat-map.selcukcihan.com).
For the frontend, please see [github.com/selcukcihan/twheat-map](https://github.com/selcukcihan/twheat-map).
There is a series of blog posts on [my personal blog](https://blog.selcukcihan.com/web-development/twheat-map/), in Turkish, describing the development process.

* Backend is implemented with [the serverless framework](https://serverless.com) and hosted on AWS [API Gateway](https://aws.amazon.com/api-gateway/) and [Lambda](https://aws.amazon.com/lambda/).
* We are using a [custom lambda authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) to secure our single API Gateway endpoint.
* Coordinates of well-known cities are taken from the data set by [simplemaps.com](https://simplemaps.com/data/world-cities).
* CI/CD is on travis-ci, see [this blog post](https://blog.selcukcihan.com/devops/travis-ci) for details (in Turkish).

The application will show you locations of the people you follow on Twitter.

![Twheat-map screenshot](https://github.com/selcukcihan/twheat-map/blob/master/twheat-map-screenshot.png)

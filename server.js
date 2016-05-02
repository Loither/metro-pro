#!/bin/env node

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoOp = require("./model/mongo");
var router = express.Router();

var apiApp = function () {

    var self = this;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        "extended": false
    }));

    router.get("/", function (req, res) {
        res.json({
            "error": false,
            "message": "Hello World"
        });
    });

    router.route("/users")
        .get(function (req, res) {
            var response = {};
            mongoOp.find({}, function (err, data) {
                // Mongo command to fetch all data from collection.
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    response = {
                        "error": false,
                        "message": data
                    };
                }
                res.json(response);
            });
        })
        .post(function (req, res) {
            var db = new mongoOp();
            var response = {};
            // fetch params from REST request.
            // Add strict validation when you use this in Production.
            db.firstName = req.body.firstname;
            db.lastName = req.body.lastname;
            db.yearCourse = req.body.yearcourse;
            db.skills = req.body.skills;
            db.availability = req.body.availability;
            db.save(function (err) {
                // save() will run insert() command of MongoDB.
                // --> add new data in collection.
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error adding data"
                    };
                } else {
                    response = {
                        "error": false,
                        "message": "Data added"
                    };
                }
                res.json(response);
            });
        });


    router.route("/users/:id")
        .get(function (req, res) {
            var response = {};
            mongoOp.findById(req.params.id, function (err, data) {
                // This will run Mongo Query to fetch data based on ID.
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    response = {
                        "error": false,
                        "message": data
                    };
                }
                res.json(response);
            });
        })
        .put(function (req, res) {
            var response = {};
            // first find out record exists or not
            // if it does then update the record
            mongoOp.findById(req.params.id, function (err, data) {
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    // we got data from Mongo.
                    // change it accordingly.
                    if (req.body.firstName !== undefined) {
                        // case where email needs to be updated.
                        data.userEmail = req.body.firstName;
                    }
                    if (req.body.lastName !== undefined) {
                        // case where password needs to be updated
                        data.userPassword = req.body.lastName;
                    }
                    // save the data
                    data.save(function (err) {
                        if (err) {
                            response = {
                                "error": true,
                                "message": "Error updating data"
                            };
                        } else {
                            response = {
                                "error": false,
                                "message": "Data is updated for " + req.params.id
                            };
                        }
                        res.json(response);
                    });
                }
            });
        })
        .delete(function (req, res) {
            var response = {};
            // find the data
            mongoOp.findById(req.params.id, function (err, data) {
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    // data exists, remove it.
                    mongoOp.remove({
                        _id: req.params.id
                    }, function (err) {
                        if (err) {
                            response = {
                                "error": true,
                                "message": "Error deleting data"
                            };
                        } else {
                            response = {
                                "error": true,
                                "message": "Data associated with " + req.params.id + "is deleted"
                            };
                        }
                        res.json(response);
                    });
                }
            });
        });



    app.use('/', router);

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
        var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
        app.listen(port, ipaddress, function () {
            console.log((new Date()) + ' Server is listening on port 8080');
        });
    };
};

var zapp = new apiApp();
zapp.start();
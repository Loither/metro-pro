#!/bin/env node

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var user = require("./model/user");
var skill = require("./model/skill");
var router = express.Router();

var apiApp = function () {

    var self = this;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        "extended": false
    }));

    app.use(express.static('static'));
    
    app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

    router.get("/", function (req, res) {
        res.json({
            "error": true,
            "message": "Hei, jokin meni vikaan sivua ladattaessa. Kokeile päivittää sivu."
        });
    });

    router.route("/users")
        .get(function (req, res) {
            var response = {};
            user.find({}, function (err, data) {
                // Mongo command to fetch all data from collection.
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    response = data;
                }
                res.json(response);
            });
        })
        .post(function (req, res) {
            var db = new user();
            var db2 = new skill();
            var response = {};
            var formattedSkills = [];
            var data = req.body;
            db.firstName = data.firstName;
            db.lastName = data.lastName;
            db.email = data.email;
            db.major = data.major;
            db.yearCourse = data.yearCourse;
            db.alumni = data.alumni;
            db.staff = data.staff;
            data.skills.forEach(function (skill) {
                formattedSkills.push(skill.toLowerCase());
                saveSkill(skill);
            });
            db.skills = formattedSkills;
            db.availability = data.availability;

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
            user.findById(req.params.id, function (err, data) {
                // This will run Mongo Query to fetch data based on ID.
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    response = data;
                }
                res.json(response);
            });
        })
        .put(function (req, res) {
            var response = {};
            // first find out record exists or not, if it does then update the record
            user.findById(req.params.id, function (err, data) {
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    // we got data from Mongo --> change it accordingly.
                    if (req.body.firstName !== undefined) {
                        data.firstName = req.body.firstName;
                    }
                    if (req.body.lastName !== undefined) {
                        data.lastName = req.body.lastName;
                    }
                    if (req.body.email !== undefined) {
                        data.email = req.body.email;
                    }
                    if (req.body.major !== undefined) {
                        data.major = req.body.major;
                    }
                    if (req.body.yearCourse !== undefined) {
                        data.yearCourse = req.body.yearCourse;
                    }
                    if (req.body.alumni !== undefined) {
                        data.alumni = req.body.alumni;
                    }
                    if (req.body.staff !== undefined) {
                        data.staff = req.body.staff;
                    }
                    if (req.body.skills !== undefined) {
                        data.skills = req.body.skills;
                    }
                    if (req.body.availability !== undefined) {
                        data.availability = req.body.availability;
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
            user.findById(req.params.id, function (err, data) {
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    // data exists, remove it.
                    user.remove({
                        _id: req.params.id
                    }, function (err) {
                        if (err) {
                            response = {
                                "error": true,
                                "message": "Error deleting data"
                            };
                        } else {
                            response = {
                                "error": false,
                                "message": "Data associated with " + req.params.id + "is deleted"
                            };
                        }
                        res.json(response);
                    });
                }
            });
        });

    router.route("/skills")
        .get(function (req, res) {
            var response = {};
            skill.find({}, function (err, data) {
                // Mongo command to fetch all data from collection.
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    response = data;
                }
                res.json(response);
            });
        })
        .post(function (req, res) {
            var db = new skill();
            var response = {};
            // Needs strict validation when used in production!
            var data = req.body;
            var formattedSkills = [];

            data.skills.forEach(function (skill) {
                formattedSkills.push(skill.toLowerCase());
            });

            db.skills = formattedSkills;

            db.save(function (err) {
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

    // find users (by skills limited with alumni / staff)
    router.route("/search")
        .post(function (req, res) {
            var response = {};
            var staff = false;
            var alumni = false;

            var regexpSkills = [];
            // wrap all array items with regexp
            req.body.skills.forEach(function (item) {
                var re = new RegExp(item, "i");
                regexpSkills.push(re);
            });

            if (req.body.staff !== undefined) {
                staff = req.body.staff;
            }
            if (req.body.staff !== undefined) {
                alumni = req.body.alumni;
            }
            user
                .find({
                    skills: {
                        $all: regexpSkills
                    }
                }).
            where('staff').equals(staff).
            where('alumni').equals(alumni).
            exec(function (err, data) {
                // This will run Mongo Query to fetch data based on skills in an array.
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    response = data;
                }
                res.json(response);
            });
        });

    // find count of users (by skills limited with alumni / staff)
    router.route("/search/count")
        .post(function (req, res) {
            var response = {};
            var staff = false;
            var alumni = false;

            var regexpSkills = [];
            // wrap all array items with regexp
            req.body.skills.forEach(function (item) {
                var re = new RegExp(item, "i");
                regexpSkills.push(re);
            });

            if (req.body.staff !== undefined) {
                staff = req.body.staff;
            }
            if (req.body.staff !== undefined) {
                alumni = req.body.alumni;
            }
            user
                .find({
                    skills: {
                        $all: regexpSkills
                    }
                }).
            where('staff').equals(staff).
            where('alumni').equals(alumni).
            count(function (err, data) {
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error fetching data"
                    };
                } else {
                    response = data;
                }
                res.json(response);
            });
        });

    function saveSkill(skillToAdd) {
        var db = new skill();
        db.skills = skillToAdd.toLowerCase();
        db.save(function (err) {});
    }

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

var metroProApp = new apiApp();
metroProApp.start();
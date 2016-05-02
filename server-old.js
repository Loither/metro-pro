#!/bin/env node
 //  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');


/**
 *  Define the sample application.
 */
var SampleApp = function () {

    //  Scope.
    var self = this;
    
    /* =================================================================  */
    /* ==  MONGODB, FIRST EXPERIMENTS ==================================  */
    /* =================================================================  */
    
    
    self.connectToMyMongo = function () {
	
	//console.log("mongo initiated");
	// 1. KONFIGURAATIO
	
	// default to a 'localhost' configuration:
	var connection_string = '127.0.0.1:27017/metropro';
	// if OPENSHIFT env variables are present, use the available connection info:
	if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
        connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
	}
	
	// 2. YHTEYDENOTTO 
	
	//load the Client interface
	var MongoClient = require('mongodb').MongoClient;
	// the client db connection scope is wrapped in a callback:
	MongoClient.connect('mongodb://'+connection_string, function(err, db) {
	  if(err) throw err;
	  var collection = db.collection('metropros').find().limit(10).toArray(function(err, docs) {
          db.close();
          return docs;
	  });
	});
	
    };


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function () {
        if (typeof self.zcache === "undefined") {
            self.zcache = {
                'index.html': ''
            };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function (key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function () {
        self.routes = {};

        self.routes['/'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html'));
        };

        self.routes['/user'] = function (req, res) {
            var json = {
                "funktio": "GET: user - parametrit:",
                "firstName": "Olli",
                "lastName": "Osaaja",
                "yearCourse": "2.",
                "skills": ["java", "javascript", "php", "html"],
                "availability": "saatavuus"
            };

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(json));
        };

        self.routes['/user/test'] = function (req, res) {
            /*MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                var collection = db.collection('metropros').find().limit(10).toArray(function (err, docs) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(docs);
                    db.close();
                });
            });*/
            //self.connectToMyMongo();
            res.setHeader('Content-Type', 'text/plain');
            res.send(self.connectToMyMongo());
        };

        self.routes['/user/add'] = function (req, res) {
            var json = {
                "funktio": "POST: user/add - parametrit:",
                "firstName": "etunimi",
                "lastName": "sukunimi",
                "yearCourse": "vuosikurssi",
                "skills": ["taidot"],
                "availability": "saatavuus"
            };
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(json));
        };

        self.routes['/user/modify'] = function (req, res) {
            var json = {
                "funktio": "POST: user/modify - parametrit:",
                "firstName": "etunimi",
                "lastName": "sukunimi",
                "yearCourse": "vuosikurssi",
                "skills": ["taidot"],
                "availability": "saatavuus"
            };
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(json));
        };

        self.routes['/search'] = function (req, res) {
            var json = {
                "funktio": "POST: search - parametrit (vaihtoehtoisia):",
                "id": "käyttäjä-id",
                "firstName": "etunimi",
                "lastName": "sukunimi",
                "skill": "taito/taidot",
                "yearCourse": "vuosikurssi",
                "availability": "saatavuus"
            };
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(json));
        };

        self.routes['/skills'] = function (req, res) {
            var json = {
                "funktio": "GET: skills:",
                "skills": ["javascript", "java", "php", "python", "html"]
            };
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(json));
        };


    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function () {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

}; /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
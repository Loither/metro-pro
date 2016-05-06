#!/bin/env node

var mongoose = require("mongoose");
//var connection_string = '127.0.0.1:27017/metropro';
//// if OPENSHIFT env variables are present, use the available connection info:
//if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
//    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
//        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
//        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
//        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
//        process.env.OPENSHIFT_APP_NAME;
//}
//mongoose.connect('mongodb://' + connection_string);
//// create instance of Schema
var mongoSchema = mongoose.Schema;

// create schema
var skillSchema = {
    "skills": {type: String, required: true, unique: true}
};
// create model if one does not exist.
module.exports = mongoose.model('skill', skillSchema, 'skills');
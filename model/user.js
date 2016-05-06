#!/bin/env node

var mongoose = require("mongoose");
var connection_string = '127.0.0.1:27017/metropro';
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect('mongodb://' + connection_string);
// create instance of Schema
var mongoSchema = mongoose.Schema;

// create schema
var userSchema = {
    "firstName": String,
    "lastName": String,
    "email": {type: String, unique: true},
    "major": String,
    "yearCourse": {type: Number, min: 1, max: 4},
    "alumni": Boolean,
    "staff": Boolean,
    "skills": Array,
    "availability": {
        "inno": Boolean,
        "thesis": Boolean,
        "job": Boolean
    }
};
// create model if one does not exist.
module.exports = mongoose.model('user', userSchema, 'metropros');
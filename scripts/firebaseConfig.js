var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyDp070wfzXRM-fztapV6b7jw2X4c_PjStA",
    authDomain: "thesis-de1f8.firebaseapp.com",
    databaseURL: "https://thesis-de1f8.firebaseio.com",
    storageBucket: "thesis-de1f8.appspot.com",
    messagingSenderId: "737267225233"
};

firebase.initializeApp(config);

module.exports = firebase;

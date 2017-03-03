const gcloud = require('google-cloud');
const AWS = require('aws-sdk');
const axios = require('axios');
const firebase = require('./firebaseConfig');
const headers = require('./headers');
const requestHandlerAPI = require('./handlers/api');

AWS.config.loadFromPath('../awsConfig.json');
//import { headers, firebase } from './config';

const vision = gcloud.vision({
  projectId: 'thesis-de1f8',
  keyFilename: '../../keys/Thesis-b9fb73d56c41.json'
});
// const s3 = new AWS.S3();

const sendResponse = function (res, statusCode, headersSent, responseMessage) {
  //console.log(responseMessage);
  res.writeHead(statusCode, headersSent);
  res.end(responseMessage);
};

module.exports = {
  landing: (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.landing)`);
    sendResponse(res, 200, headers, 'Welcome the server for Crustaceans thesis project!');
  },

  login: (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.login)`);
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
      .then((user) => {
        requestHandlerAPI.getUserId(user, (obj) => {
          sendResponse(res, 201, headers, JSON.stringify(obj));
        });
      })
      .catch((error) => {
        console.log('error login: ', error);
        sendResponse(res, 401, headers, JSON.stringify(error));
      });
  },

  logout: (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.logout)`);
    firebase.auth().signOut().then(() => {
      console.log('success logout!');
      sendResponse(res, 201, headers, 'Sign-out successful!');
    }, (error) => {
      console.log('error logout: ', error);
      sendResponse(res, 401, '', 'User is not logged in');
    });
  },

  checkUserCredentials: (req, res) => {
    console.log(
      `Serving ${req.method} request for ${req.url} (inside requestHandler.checkUserCredentials)`
    );
    const user = firebase.auth().currentUser;
    if (user) {
      sendResponse(res, 200, headers, JSON.stringify(user));
    } else {
      sendResponse(res, 401, '', 'User is not logged in!');
    }
  },

  createUser: (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.createUser)`);
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
      .then((user) => {
        console.log('success createUser: ', user.email);
        requestHandlerAPI.usersCreate(user);
        sendResponse(res, 201, headers, JSON.stringify(user));
      })
      .catch((error) => {
        console.log('error createUser: ', error);
        sendResponse(res, 203, headers, JSON.stringify(error));
      });
  },

  deleteUser: (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.deleteUser)`);
    const user = firebase.auth().currentUser;
    if (user) {
      requestHandlerAPI.usersDelete(user);
      user.delete()
        .then((success) => {
          console.log('success deleteUser: ', success);
          sendResponse(res, 201, '', 'User deleted!');
        })
        .catch((error) => {
          console.log('error deleteUser: ', error);
          sendResponse(res, 401, '', 'User not logged in, or doesn\'t exist!');
        });
      } else {
        sendResponse(res, 401, '', 'User not logged in, or doesn\'t exist!');
      }
  },

  postImage: (req, res) => {
    //http://localhost:8084/imageMockRoute
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.postImage)`);
    // const randomImageName = `${Math.random()}.jpg`;
    const imageData = new Buffer(req.body.imageBuffer, 'base64');

    axios({
        method: 'post',
        url: 'http://54.202.3.62:8084/setImage',
        data: { imageBuffer: imageData }
      })
      .then((response) => {
        console.log('image successfuly posted', response.data);
        sendResponse(res, 201, headers, response.data);
      })
      .catch((error) => {
        console.log('AXIOS ERROR', error);
        sendResponse(res, 404, '', 'Error');
      });
  },

  compareImage: (req, res) => {
    //http://localhost:8084/imageMockRoute
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.compareImage)`);
    // const randomImageName = `${Math.random()}.jpg`;
    const imageData = new Buffer(req.body.imageBuffer, 'base64');

    axios({
        method: 'post',
        url: 'http://54.202.3.62:8084/compareImage',
        data: { imageBuffer: imageData, referenceImageId: req.body.referenceImageId }
      })
      .then((response) => {
        console.log('image successfuly posted', response);
        sendResponse(res, 201, headers, response.data);
      })
      .catch((error) => {
        console.log('AXIOS ERROR', error);
        sendResponse(res, 404, '', 'Error');
      });
  },
};

const gcloud = require('google-cloud');
const AWS = require('aws-sdk');
const axios = require('axios');
const firebase = require('./firebaseConfig');
const headers = require('./headers');
const requestHandlerAPI = require('./handlers/api');

AWS.config = require('../awsConfig.json');
//import { headers, firebase } from './config';

const imageServerUrl = 'http://54.202.3.62:8084';
// const imageServerUrl = 'http://localhost:8084';

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
        requestHandlerAPI.usersCreate(user, (obj) => {
          sendResponse(res, 201, headers, JSON.stringify(obj));
        });
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

  updateUserPassword: (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.updateUserPassword)`);
    const { newPassword1 } = req.body;
    console.log(newPassword1);
    const user = firebase.auth().currentUser;

    if (user) {
      user.updatePassword(newPassword1)
        .then((success) => {
          console.log('success password update: ', success);
          sendResponse(res, 201, '', 'Password Updated!');
        })
        .catch((error) => {
          console.log('error deleteUser: ', error);
          sendResponse(res, 401, '', 'User not logged in, or doesn\'t exist!');
        });
      } else {
        console.log('user not even logged in');
        sendResponse(res, 401, '', 'User not logged in, or doesn\'t exist!');
      }
  },

  postImage: (req, res) => {
    //http://localhost:8084/imageMockRoute
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.postImage)`);
    // const randomImageName = `${Math.random()}.jpg`;
    const imageData = new Buffer(req.body.imageBuffer, 'base64');
    const { targetImageLatitude, targetImageLongitude, targetImageAllowedDistance } = req.body;

    axios({
        method: 'post',
        url: `${imageServerUrl}/setImage`,
        data: { 
          imageBuffer: imageData,
          targetImageLatitude,
          targetImageLongitude, 
          targetImageAllowedDistance
        }
      })
      .then((response) => {
        sendResponse(res, 201, headers, JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log('AXIOS ERROR');
        sendResponse(res, 404, '', 'Error');
      });
  },

  postProfilePic: (req, res) => {
    //http://localhost:8084/imageMockRoute
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.postProfilePic)`);
    // const randomImageName = `${Math.random()}.jpg`;
    const imageData = new Buffer(req.body.imageBuffer, 'base64');
    const { email } = req.body;

    axios({
        method: 'post',
        url: `${imageServerUrl}/postProfilePic`,
        data: { 
          imageBuffer: imageData,
          email
        }
      })
      .then((response) => {
        console.log('Profile Pic Changed', response.data);
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
    const { userImageLatitude, userImageLongitude } = req.body;
    axios({
        method: 'post',
        url: `${imageServerUrl}/compareImage`,
        data: { 
          imageBuffer: imageData, 
          referenceImageId: req.body.referenceImageId,
          userImageLatitude,
          userImageLongitude
        }
      })
      .then((response) => {
        sendResponse(res, 201, headers, response.data);
      })
      .catch((error) => {
        console.log('IMAGE NOT COMPARED AXIOS ERROR', error);
        sendResponse(res, 404, '', 'Error');
      });
  },
};

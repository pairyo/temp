'use strict';

var qiniu = require('qiniu');
var request = require('request');
var urlencode = require('urlencode');
var config = require('./config');
var express = require("express");
var cors = require('cors');

var app = express();

/*
 * possible states of a pfop requst
 * @const
 */
var STATE = {
  SUCC: 0,
  WAIT: 1,
  PROCESSING: 2,
  PROCESSING_FAILED: 3,
  SUBMIT_FAILED: 4
};

/*
 * configure qiniu
 */
qiniu.conf.ACCESS_KEY = config.qiniu.access_key;
qiniu.conf.SECRET_KEY = config.qiniu.secret_key;

// function uptoken(bucketname) {
//   var putPolicy = new qiniu.rs.PutPolicy(bucketname);
//   return putPolicy.token();
// }

function callback(err, result, response) {
  var persistentId = (eval(result).persistentId);
  var statusURL = "http://api.qiniu.com/status/get/prefop?id=" + urlencode(persistentId.toString());

  function check_status(statusURL) {
    request(statusURL, function(error, reponse, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);

        switch (result.code) {
          case STATE.SUCC:
            var resultURL;
            var items = result.items;
            for (var i = 0; i < items.length; ++i) {
              resultURL = config.qiniu.domain + '/' + items[i].key;
              console.log(resultURL);
            }
            break;

          case STATE.WAIT:
          case STATE.PROCESSING:
            console.log('still processing');
            check_status(statusURL);
            break;

          case STATE.PROCESSING_FAILED:
            console.log('processing failed!');
            break;

          case STATE.SUBMIT_FAILED:
            console.log('submit failed!');
            break;

          default:
            console.log("unknown state!");
        }
      } else {
        console.log("query status failed!");
      }
    });
  }

  check_status(statusURL);
}

qiniu.fop.pfop(config.qiniu.bucket, 'oceans-clip.mp4', 'avthumb/mp4/s/300x300', {}, callback);

app.use(cors());

app.get('/*', function(req, res) {
  console.log(req);
  res.send('hello world');
});

app.listen(config.port, function(){
  console.log('CORS-enabled');
});

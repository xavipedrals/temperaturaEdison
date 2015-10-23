var express = require('express');

var mraa = require('mraa'); //require mraa
var fs = require('fs');
var express = require('express');
var http = require('http');
var request = require('request');
var bodyParser = require('body-parser');


console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console
var myAnalogPin = new mraa.Aio(0);

var motorpin1 = new mraa.Gpio(8);
var motorpin2 = new mraa.Gpio(9);
var motorpin3 = new mraa.Gpio(10);
var motorpin4 = new mraa.Gpio(11);

motorpin1.mode(mraa.DIR_OUT);
motorpin2.mode(mraa.DIR_OUT);
motorpin3.mode(mraa.DIR_OUT);
motorpin4.mode(mraa.DIR_OUT);

var delayTime = 5;
var ledTouch = 6;
var touch=5;

var tMax = 26;
var tMin = 20;

var estaPujant = false;

var temperatura = 0;

var app = express();

app.use(bodyParser.json());

app.use('/temperatura',  function(req, res){
  res.status(200).send({temperatura: temperatura});
});

app.use('/motors', function(req, res){
  var moviment = req.body.moviment;
  console.log("moviment " + moviment);
  var steps = 1200;
  var i = 0;

  if (moviment === 0){ //pujar
    function doARoll(n){
      // console.log("Loop " + n);
      setTimeout(function(){
        motorpin1.write(1);
        motorpin2.write(0);
        motorpin3.write(0);
        motorpin4.write(0);
        setTimeout(function(){
          motorpin1.write(0);
          motorpin2.write(1);
          motorpin3.write(0);
          motorpin4.write(0);
          setTimeout(function(){
            motorpin1.write(0);
            motorpin2.write(0);
            motorpin3.write(1);
            motorpin4.write(0);
            setTimeout(function(){
              motorpin1.write(0);
              motorpin2.write(0);
              motorpin3.write(0);
              motorpin4.write(1);
              if(n > 0)doARoll(n-1);

            },delayTime);
          },delayTime);
        },delayTime);
      },delayTime);
    }
    doARoll(steps);
    res.status(200).send("Amuuuuunt");
  }
  else {
    function doARoll2(n){
      // console.log("Loop " + n);
      setTimeout(function(){
        motorpin1.write(0);
        motorpin2.write(0);
        motorpin3.write(0);
        motorpin4.write(1);
        setTimeout(function(){
          motorpin1.write(0);
          motorpin2.write(0);
          motorpin3.write(1);
          motorpin4.write(0);
          setTimeout(function(){
            motorpin1.write(0);
            motorpin2.write(1);
            motorpin3.write(0);
            motorpin4.write(0);
            setTimeout(function(){
              motorpin1.write(1);
              motorpin2.write(0);
              motorpin3.write(0);
              motorpin4.write(0);
              if(n > 0)doARoll2(n-1);

            },delayTime);
          },delayTime);
        },delayTime);
      },delayTime);
    }
    doARoll2(steps);
    res.status(200).send("Avaaaall");
  }


});

console.log("Hola champion");

// We need this to build our post string
var querystring = require('querystring');
var stillPosting = false;

var url = "https://tranquil-sea-4354.herokuapp.com/temperatura";


// var temperatura = 0;
// var tMax = 30;
// var tMin = 24;
var B = 3975;

setInterval(function () {
  var a = myAnalogPin.read();
  console.log("Analog Pin (A0) Output: " + a);
  var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
  //console.log("Resistance: "+resistance);
  temperatura = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;

  if(temperatura > 26 && !stillPosting){
    stillPosting = true;
    //inici request
    var data = {
      temperatura: temperatura
    };
    console.log(data.temperatura);

    request(
    {
      url: url,
      method: "POST",
      json: data

    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body)
      }
      else {
        // console.log("error: " + error)
        // console.log("response.statusCode: " + response.statusCode)
        // console.log("response.statusText: " + response.statusText)
      }
      stillPosting = false;
    });
    //CODI GUARROOOOOO
    var steps = 600;
    var i = 0;
    if(!estaPujant){
      estaPujant = true;
      function doARoll(n){
        // console.log("Loop " + n);
        setTimeout(function(){
          motorpin1.write(1);
          motorpin2.write(0);
          motorpin3.write(0);
          motorpin4.write(0);
          setTimeout(function(){
            motorpin1.write(0);
            motorpin2.write(1);
            motorpin3.write(0);
            motorpin4.write(0);
            setTimeout(function(){
              motorpin1.write(0);
              motorpin2.write(0);
              motorpin3.write(1);
              motorpin4.write(0);
              setTimeout(function(){
                motorpin1.write(0);
                motorpin2.write(0);
                motorpin3.write(0);
                motorpin4.write(1);
                if(n > 0)doARoll(n-1);

              },delayTime);
            },delayTime);
          },delayTime);
        },delayTime);
      }
      doARoll(steps);
    }
    estaPujant = false;

    // function doARoll(n){
    //   // console.log("Loop " + n);
    //   setTimeout(function(){
    //     motorpin1.write(1);
    //     motorpin2.write(0);
    //     motorpin3.write(0);
    //     motorpin4.write(0);
    //     setTimeout(function(){
    //       motorpin1.write(0);
    //       motorpin2.write(1);
    //       motorpin3.write(0);
    //       motorpin4.write(0);
    //       setTimeout(function(){
    //         motorpin1.write(0);
    //         motorpin2.write(0);
    //         motorpin3.write(1);
    //         motorpin4.write(0);
    //         setTimeout(function(){
    //           motorpin1.write(0);
    //           motorpin2.write(0);
    //           motorpin3.write(0);
    //           motorpin4.write(1);
    //           if(n > 0)doARoll(n-1);
    //
    //         },delayTime);
    //       },delayTime);
    //     },delayTime);
    //   },delayTime);
    // }
    // doARoll(steps);


    //dasdsdsas
  }
  console.log("Celsius Temperature "+temperatura);
}, 5000);


http.createServer(app).listen(8080);

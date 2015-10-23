var mraa = require('mraa'); //es la llibreria per interactuar amb els pins d'Arduino
var fs = require('fs'); //serveix per llegir fitxers escrits en Arduino, en aquest projecte no el faig servir tot i que l'incloc
var express = require('express'); //és el servidor en si
var http = require('http'); //és obligatori
var request = require('request'); //és per fer peticions al servidor on es guarden les dades
var bodyParser = require('body-parser'); //és per llegir dades en JSON adjuntes en un petició entrant

console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console
var myAnalogPin = new mraa.Aio(0);  //pin sensor temperatura

//pins motors
var motorpin1 = new mraa.Gpio(8);
var motorpin2 = new mraa.Gpio(9);
var motorpin3 = new mraa.Gpio(10);
var motorpin4 = new mraa.Gpio(11);

motorpin1.mode(mraa.DIR_OUT);
motorpin2.mode(mraa.DIR_OUT);
motorpin3.mode(mraa.DIR_OUT);
motorpin4.mode(mraa.DIR_OUT);

//constants
var B = 3975; //Aquesta serveix per calcular la temperatura
var delayTime = 5;
var ledTouch = 6;
var touch=5;
var tMax = 26;
var tMin = 20;

//variables globals
var estaPujant = false;
var temperatura = 0;

var app = express();

app.use(bodyParser.json());

//endpoint temperatura
app.use('/temperatura',  function(req, res){
  res.status(200).send({temperatura: temperatura});
});

//endpoint motors
//serveix per fer girar els motors amunt o avall
app.use('/motors', function(req, res){
  var moviment = req.body.moviment; //agafa el JSON adjunt a la petició i grada en vriable
  console.log("moviment " + moviment);
  var steps = 1200;
  var i = 0;

  if (moviment === 0){ //pujar
    function doARoll(n){
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
    res.status(200).send("Amuuuuunt"); //Respon al servidor
  }
  else {
    function doARoll2(n){ //baixar
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
    res.status(200).send("Avaaaall"); //Respon al servidor
  }
});

// We need this to build our post string
var querystring = require('querystring');
var stillPosting = false;

var url = "https://tranquil-sea-4354.herokuapp.com/temperatura";


//Aquest codi s'executa periòdicament (loop)
setInterval(function () {
  var a = myAnalogPin.read();
  console.log("Analog Pin (A0) Output: " + a);
  var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
  temperatura = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;
  console.log("Celsius Temperature "+temperatura);

  if(temperatura > tMax && !stillPosting){  //si la temperatura supera el màxim avisa al servidor
    stillPosting = true;
    //inici http request
    request({
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
    //fi http request
    //CODI GUARROOOOOO per fer moure automàticament el motor si temperatura > tMax sense esperar una ordre del servidor
    //NOTA: És un copy paste de més amunt
    var steps = 600;
    var i = 0;
    if(!estaPujant){  //variable que controla si el motor ja esta pujant
      estaPujant = true;
      function doARoll3(n){
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
                if(n > 0)doARoll3(n-1);

              },delayTime);
            },delayTime);
          },delayTime);
        },delayTime);
      }
      doARoll3(steps);
    }
    estaPujant = false;
  }
}, 5000);

//això és la linia que realment crea el servidor en base la variable app (té els endpoints)
http.createServer(app).listen(8080);

/**
 * Created by Letty on 04/11/15.
 */

var request = require('request');
var Canvas = require('drawille-canvas');
var d3 = require('d3');
var fs = require('fs');
var cheerio = require('cheerio');

var shipid = '6584';
var url = 'https://www.marinetraffic.com/map/getvesselxml/shipid:' + shipid;
var world = JSON.parse(fs.readFileSync('world.json'));

var options = {
	url: url,
	method: 'GET',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:41.0) Gecko/20100101 Firefox/41.0',
		'Referer': 'https://www.marinetraffic.com/en/ais/home/shipid:' + shipid + '/zoom:10',
		'Cookie': 'SERVERID=www8; CAKEPHP=od9m1bqckus39s1e1sge36of86; vTo=1; stationReceptionFilterAlertCounter=0'
	}
};


var canvas = new Canvas();
var ctx = canvas.getContext('2d');

function draw() {
	request(options, function (error, response, body) {
		// better use the api instead of that shit..

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		var $ = cheerio.load(body);
		var shipAttributes = $('V_POS')[0].attribs;
		var long = shipAttributes.lon;
		var lat = shipAttributes.lat;

		var w = canvas.width / 2;
		var h = canvas.height / 2;

		var projection = d3.geo.mercator()
			.scale(550)
			.translate([w, h])
			.center([long, lat]);

		var path = d3.geo.path()
			.projection(projection)
			.context(ctx);

		path(world);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(w + 1, h);
		ctx.lineTo(w - 1, h);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(w, h + 2);
		ctx.lineTo(w, h);
		ctx.stroke();

		console.log(ctx._canvas.frame());
	});
}

setInterval(draw, 5000);
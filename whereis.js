/**
 * Created by Letty on 04/11/15.
 */

var request = require('request');
var Canvas = require('drawille-canvas');
var d3 = require('d3');
var fs = require('fs');
var cheerio = require('cheerio');
var color = require('colors');

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

		var _frame = ctx._canvas.frame();
		var _lines = [];
		for (var i = 0; i < process.stdout.rows; i++) {
			_lines.push(_frame.substr(i*process.stdout.columns, process.stdout.columns));
		};

		var _begin = Math.floor(process.stdout.columns/2)-1;
		var _end = Math.ceil(process.stdout.columns/2)+1;
		_lines.forEach(function(e, idx){
			if (Math.floor(process.stdout.rows/2) === idx || Math.ceil(process.stdout.rows/2) === idx) {
				_lines[idx] = e.substring(0,_begin).green + e.substring(_begin, _end).red.bold + e.substring(_end,process.stdout.columns).green;
			} else {
				_lines[idx] = e.green;
			}
		});
		console.log(_lines.join(""));

	});
}

setInterval(draw, 5000);
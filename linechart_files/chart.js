Date.formatted_time = function (text) {
	date = new Date(parseInt(text) * 1000);
	day = ("0" + date.getMonth()).substr(-2);
	month = ("0" + (date.getMonth()+1)).substr(-2);
	hours = ("0" + date.getHours()).substr(-2);
	minutes = ("0" + date.getMinutes()).substr(-2);
	return day + "/" + month + "\n" + hours + ":" + minutes;
}

function drawLegend(x, y, opts) {
	var lines = opts.chart.lines;
	var raphael = lines[0].paper;
	
	if (opts.title)
		raphael.g.text(x+15 , y+15, opts.title).attr({"text-anchor": "start"});
	for(var i=0; i < lines.length; i++) {
		var color = lines[i].attrs.stroke;
		var label_y = y + 15 * (i+2);
		var lineLegend = raphael.set();
		lineLegend.push(raphael.circle(x + 20, label_y, 5).attr({"stroke": color, "fill": color}));
		lineLegend.push(raphael.g.text(x + 30, label_y, opts.labels[i]).attr({"text-anchor": "start"}));
		(function(graphIndex) {
			var line = lines[graphIndex];
			lineLegend.hover(
				function () {
					line.attr({"stroke-width": 4});
				},
				function () {
					line.attr({"stroke-width": 2});
				}
			);
		})(i);
	}
	raphael.rect(x, y, 300, 15 * (lines.length + 2) );
}

function overwriteAxis(axis, transform) {
	var texts = axis.text;
	for(var i=0; i < texts.length; i++) {
		var text = texts[i];
		var new_text = (transform || Date.formatted_time)(text.attrs.text);
		text.attr("text", new_text);
		text.translate(0, 5);
	}
}

function setSymbolCallbacks(chart, time, values, units) {
	for (var i=0; i < chart.symbols.length; i++ ) {
		for (var j=0; j < chart.symbols[i].length; j++ ) {
			(function(graphIndex, valueIndex) {
				chart.symbols[graphIndex][valueIndex].hover(
					function () {
						var color = this.attrs.fill;
						var raphael = this.paper;
						var date = new Date(time[valueIndex] * 1000)
						var label = raphael.set();
						label.push(raphael.text(60, 12, values[graphIndex][valueIndex] + " " + units[graphIndex]).attr({font: '12px Helvetica, Arial', fill: "#fff"}));
						label.push(raphael.text(60, 27, date).attr({font: '10px Helvetica, Arial', fill: "#fff"}));
						this.tag = raphael.popup(this.attrs.cx + 5, this.attrs.cy, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7});
						this.label = label;
						this.attr("r", 6);
					},
					function () {
						this.tag && this.tag.remove();
						this.label && this.label.remove();
						this.attr("r", 4);
					}
				);
			})(i, j)
		}
	}
}

function drawChart(holder, opts) {
	var r = Raphael(holder);
	r.g.txtattr.font = "12px 'Fontin Sans', Fontin-Sans, sans-serif";

	var width = opts.width || 600;
	var height = opts.height || 200;
	var time = opts.time;
	var values = opts.values;
	var units = opts.units;
	var chartsNumber = values.length;
		
	if (typeof(opts.highValue) != "undefined")
		values.push([opts.highValue]);
	
	if (typeof(opts.lowValue) != "undefined")
		values.push([opts.lowValue]);
	
	if (opts.title)
		r.g.text((width+20)/2, 20, opts.title);
	var chart = r.g.linechart(20, 20, width, height, time, values, {shade: true, nostroke: false, axis: "0 0 1 1", symbol: "o", smooth: true});
  chart.symbols.attr({r: 4});

	for (var i=chartsNumber; i < values.length; i++) {
		chart.lines[i].remove();
		chart.lines.pop(i);
		chart.shades[i].remove();
		chart.shades.pop(i);
		chart.symbols[i].remove();
		chart.symbols.pop(i);
	}

	setSymbolCallbacks(chart, time, values, units);
	
	overwriteAxis(chart.axis[0]);
	
	drawLegend(15, height + 45, {chart: chart, labels: opts.labels, title: opts.legendTitle});
	
	return chart;
}

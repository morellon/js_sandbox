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
	
	var legend = raphael.set();
	
	if (opts.title)
		legend.push(raphael.g.text(x+15 , y+15, opts.title).attr({"text-anchor": "start"}));
	
	for(var i=0; i < lines.length; i++) {
		var color = lines[i].attrs.stroke;
		var label_y = y + 15 * (i+2);
		var legendItem = raphael.set();
		legendItem.push(raphael.circle(x + 20, label_y, 5).attr({"stroke": color, "fill": color}));
		legendItem.push(raphael.g.text(x + 30, label_y, opts.labels[i]).attr({"text-anchor": "start"}));
		(function(graphIndex) {
			var line = lines[graphIndex];
			legendItem.hover(
				function () {
					line.attr({"stroke-width": 4});
				},
				function () {
					line.attr({"stroke-width": 2});
				}
			);
		})(i);
		
		legend.push(legendItem);
	}
	
	legend.push(raphael.rect(x, y, 300, 15 * (lines.length + 2) ));
	
	return legend;
}

function defineChartArea(x, y, opts) {
	var width = opts.width;
	var height = opts.height;
	var chart = opts.chart;
	var raphael = chart.lines[0].paper;
	
	var column = raphael.rect(0,y,1,height).attr({fill: "#fff", "opacity": 0});
	var chartArea = raphael.rect(x,y,width,height).attr({fill: "#fff", "opacity": 0});
	chartArea.mousemove(function (e) {
		column.attr({opacity: 0.5, x: e.offsetX || (e.pageX - 373)});
	});
	chartArea.mouseout(function () {
		column.attr({opacity: 0, x: 0});
	});
	
	chartArea.selection = function (f) {
		var selection;
		chartArea.mousedown(function () {
			if (!selection) {
				selection = this.paper.rect(column.attrs.x, column.attrs.y, column.attrs.width, column.attrs.height).attr({stroke: "#404", fill: "#c0c", opacity: 0.3});
				// if selection rectangle is in front, the events won't work
				selection.toBack();
				
				selection.startValue = function () {
					var xStep = (chart.xValues[chart.xValues.length-1] - chart.xValues[0])/width;
					return ((this.attrs.x-x) * xStep) + chart.xValues[0];
				}
				selection.endValue = function () {
					var xStep = (chart.xValues[chart.xValues.length-1] - chart.xValues[0])/width;
					return ((this.attrs.x-x+this.attrs.width) * xStep) + chart.xValues[0];
				}
				
				selection.start = column.attrs.x;	
			}
		}).mousemove(function (e) {
			if (selection) {
				var width = column.attrs.x - selection.start;
				if (width >= 0)
					selection.attr({x: selection.start, width: width});
				else
					selection.attr({x: column.attrs.x, width: -width});
			}
		}).mouseup(function () {
			if (selection) {
				f && f(selection);
				selection.remove();
				selection = undefined;
			}
		}).mouseout(function () {
			if (selection) {
				f && f(selection);
				selection.remove();
				selection = undefined;
			}
		});
	}
	
	return chartArea;
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
				var symbol = chart.symbols[graphIndex][valueIndex];
				symbol.toFront();
				symbol.hover(
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
	var paddingTop = 20;
	var paddingLeft = 30;
	var time = opts.time;
	var values = opts.values;
	var units = opts.units;
	var chartsNumber = values.length;
		
	if (typeof(opts.highValue) != "undefined")
		values.push([opts.highValue]);
	
	if (typeof(opts.lowValue) != "undefined")
		values.push([opts.lowValue]);
	
	if (opts.title)
		r.g.text((width+paddingLeft)/2, paddingTop, opts.title);
	var chart = r.g.linechart(paddingLeft, paddingTop, width, height, time, values, {shade: true, nostroke: false, axis: "0 0 1 1", symbol: "o", smooth: true});
	chart.symbols.attr({r: 4});
	
	chart.xValues = time;
	chart.yValues = values;
	
	// remove highValue and lowValue graphics
	for (var i=chartsNumber; i < values.length; i++) {
		chart.lines[i].remove();
		chart.lines.pop(i);
		chart.shades[i].remove();
		chart.shades.pop(i);
		chart.symbols[i].remove();
		chart.symbols.pop(i);
	}
	
	chartArea = defineChartArea(paddingLeft, paddingTop, {width: width, height: height, chart: chart})
	chartArea.selection(function (sel) {console.log(Date.formatted_time(sel.endValue()))});

	setSymbolCallbacks(chart, time, values, units);
	
	overwriteAxis(chart.axis[0]);
	
	chart.legend = drawLegend(15, height + 45, {chart: chart, labels: opts.labels, title: opts.legendTitle});
	
	return chart;
}

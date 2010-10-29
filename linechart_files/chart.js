function drawLegend(r, x, y, opts) {
	lines = opts.chart.lines
	r.g.text(x+15 , y+15, opts.title).attr({"text-anchor": "start"});
	for(var i=0; i < lines.length; i++) {
		color = lines[i].attrs.stroke;
		label_y = y + 15 * (i+2);
		r.circle(x + 20, label_y, 5).attr({"stroke": color, "fill": color});
		r.g.text(x + 30, label_y, opts.labels[i]).attr({"text-anchor": "start"});
	}
	r.rect(x, y, 300, 15 * (lines.length + 2) );
}

function manipulateAxis(axis, transform) {
	var text = axis.text
	for(var i=0; i < text.length; i++) {
		text[i].attr({text: transform(text[i].attrs.text)}).translate(0, 5)
	}
}

function drawChart(holder, opts) {
	var r = Raphael(holder);
    r.g.txtattr.font = "12px 'Fontin Sans', Fontin-Sans, sans-serif";

    r.g.text(100, 20, opts.title);
	var width = 680;
	var height = 400;
	var time = opts.time
	var values = opts.values;

    var chart = r.g.linechart(20, 20, width, height, time, values, {shade: true, nostroke: false, axis: "0 0 1 1", symbol: "o", smooth: true});
    chart.symbols.attr({r: 4});
	
	for (var i=0; i < chart.symbols.length; i++ ) {
		for (var j=0; j < chart.symbols[i].length; j++ ) {
			(function(graphIndex, valueIndex) {
				chart.symbols[graphIndex][valueIndex].hover(
					function () {
						this.attr("r", 6);
						color = this.attrs.fill;

						var label = r.set();
						label.push(r.text(60, 12, values[graphIndex][valueIndex] + " hits").attr({font: '12px Helvetica, Arial', fill: "#fff"}));
						date = new Date(time[valueIndex] * 1000)
					    label.push(r.text(60, 27, date).attr({font: '10px Helvetica, Arial', fill: "#fff"}));
						this.label = label;

						this.tag = r.popup(this.attrs.cx + 5, this.attrs.cy, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7});
					},
					function () {
						this.attr("r", 4);
						this.tag && this.tag.remove();
						this.label && this.label.remove();
					}
				);
			})(i, j)
		}
	}
	
	manipulateAxis(chart.axis[0], function (text) {
		date = new Date(parseInt(text) * 1000);
		day = ("0" + date.getMonth()).substr(-2);
		month = ("0" + (date.getMonth()+1)).substr(-2);
		hours = ("0" + date.getHours()).substr(-2);
		minutes = ("0" + date.getMinutes()).substr(-2);
		formatted_date = day + "/" + month + "\n" + hours + ":" + minutes;
		return formatted_date;
	});
	
	drawLegend(r, 15, height + 45, {chart: chart, labels: opts.labels, title: opts.legendTitle});
	
	return chart;
}

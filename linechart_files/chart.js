function drawChart(holder, opts) {
	var r = Raphael("holder");
    r.g.txtattr.font = "12px 'Fontin Sans', Fontin-Sans, sans-serif";

    r.g.text(100, 20, opts.title);
	var width = 680;
	var height = 400;
	var time = opts.time
	var values = opts.values;

    var chart = r.g.linechart(20, 20, width, height, time, values, {shade: true, nostroke: false, axis: "0 0 1 1", symbol: "o", smooth: true});
    chart.symbols.attr({r: 4});
	
	chart.symbols.hover(
		function () {
			this.attr("r", 6);
			color = this.attrs.fill;
	
			var label = r.set();
			label.push(r.text(60, 12, " hits").attr({font: '12px Helvetica, Arial', fill: "#fff"}));
		    label.push(r.text(60, 27, "22 September 2008").attr({font: '10px Helvetica, Arial', fill: "#fff"}));
			this.label = label;

			this.tag = r.popup(this.attrs.cx + 5, this.attrs.cy, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7});
		},
		function () {
			this.attr("r", 4);
			this.tag && this.tag.remove();
			this.label && this.label.remove();
		}
	);

	var legendHeight = height + 50;
	r.g.text(15, legendHeight, opts.legendTitle).attr({"text-anchor": "start"});
	for(var i=0; i < chart.lines.length; i++) {
		color = chart.lines[i].attrs.stroke;
		labelHeight = legendHeight + 15 * (i+1);
		r.circle(20, labelHeight, 5).attr({"stroke": color, "fill": color});
		r.g.text(30, labelHeight, opts.labels[i]).attr({"text-anchor": "start"});
	}
	r.rect(0, legendHeight - 15, 300, 15 * (chart.lines.length + 2) );
	
	return chart;
}

define(['jquery', 'knockout', 'd3', 'text!./risk-plot.html'], function($, ko, d3, templateMarkup) {


	function RiskPlot (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true)
		self.data = params.data;
		
		self.xAxisLabel='Risk';
		self.yAxisLabel='Budget';

		self.config = params.data.layout || ko.observable('a=/bcd2/2e3f;f=/ghij/klm/o2p3qr;');		
		
		$( window ).resize(function() {
			if(self.config() !== ''){
				//self.resize()
			}
		})
		
		
		// list variable common to both render() and update()
		self.x=null;
		self.y=null;
		self.xAxis=null;
		self.yAxis=null;
		self.svg = null;
		
		if ( $(self.element.parentElement).width() < 400){
			var margin = {t:6, r:6, b:6, l:6 };
			self.width = $(self.element.parentElement).width() - margin.l - margin.r;
			self.height = $(self.element.parentElement).height() - margin.t - margin.b;
			sizeCircle=5;
		}else{
			var margin = {t:30, r:20, b:20, l:65 };
			var sizeCircle = 8;
			self.width = $(self.element.parentElement).width() - margin.l - margin.r;
			self.height = $(self.element.parentElement).height() - margin.t - margin.b;
			
		}
		//debugger;

		self.render = function() {

		var data=self.data();
		
		self.x = d3.scale.linear().domain([0,100]).range([0, self.width - margin.r]),
		self.y = d3.scale.linear().domain([0,100]).range([self.height - margin.l, 0]),
	
		color = d3.scale.category10();//G colors that will reflect the STs

		// Add the svg canvas
		self.svg = d3.select(self.element).append("svg")
			.attr("width", self.width + margin.l + margin.r)
			.attr("height", self.height + margin.t + margin.b);
			
		backgroundColor();	//R Call background color function
				
		//R set axes, as well as details on their ticks
		self.xAxis = d3.svg.axis()
			.scale(self.x)
			.ticks(10)
			.tickSubdivide(true)
			.tickSize(6, 3, 0)
			.orient("bottom");
		self.yAxis = d3.svg.axis()
			.scale(self.y)
			.ticks(10)
			.tickSubdivide(true)
			.tickSize(6, 3, 0)
			.orient("left");

	
	// group that will contain all of the plots
	var groups = self.svg.append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")");
 //Draw the Rectangle

	// array of the regions, used for the legend
	var stratThrust = ["ST1", "ST2", "ST3", "ST4", "ST5", "ST6"]



	// sort data alphabetically by region, so that the colors match with legend
	data.sort(function(a, b) { return d3.ascending(a.stratThrust, b.stratThrust); })
	

	// style the circles, set their locations based on data
	var circles =
	groups.selectAll("circle")
		.data(data)
		.enter().append("circle")
		.attr("class", "circles")
		

		.attr({
		cx: function(d) { return self.x(+d[self.xAxisLabel]); },
		cy: function(d) { return self.y(+d[self.yAxisLabel]); },
		r: sizeCircle,
		id: function(d) { return d.techChall; }
		})
		.style("fill", function(d) { return color(d.stratThrust); });

	// what to do when we mouse over a bubble
	
	var mouseOn = function() { 
	
		var circle = d3.select(this);

	// transition to increase size/opacity of bubble
		circle.transition()
		.duration(800).style("opacity", 1)
		.attr("r", 16).ease("elastic");

		// append lines to bubbles that will be used to show the precise data points.
		// translate their location based on margins
		self.svg.append("g")
			.attr("class", "guide")
		.append("line")
			.attr("x1", circle.attr("cx"))
			.attr("x2", circle.attr("cx"))
			.attr("y1", +circle.attr("cy") + 26)
			.attr("y2", self.height - margin.t - margin.b)
			.attr("transform", "translate(65,20)")
			.style("stroke", circle.style("fill"))
			.transition().delay(200).duration(400).styleTween("opacity", 
						function() { return d3.interpolate(0, .5); })

		self.svg.append("g")
			.attr("class", "guide")
		.append("line")
			.attr("x1", +circle.attr("cx") - 16)
			.attr("x2", 0)
			.attr("y1", circle.attr("cy"))
			.attr("y2", circle.attr("cy"))
			.attr("transform", "translate(65,30)")
			.style("stroke", circle.style("fill"))
			.transition().delay(200).duration(400).styleTween("opacity", 
						function() { return d3.interpolate(0, .5); });

	// function to move mouseover item to front of SVG stage, in case
	// another bubble overlaps it
		d3.selection.prototype.moveToFront = function() {
			
			return this.each(function() { 
			this.parentNode.appendChild(this); 
			}); 
		};


	};
	// what happens when we leave a bubble?
	var mouseOff = function() {
		var circle = d3.select(this);
	
		// go back to original size and opacity
		circle.transition()
		.duration(800).style("opacity", 1)
		.attr("r", 8).ease("elastic");

		// fade out guide lines, then remove them
		d3.selectAll(".guide").transition().duration(100).styleTween("opacity", 
						function() { return d3.interpolate(.5, 0); })
			.remove()
	};

	// run the mouseon/out functions
	circles.on("mouseover", mouseOn);
	circles.on("mouseout", mouseOff);
	
	// tooltips (using jQuery plugin tipsy)
	circles.append("title")
			.text(function(d) {	 return d.techChall; })
			

	// the legend color guide
	if (self.width > 450){ //Remove axes and labels for small sizes
		var legend = self.svg.selectAll("rect")
			.data(stratThrust, function(d){return d;})
		.enter().append("rect")
		.attr({
			x: function(d, i) { return (margin.l + 20 + i*80); },
			y: self.height+25,
			width: 25,
			height: 12
		})
		
		.style("fill", function(d) { return color(d); });


	// legend labels	
		self.svg.selectAll("text")
			.data(stratThrust)
			
		.enter().append("text")
				.attr({
		x: function(d, i) { return (margin.l + 20 + i*80+28); },
		y: self.height + 36,
		})
		.style("fill", "15px")
		.text(function(d) { return d; });
		
	// draw axes and axis labels
	self.svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + margin.l + "," + (self.height - margin.l + margin.t) + ")")
		.call(self.xAxis);

	self.svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.l + "," + margin.t + ")")
		.call(self.yAxis);

	self.svg.append("text")
		.style("font-size", "14px")
		.attr("class", "x label")
		.attr("x", margin.l + self.width / 2)
		.attr("y", self.height + 15)
		.text(self.xAxisLabel);

	self.svg.append("text")
		.style("font-size", "14px")
		.attr("class", "y label")
		.attr("text-anchor", "middle")
		.attr("x", -self.height/2)
		.attr("y", 10)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text(self.yAxisLabel);
	}
		
		
		function backgroundColor(){

		//Set background color
	var sizeRegionColor = self.height-margin.l;
	var opacityDegree=0.45;
//Apply the layout to the graph
self.svg.append("rect")
	.attr("x", margin.l)
	.attr("y", margin.t)
	.attr("width", self.width-margin.r)
	.attr("height", sizeRegionColor)
	.attr("fill",'white')
	.attr("fill-opacity",1);	

//Define gradient layout
	var gradient = self.svg.append("svg:defs")
	.append("svg:linearGradient")
	.attr("id", "gradient")
	.attr("x1", "0%")
	.attr("y1", "100%")
	.attr("x2", "100%")
	.attr("y2", "0%")
	.attr("spreadMethod", "pad");
	 
// Define the gradient colors
gradient.append("svg:stop")
	.attr("offset", "10%")
	.attr("stop-color", "green")
	.attr("stop-opacity", 1);
gradient.append("svg:stop")
	.attr("offset", "50%")
	.attr("stop-color", "orange")
	.attr("stop-opacity", 1);	
gradient.append("svg:stop")
	.attr("offset", "90%")
	.attr("stop-color", "red")
	.attr("stop-opacity", 1);

//Apply the layout to the graph
self.svg.append("rect")
	.attr("x", margin.l)
	.attr("y", margin.t)
	.attr("width", self.width-margin.r)
	.attr("height", sizeRegionColor)
	.attr("fill",'url(#gradient)')
	.attr("fill-opacity",opacityDegree);
	
	
}	
		
		
		
		
		
		
		this.firstRender(false);
		
		}
		
		self.resize = function(){
		
		// Check if the lower limit is reached 
		if ( $(self.element.parentElement).width() < 400){
			var margin = {t:6, r:6, b:6, l:6 };
			self.width = $(self.element.parentElement).width() - margin.l - margin.r;
			self.height = $(self.element.parentElement).height() - margin.t - margin.b;
			sizeCircle=5;
		}else{
			var margin = {t:30, r:20, b:20, l:65 };
			var sizeCircle = 8;
			self.width = $(self.element.parentElement).width() - margin.l - margin.r;
			self.height = $(self.element.parentElement).height() - margin.t - margin.b;
		}
		
		//Define transition parameters
		var transDuration = 5;
		var transition = self.svg.transition().duration(transDuration);
		
		// Change the size of the svg container
		self.svg.attr("width", self.width + margin.l + margin.r);
		self.svg.attr("height", self.height + margin.t + margin.b);
		
		//Change the size of the axes
		self.x = d3.scale.linear().domain([0, 100]).range([0, self.width]);
		self.y = d3.scale.linear().domain([0, 100]).range([self.height - margin.l, 0]);
		
		self.xAxis = d3.svg.axis()
			.scale(self.x)
			.ticks(10)
			.tickSubdivide(true)
			.tickSize(6, 3, 0)
			.orient("bottom");
		self.yAxis = d3.svg.axis()
			.scale(self.y)
			.ticks(10)
			.tickSubdivide(true)
			.tickSize(6, 3, 0)
			.orient("left");
		
		transition.select("g.x.axis").call(self.xAxis);	
		transition.select("g.y.axis").call(self.yAxis);
		
		//Change the size of the background	
		self.svg.selectAll("rect")
			.attr("x", margin.l)
			.attr("y", margin.t)
			.attr("width", self.width)
			.attr("width", self.height);
		//backgroundColor();		
		}
		
		
		self.update = function() {
			var data = self.data();
			var transDuration = 2500;
			//Define the transition (in ms)
			var transition = self.svg.transition().duration(transDuration);

		self.xAxis = d3.svg.axis()
			.scale(self.x)
			.ticks(10)
			.tickSubdivide(true)
			.tickSize(6, 3, 0)
			.orient("bottom");
		self.yAxis = d3.svg.axis()
			.scale(self.y)
			.ticks(10)
			.tickSubdivide(true)
			.tickSize(6, 3, 0)
			.orient("left");

			
		//Update name of y-axis
			self.svg.select(".y.label")
				.text(self.yAxisLabel);
		//Update name of x-axis
			self.svg.select(".x.label")
				.text(self.xAxisLabel);
		var circles = self.svg.selectAll("g circle");
		circles.data(data);
	
	circles.transition().duration(transDuration)
	.attr({
		cx: function(d) { return self.x(d[self.xAxisLabel]); },
		cy: function(d) { return self.y(d[self.yAxisLabel]); },
		r: sizeCircle,
		id: function(d) { return d.techChall; }
		})
		

		}
		
		

		self.reactor = ko.computed(function() {
			var data = self.data;
			//debugger;
			if (typeof data !== 'undefined') {
				if (self.firstRender()) {
					self.render()
				} else {
					self.update()
				}
			}
			return data;
		})
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	RiskPlot.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: RiskPlot
		},
		template: templateMarkup
	};





		

});


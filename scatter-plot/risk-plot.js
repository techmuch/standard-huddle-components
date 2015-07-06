define(['jquery', 'knockout', 'd3', 'text!./scatter-plot.html'], function($, ko, d3, templateMarkup) {

	function ScatterPlot(params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true)

		self.data = params.data

		self.x = null;
		self.y = null;
		self.xAxis = null;
		self.yAxis = null;
		self.svg = null;

		//debugger;

		self.render = function() {
			var data = self.data();
			//debugger;
			var widthpx = self.width = $(self.element).width();
			var heightpx = self.height = $(self.element).height();

			var margin = {
					top: 50,
					right: 30,
					bottom: 50,
					left: 50
				},
				width = widthpx - margin.left - margin.right,
				height = heightpx - margin.top - margin.bottom;

			self.x = d3.scale.linear()
				.domain([d3.min(data.data, function(d) {
					return d.x;
				}), d3.max(data.data, function(d) {
					return d.x;
				})])
				.range([0, width]);

			self.y = d3.scale.linear()
				.domain([d3.min(data.data, function(d) {
					return d.y;
				}), d3.max(data.data, function(d) {
					return d.y;
				})])
				.range([height, 0]);

			self.xAxis = d3.svg.axis()
				.scale(self.x)
				.orient("bottom");

			self.yAxis = d3.svg.axis()
				.scale(self.y)
				.orient("left");
			//debugger;
			self.svg = d3.select(this.element).append("svg")
				.datum(data.data)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			self.svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.attr("font-size", "17")
				.call(self.xAxis);

			//X-axis data label

			self.svg.append("g")
				.attr("class", "y axis")
				.attr("font-size", "17")
				.call(self.yAxis);

			var maxRadius = 15;
			var maxTotal = d3.max(data.data, function(d) {
				return d.total;
			});

			//ADD THE DATA POINTS (BLUE CIRECLES)
			self.svg.selectAll(".dot") //select the class "dot"
				.data(data.data)
				.enter().append("circle")
				//.attr("d", path)
				.on("mouseover", function(d) {
					//d3.select(self)
					self.svg.append("text")
						//Moved up from below y location //
						.attr("fill", "white")
						.attr("style", "font-size: 20")
						.text(d.design)
						//End Moved up from below y location //
						.attr("class", "designID")
						.attr("x", function() {
							if ((self.x(d.x) + 10 + $(".designID").width()) < (width)) {
								return self.x(d.x) + 10;
							} else {
								return self.x(d.x) - ($(".designID").width());
							}
						})
						//mouse location (x) minus margin
						/* .attr("x", function () {
						return x(d.x) + 5;
					}) */
						.attr("y", function() {
							return self.y(d.y) - 5;
						}) //mouse location (y) minus margin and some padding for better text display

				})
				.attr("class", function(d) {
					if (typeof d.x != 'undefined') {
						return "leader " + d.cid.split(' ').join('');
					}
				})
				.attr("cx", function(d) {
					return self.x(d.x);
				})
				.attr("cy", function(d) {
					return self.y(d.y);
				})
				.attr("r", function(d) {
					if (typeof d.total === 'number') {
						return d.total / maxTotal * maxRadius;
					} else {
						return 10
					}
				})
				.on("mouseout", function(d) {
					//remove the text element added on the mouseover event when the mouseout event is triggered
					$("text.designID").remove();
				})
				.on("click", function(d) {})

			this.firstRender(false);
		};

		self.update = function() {
			var data = self.data()

			var transDuration = 2500;

			//Define the transition (in ms)
			var transition = self.svg.transition().duration(transDuration);

			var widthpx = self.width = $(self.element).width();
			var heightpx = self.height = $(self.element).height();

			var margin = {
					top: 50,
					right: 30,
					bottom: 50,
					left: 50
				},
				width = widthpx - margin.left - margin.right,
				height = heightpx - margin.top - margin.bottom;

			self.x = d3.scale.linear()
				.domain([d3.min(data.data, function(d) {
					return d.x;
				}), d3.max(data.data, function(d) {
					return d.x;
				})])
				.range([0, width]);

			self.y = d3.scale.linear()
				.domain([d3.min(data.data, function(d) {
					return d.y;
				}), d3.max(data.data, function(d) {
					return d.y;
				})])
				.range([height, 0]);

			self.xAxis = d3.svg.axis()
				.scale(self.x)
				.orient("bottom");

			self.yAxis = d3.svg.axis()
				.scale(self.y)
				.orient("left");

			//apply the transition to the NEW xAxis (xAxis is a function of x, which its domain was redefined above)
			transition.select("g.x.axis").call(self.xAxis);
			//apply the transition to the NEW yAxis (yAxis is a function of y, which its domain was redefined above)
			transition.select("g.y.axis").call(self.yAxis);

			//Select ALL circles and point it to the newly defined data variable
			var circles = self.svg.selectAll("g circle");

			circles.data(data.data);

			//circles.exit().remove();

			//Redefine the maxRadius and maxTotal
			var maxRadius = 15;
			var maxTotal = d3.max(data.data, function(d) {
				return d.total;
			});

			//Apply the new positions to the circles with a transition
			//and see if the radii changed at all
			circles.transition().duration(transDuration)
				//.data(data.data)
				.attr("cx", function(d) {
					return self.x(d.x);
				})
				.attr("cy", function(d) {
					return self.y(d.y);
				})
				.attr("r", function(d) {
					if (typeof d.total === 'number') {
						return d.total / maxTotal * maxRadius;
					} else {
						return 10
					}
				})

			//Select the text of the X axis label
			//var xText = self.svg.select(" #xlabel text");
			//Update the text on the X Axis
			//xText.transition()
			//.text(data.labels.x);

			//Select the text of the Y axis label
			//var yText = self.svg.select(" #ylabel text")
			//Update the text on the Y Axis
			//yText.transition()
			//.text(data.labels.y);
		}


		self.reactor = ko.computed(function() {
			var data = self.data();
			//debugger;
			if (typeof data.data !== 'undefined') {
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
	ScatterPlot.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: ScatterPlot
		},
		template: templateMarkup
	};

});
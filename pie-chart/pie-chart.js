define(['jquery', 'knockout', 'd3', 'text!./pie-chart.html'], function($, ko, d3, templateMarkup) {

	function PieChart (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true);
		self.data = params.data;

		// list variable common to both render() and update()
		
		var margin = {top: 20, right: 20, bottom: 30, left: 40};
		self.width = $(self.element.parentElement).width() - margin.left - margin.right;
		self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;
		var radius = Math.min(self.width, self.height) / 2;

		var color = d3.scale.category10();

		var arc = d3.svg.arc()
			.outerRadius(radius - 10)
			.innerRadius(radius - 70);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.funding; });

		self.svg = d3.select(this.element).append("svg")
			.attr("width", self.width)
			.attr("height", self.height)
		  .append("g")
			.attr("transform", "translate(" + self.width / 2 + "," + self.height / 2 + ")");
		
		// function to keep track of the angles and do smooth transitions		
		function arcTween(a) {
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) {
			return arc(i(t));
		  };
		}
		

		//debugger;

		self.render = function() {
			var data = self.data();
			
			path = self.svg.datum(data).selectAll("path")
			.data(pie)
			.enter().append("path")
			.attr("fill", function(d, i) { return color(i); })
			.attr("d", arc)
			.each(function(d) { this._current = d; });
			
			  var g = self.svg.selectAll(".arc")
				.data(pie(data))
				.enter().append("g")
				.attr("class", "arc");

			  g.append("text")
				  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
				  .attr("dy", ".35em")
				  .style("text-anchor", "middle")
				  .text(function(d) { return d.data.center; });

				  
			this.firstRender(false);
			
		}
		
		self.update = function() {
			var data = self.data();
			
			 path = path.data(pie(data)); // compute the new angles
				path.transition().duration(750).attrTween("d", arcTween);
				
				var g = self.svg.selectAll(".arc")
				.data(pie(data))
				.enter().append("g")
				.attr("class", "arc");

			  g.append("text")
				  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
				  .attr("dy", ".35em")
				  .style("text-anchor", "middle")
				  .text(function(d) { return d.data.center; });

				
		}

		self.reactor = ko.computed(function() {
			var data = self.data();
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

		return self;
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	PieChart.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: PieChart
		},
		template: templateMarkup
	};

	});
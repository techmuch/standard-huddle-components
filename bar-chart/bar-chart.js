define(['jquery', 'knockout', 'd3', 'text!./bar-chart.html'], function($, ko, d3, templateMarkup) {

	function BarChart (params, componentInfo) {
		var vm = function(params) {
			var self = this;
			self.element = componentInfo.element;
			self.firstRender = ko.observable(true);
			self.data = params.data || ko.observable(null);
			//self.color = params.color;
			// test with settings table in db
			//self.color = JSON.parse(params.color());
			self.color = params.color;
			
			// list variable common to both render() and update()
			self.x = null;
			self.y = null;
			self.xAxis = null;
			self.yAxis = null;
			self.yAxis_name = params.yAxis;
			self.svg = null;
			var margin = {top: 20, right: 20, bottom: 50, left: 60};

			//debugger;

			self.render = function() {
				
				var font_size = 10;
				
				var data = self.data();
				//var color = d3.scale.ordinal().range(self.color()[6]);
				var color = d3.scale.ordinal().range(self.color()[6]);
				//console.log('test render'); // test
				
				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;

				self.x = d3.scale.ordinal().domain(data.map(function(d) { return d.name; })).rangeRoundBands([0, self.width], .1);

				self.y = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.value; })]).range([self.height, 0]);

				self.xAxis = d3.svg.axis()
					.scale(self.x)
					.orient("bottom");

				self.yAxis = d3.svg.axis()
					.scale(self.y)
					.orient("left")
					.ticks(20);

				self.svg = d3.select(self.element).append("svg")
					.attr("width", self.width + margin.left + margin.right)
					.attr("height", self.height + margin.top + margin.bottom)
				  .append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				  self.svg.append("g")
					  .attr("class", "x axis")
					  .attr("transform", "translate(0," + self.height + ")")
					  .call(self.xAxis)
					  .selectAll("text")  
						.style("text-anchor", "end")
						.attr("dx", "-.8em")
						.attr("dy", ".15em");
						// .attr("transform", function(d) {
							// return "rotate(-45)" 
							// });


				self.svg.append("g")
					  .attr("class", "y axis")
					  .call(self.yAxis)
					.append("text")
					  .attr("transform", "rotate(-90)")
					  .style("text-anchor", "middle")
					  .attr("y", -50)
					   .attr("x", -$(self.element).find(".y.axis")[0].getBBox().height / 2)
					  .attr("dy", ".71em")
					  .text(self.yAxis_name);

				  self.svg.selectAll(".bar")
					  .data(data)
					.enter().append("rect")
					  .attr("class", "bar")
					  .attr("x", function(data) { return self.x(data.name); })
					  .attr("width",self.x.rangeBand())
					  .attr("y", function(data) { return self.y(data.value); })
					  .attr("height", function(data) { return self.height - self.y(data.value); })
					  .attr("fill", function(data,i) { return color(i); });

					function type(data) {
					  data.value = +data.value;
					  return data;
						}

					this.firstRender(false);
			}


			self.update = function update() {
				
				var font_size = 10;
				
				var data = self.data();
				var color = d3.scale.ordinal().range(self.color()[6]);

				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;

				var transDuration = 1000;

				//Define the transition (in ms)
				var transition = self.svg.transition().duration(transDuration);

				self.x = d3.scale.ordinal().domain(data.map(function(d) { return d.name; })).rangeRoundBands([0, self.width], .1);

				self.y = d3.scale.linear().domain([0, d3.max(data, function(d) { 
					return d.value; 
				})*1.05]).range([self.height, 0]);

				self.xAxis = d3.svg.axis()
					.scale(self.x)
					.orient("bottom");

				self.yAxis = d3.svg.axis()
					.scale(self.y)
					.orient("left")
					.ticks(20);

				//apply the transition to the NEW xAxis (xAxis is a function of x, which its domain was redefined above)
				transition.select("g.x.axis").call(self.xAxis);
				//apply the transition to the NEW yAxis (yAxis is a function of y, which its domain was redefined above)
				transition.select("g.y.axis").call(self.yAxis);

				//Select ALL rects and point it to the newly defined data variable
				var rects = self.svg.selectAll("g rect");
				rects.data(data);

				//Apply the new positions to the rects with a transition
				rects.transition().duration(transDuration)
						.attr("class", "bar")
					  .attr("x", function(data) { return self.x(data.name); })
					  .attr("width",self.x.rangeBand())
					  .attr("y", function(data) { return self.y(data.value); })
					  .attr("height", function(data) { return self.height - self.y(data.value); })
					  .attr("fill", function(data,i) { return color(i); });;

			}
			
			self.rerender = function() {
					$(self.element).find('svg').remove();
					self.render();
					}


			self.reactor = ko.computed(function() {
				var data = self.data();
				var color = params.color();
				//console.log(typeof data);
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
			
			self.resizeHandle = $(window).on('resize', function() {
					self.rerender();
				})

			self.engridHandle = $(window).on('engrid-change', function() {
					self.rerender();
				})
			
		 // This runs when the component is torn down. Put here any logic necessary to clean up,
			// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
			self.dispose = function() {
				self.resizeHandle.off();
				self.engridHandle.off();
				self.reactor.dispose();
			};
			
			return self;
		}
        return new vm(params);
	}

	return {
		viewModel: {
			createViewModel: BarChart
		},
		template: templateMarkup
	};

});





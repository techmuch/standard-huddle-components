define(['jquery', 'knockout', 'd3', 'text!./pie-chart.html'], function($, ko, d3, templateMarkup) {

	function PieChart (params, componentInfo) {
		var vm = function(params) {
			var self = this;
			self.element = componentInfo.element;
			self.firstRender = ko.observable(true);
			self.data = params.data || ko.observable(null);
			
			self.color = params.color; // can call tm to change colors
			
						
			self.render = function() {
				var data = self.data();
				var color = d3.scale.ordinal().range(self.color()[9]);
				color.range(tm.selectedColorsPieChart()[8]);
				//console.log(
				var margin = {top: 0, right: 0, bottom: 0, left: 0};
				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;
				var radius = Math.min(self.width, self.height) / 2;
				
				var pie = d3.layout.pie()
					.sort(null)
					.value(function(d) { return d.value; });

				var arc = d3.svg.arc()
					.outerRadius(radius * 0.8)
					.innerRadius(radius * 0.4);

				var outerArc = d3.svg.arc()
					.innerRadius(radius * 0.9)
					.outerRadius(radius * 0.9);
					
					
				var key = function(d){ return d.data.name; }
				
				self.svg = d3.select(this.element)
							.append("svg")
								.attr("width", self.width)
								.attr("height", self.height)
							.append("g");
								
				self.svg.append("g").attr("class", "slices")
				self.svg.append("g").attr("class", "labels")
				self.svg.append("g").attr("class", "lines");
				
				self.svg.attr("transform", "translate(" + self.width / 2 + "," + self.height / 2 + ")");
				
				/* ------- PIE SLICES -------*/
				var slice = self.svg.select(".slices").selectAll("path.slice")
					.data(pie(data), key);

				slice.enter()
					.insert("path")
					.style("fill", function(d) { return color(d.data.name); })
					.attr("class", "slice");

				slice		
					.transition().duration(1000)
					.attrTween("d", function(d) {
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							return arc(interpolate(t));
						};
					})

				slice.exit()
					.remove();

				/* ------- TEXT LABELS -------*/

				var text = self.svg.select(".labels").selectAll("text")
					.data(pie(data), key);

				text.enter()
					.append("text")
					.attr("dy", ".35em")
					.text(function(d) {
						return d.data.name;
					});
				
				function midAngle(d){
					return d.startAngle + (d.endAngle - d.startAngle)/2;
				}

				text.transition().duration(1000)
					.attrTween("transform", function(d) {
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							var d2 = interpolate(t);
							var pos = outerArc.centroid(d2);
							pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
							return "translate("+ pos +")";
						};
					})
					.styleTween("text-anchor", function(d){
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							var d2 = interpolate(t);
							return midAngle(d2) < Math.PI ? "start":"end";
						};
					});

				text.exit()
					.remove();

				/* ------- SLICE TO TEXT POLYLINES -------*/

				var polyline = self.svg.select(".lines").selectAll("polyline")
					.data(pie(data), key);
				
				polyline.enter()
					.append("polyline");

				polyline.transition().duration(1000)
					.attrTween("points", function(d){
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							var d2 = interpolate(t);
							var pos = outerArc.centroid(d2);
							pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
							return [arc.centroid(d2), outerArc.centroid(d2), pos];
						};			
					});
				
				polyline.exit()
					.remove();
				  
				this.firstRender(false);
				
			}
			
			self.update = function() {
				var data = self.data();
				var color = d3.scale.ordinal().range(self.color()[9]);
				
				var margin = {top: 0, right: 0, bottom: 0, left: 0};
				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;
				var radius = Math.min(self.width, self.height) / 2;
				
				var pie = d3.layout.pie()
					.sort(null)
					.value(function(d) { return d.value; });

				var arc = d3.svg.arc()
					.outerRadius(radius * 0.8)
					.innerRadius(radius * 0.4);

				var outerArc = d3.svg.arc()
					.innerRadius(radius * 0.9)
					.outerRadius(radius * 0.9);
					
					
				var key = function(d){ return d.data.name; }
				
				
				/* ------- PIE SLICES -------*/
				var slice = self.svg.select(".slices").selectAll("path.slice")
					.data(pie(data), key);

				slice.enter()
					.insert("path")
					.style("fill", function(d) { return color(d.data.name); })
					.attr("class", "slice");

				slice		
					.transition().duration(1000)
					.attrTween("d", function(d) {
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							return arc(interpolate(t));
						};
					})

				slice.exit()
					.remove();

				/* ------- TEXT LABELS -------*/

				var text = self.svg.select(".labels").selectAll("text")
					.data(pie(data), key);

				text.enter()
					.append("text")
					.attr("dy", ".35em")
					.text(function(d) {
						return d.data.name;
					});
				
				function midAngle(d){
					return d.startAngle + (d.endAngle - d.startAngle)/2;
				}

				text.transition().duration(1000)
					.attrTween("transform", function(d) {
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							var d2 = interpolate(t);
							var pos = outerArc.centroid(d2);
							pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
							return "translate("+ pos +")";
						};
					})
					.styleTween("text-anchor", function(d){
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							var d2 = interpolate(t);
							return midAngle(d2) < Math.PI ? "start":"end";
						};
					});

				text.exit()
					.remove();

				/* ------- SLICE TO TEXT POLYLINES -------*/

				var polyline = self.svg.select(".lines").selectAll("polyline")
					.data(pie(data), key);
				
				polyline.enter()
					.append("polyline");

				polyline.transition().duration(1000)
					.attrTween("points", function(d){
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function(t) {
							var d2 = interpolate(t);
							var pos = outerArc.centroid(d2);
							pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
							return [arc.centroid(d2), outerArc.centroid(d2), pos];
						};			
					});
				
				polyline.exit()
					.remove();
			}
			
			self.rerender = function() {
					$(self.element).find('svg').remove();
					self.render();
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
			createViewModel: PieChart
		},
		template: templateMarkup
	};

	});
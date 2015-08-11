define(['jquery', 'knockout', 'd3', 'text!./grouped-bar-chart.html'], function($, ko, d3, templateMarkup) {

	function GroupedBarChart (params, componentInfo) {
		var vm = function(params) {
			var self = this;
			self.element = componentInfo.element;
			self.firstRender = ko.observable(true)
			self.data = ko.computed(function(){
				var toClone = params.data();
				var out = [];
				for (var i = 0 ; i < toClone.length; i++){
					out.push(toClone[i]);
				}
				return out;
			});
			self.color = params.color;
			self.yAxis_name = params.yAxis;
			
			// list variable common to both render() and update()
			self.legend = true;
			var margin = {top: 20, right: 15, bottom: 56, left: 65};

			self.render = function() {
				
				var font_size = 10;
				var tick_count = 5;
				
				var data = self.data();
				var color = d3.scale.ordinal().range(self.color()[10]);
				color.range(tm.selectedColorsStackedBarChart()[8]);
				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;
				
				// Determine whether to show legend
				// Render legend if area to visualize in is at least 600px high
				if (self.height < 600) {
					self.legend = false;
				} else {
					self.legend = true;
					font_size = 16;
					tick_count = 10;
				}
				
				self.x0 = d3.scale.ordinal()
						.rangeRoundBands([0, self.width], 0.15);
				self.x1 = d3.scale.ordinal();
				self.y = d3.scale.linear()
						.rangeRound([self.height, 0]);
				self.xAxis = d3.svg.axis()
						.scale(self.x0)
						.orient("bottom");
				self.yAxis = d3.svg.axis()
						.scale(self.y)
						.orient("left").ticks(5);	
				self.svg = d3.select(self.element).append("svg")
					.attr("width", self.width + margin.left + margin.right)
					.attr("height", self.height + margin.top + margin.bottom)
				  .append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var prog_data = d3.keys(data[0]).filter(function(key) { 
					return (key !== "xLabel"); 
				});

				data.forEach(function(d) {
					d.group = prog_data.map(function(name) { 
						return {name: name, value: +d[name]}; 
					});
				});

				//if a legend is specified, render it first
				var legend_height = 0
				if (self.legend) 
				{
					//this is a dynamically scaling legend, therefore, its height will influence the 
					//height available to the main graph
					//debugger
					var legend_var = self.svg.append("g")
					   .attr("class", "legend")
					   .attr("transform", "translate(0, " + (+self.height+31) + ")");

					var div_to_add = null
					var running_row_width = 0
					var row_counter = 0
					var x_spacing = 25
					var y_spacing = 25
					var current_x = 0
					var current_y = 0

					//add the first row
					div_to_add = self.svg.select("g.legend").append("g")
					   .attr("legend-row", row_counter)
					   .attr("transform", "translate(20," + row_counter + ")");

					//debugger

					for (var i = 0; i < prog_data.length; i++) {
						//add rectangle
						self.svg.select("g[legend-row=\"" + row_counter + "\"]").append("rect")
						  .attr("transform", "translate(" + current_x + ", " + current_y + ")")
						  .attr("width", 15)
						  .attr("height", 15)
						  .attr("legend-entry", i)
						  .style("fill", color.range()[i]);

						current_x += 20

						//add text
						self.svg.select("g[legend-row=\"" + row_counter + "\"]").append("text")
						  .attr("transform", "translate(" + current_x + ", " + (current_y + 7) + ")")
						  .attr("legend-entry", i)
						  .attr("dy", ".35em")
						  .style("text-anchor", "start")
						  .text(prog_data[i]);

						current_x += $("text[legend-entry=" + i + "]").width()

						//get the rolling width of the row
						//note: getBBox is needed to get SVG element properties via jQuery
						running_row_width = $("g[legend-row=\"" + row_counter + "\"]")[0].getBBox().width

						//debugger

						if (running_row_width > self.width && $("g[legend-row=\"" + row_counter + "\"] rect").length > 1)
						{
							//if the newly appended label made the row wider than the width
							//and there is more than 1 legend entry per row, then
							//add a new row, and move the appended label to the new row

							//add new row
							row_counter += 1
							div_to_add = d3.select("g.legend").append("g")
							   .attr("legend-row",  row_counter)
							   .attr("transform", "translate(20," + row_counter*y_spacing + ")");

							//move appended label to the new row
							$("[legend-entry=" + i + "]").appendTo("g[legend-row=" + row_counter + "]");

							//reset running_row_width to the current width of the new row and current_x back to 0
							running_row_width = $("g[legend-row=\"" + row_counter + "\"]")[0].getBBox().width
							current_x = 0
							$("[legend-entry=" + i + "]rect").attr("transform", "translate(" + current_x + "," + current_y + ")")
							current_x += 20
							$("[legend-entry=" + i + "]text").attr("transform", "translate(" + current_x + "," + (current_y + 7) + ")")

							//shift the legend box up by a row's worth
							$("g.legend").attr("transform", "translate(0, " + (+self.height-25*(row_counter+1)) + ")")

						} else {
							current_x += 20
						}
					}

					legend_height = Math.round($("g.legend")[0].getBBox().height + 40)
				} else {
					legend_height = 25 // for padding
				}

					
				self.x0.domain(data.map(function(d) { return d.xLabel; }));
				self.x1.domain(prog_data).rangeRoundBands([0, self.x0.rangeBand()]);
				self.y.domain([0, d3.max(data, function(d) { 
					return d3.max(d.group, function(d) { 
						return d.value; }); 
				}) * 1.05]);

				self.svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (+self.height) + ")")
				.call(self.xAxis);

				self.svg.append("g")
					  .attr("class", "y axis")
					  .call(self.yAxis)
					.append("text")
					   .attr("transform", "rotate(-90)")
					  .style("text-anchor", "middle")
					  .style("font-size",font_size) 
					  .attr("y", -50)
					  .attr("x", -$(self.element).find(".y.axis")[0].getBBox().height / 2)
					  .attr("dy", ".71em")
					  .text(self.yAxis_name);

				var xLabel = self.svg.selectAll(".xLabel")
					.data(data)
					.enter().append("g")
					.attr("class", "g")
					.attr("transform", function(d) { 
						return "translate(" + self.x0(d.xLabel) + ", 0)"; 
					});
				
				xLabel.selectAll("rect")
					.data(function(d) { 
						return d.group; 
					})
				.enter().append("rect")
					.attr("width", self.x1.rangeBand())
					.attr("x", function(d) { 
						return self.x1(d.name); 
					})
					.attr("y", function(d) { 
						return self.y(d.value); 
					})
					.attr("height", function(d) { 
						return self.height - self.y(d.value); 
					})
					.style("fill", function(d) { 
						return color(d.name); 
					});
					
				data.forEach(function(d) {
					delete d.group;
				  });

				this.firstRender(false);
			}

			self.update = function() {
				
				var font_size = 10;
				var tick_count = 5;
				
				// Determine whether to show legend
				// Render legend if area to visualize in is at least 600px high
				if (self.height < 600) {
					self.legend = false;
				} else {
					self.legend = true;
					font_size = 16;
					tick_count = 10;
				}
				
				var data = self.data();
				
				self.x0 = d3.scale.ordinal()
						.rangeRoundBands([0, self.width], 0.15);
				self.x1 = d3.scale.ordinal();
				self.y = d3.scale.linear()
						.rangeRound([self.height, 0]);
				self.xAxis = d3.svg.axis()
						.scale(self.x0)
						.orient("bottom");
				self.yAxis = d3.svg.axis()
						.scale(self.y)
						.orient("left").ticks(5);	
				self.svg = d3.select(self.element).append("svg")
					.attr("width", self.width + margin.left + margin.right)
					.attr("height", self.height + margin.top + margin.bottom)
				  .append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				for (i in data) {
					delete data[i].group;
				}

				var color = d3.scale.ordinal().range(self.color()[10]);
				
				var transDuration = 2500;
				//Define the transition (in ms)
				var transition = self.svg.transition().duration(transDuration);

				var prog_data = d3.keys(data[0]).filter(function(key) { 
					return (key !== "xLabel"); // in order to select the different TRLs
				});

				data.forEach(function(d) {
					d.group = prog_data.map(function(name) { 
						return {name: name, value: +d[name]}; 
					});
				});

				//if a legend is specified, update it
				self.svg.select("g.legend").remove();
				var legend_height = 0
				if (self.legend) 
				{
					//this is a dynamically scaling legend, therefore, its height will influence the 
					//height available to the main graph
					//debugger
					var legend_var = self.svg.append("g")
					   .attr("class", "legend")
					   .attr("transform", "translate(0, " + (+self.height+31) + ")");

					var div_to_add = null
					var running_row_width = 0
					var row_counter = 0
					var x_spacing = 25
					var y_spacing = 25
					var current_x = 0
					var current_y = 0

					//add the first row
					div_to_add = self.svg.select("g.legend").append("g")
					   .attr("legend-row", row_counter)
					   .attr("transform", "translate(20," + row_counter + ")");

					//debugger

					for (var i = 0; i < prog_data.length; i++) {
						//add rectangle
						self.svg.select("g[legend-row=\"" + row_counter + "\"]").append("rect")
						  .attr("transform", "translate(" + current_x + ", " + current_y + ")")
						  .attr("width", 15)
						  .attr("height", 15)
						  .attr("legend-entry", i)
						  .style("fill", color.range()[i]);

						current_x += 20

						//add text
						self.svg.select("g[legend-row=\"" + row_counter + "\"]").append("text")
						  .attr("transform", "translate(" + current_x + ", " + (current_y + 7) + ")")
						  .attr("legend-entry", i)
						  .attr("dy", ".35em")
						  .style("text-anchor", "start")
						  .text(prog_data[i]);

						current_x += $("text[legend-entry=" + i + "]").width()

						//get the rolling width of the row
						//note: getBBox is needed to get SVG element properties via jQuery
						running_row_width = $("g[legend-row=\"" + row_counter + "\"]")[0].getBBox().width

						//debugger

						if (running_row_width > self.width && $("g[legend-row=\"" + row_counter + "\"] rect").length > 1)
						{
							//if the newly appended label made the row wider than the width
							//and there is more than 1 legend entry per row, then
							//add a new row, and move the appended label to the new row

							//add new row
							row_counter += 1
							div_to_add = d3.select("g.legend").append("g")
							   .attr("legend-row",  row_counter)
							   .attr("transform", "translate(20," + row_counter*y_spacing + ")");

							//move appended label to the new row
							$("[legend-entry=" + i + "]").appendTo("g[legend-row=" + row_counter + "]");

							//reset running_row_width to the current width of the new row and current_x back to 0
							running_row_width = $("g[legend-row=\"" + row_counter + "\"]")[0].getBBox().width
							current_x = 0
							$("[legend-entry=" + i + "]rect").attr("transform", "translate(" + current_x + "," + current_y + ")")
							current_x += 20
							$("[legend-entry=" + i + "]text").attr("transform", "translate(" + current_x + "," + (current_y + 7) + ")")

							//shift the legend box up by a row's worth
							$("g.legend").attr("transform", "translate(0, " + (+self.height-25*(row_counter+1)) + ")")

						} else {
							current_x += 20
						}
					}

					legend_height = Math.round($("g.legend")[0].getBBox().height + 40)
				} else {
					legend_height = 25 // for padding
				}
					
				self.x0.domain(data.map(function(d) { return d.xLabel; }));
				self.x1.domain(prog_data).rangeRoundBands([0, self.x0.rangeBand()]);
				self.y.domain([0, d3.max(data, function(d) { 
					return d3.max(d.group, function(d) { 
						return d.value; }); 
				}) * 1.05]);
				
				//apply the transition to the new axes
				transition.select("g.x0.axis").call(self.xAxis);
				transition.select("g.x1.axis").call(self.xAxis);
				transition.select("g.y.axis").call(self.yAxis);
					
				//Select ALL rects and point it to the newly defined data variable
				var rects = self.svg.selectAll("g.g rect");
				formatted_data = [];

				for(var i = 0; i < data.length; i++){
					for(var j = 0; j < data[i].group.length; j++){
						formatted_data.push({name: data[i].group[j].name, value: +data[i].group[j].value})
					}
				}
				
				rects.data(formatted_data);

				//Apply the new positions to the rects with a transition
				rects.transition().duration(transDuration)
						.attr("class", "xLabel")
							.attr("width", self.x1.rangeBand())
							.attr("x", function(d) { 
								return self.x1(d.name); 
							})
							.attr("y", function(d) { 
								return self.y(d.value); 
							})
							.attr("height", function(d) { 
								return self.height - self.y(d.value); 
							})
							.style("fill", function(d) { 
								return color(d.name); 
							});

			}
			
			self.rerender = function() {
					$(self.element).find('svg').remove();
					self.render();
					}

			self.reactor = ko.computed(function() {
				var data = self.data();
				var color = params.color();
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
			createViewModel: GroupedBarChart
		},
		template: templateMarkup
	};

});
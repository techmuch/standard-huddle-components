define(['jquery', 'knockout', 'd3', 'text!./stacked-bar-chart.html'], function($, ko, d3, templateMarkup) {

	function StackedBarChart (params, componentInfo) {
		var vm = function(params) {
			var self = this;
			self.element = componentInfo.element;
			self.firstRender = ko.observable(true);
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

			// Text wrapping function from:  http://bl.ocks.org/mbostock/7555321
			function wrap(text, width) {
				text.each(function() {
					var text = d3.select(this),
						words = text.text().split(/\s+/).reverse(),
						word,
						line = [],
						lineNumber = 0,
						lineHeight = 1.1, // ems
						y = text.attr("y"),
						dy = parseFloat(text.attr("dy")),
						tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
					while (word = words.pop()) {
						line.push(word);
						tspan.text(line.join(" "));
						if (tspan.node().getComputedTextLength() > width) {
							line.pop();
							tspan.text(line.join(" "));
							line = [word];
							tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
						}
					}
				});
			}

			// list variable common to both render() and update()
			self.legend = true;
			var margin = {top: 15, right: 15, bottom: 0, left: 65};

			self.render = function() {
				
				var font_size = 10;
				var tick_count = 4;

				var data = self.data();
				var color = d3.scale.ordinal().range(self.color()[6]);
				color.range(tm.selectedColorsStackedBarChart()[8]);
				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;
//console.log("width=",self.width,", height=",self.height);

				// Determine whether to show legend
				// Render legend if area to visualize in is at least 300px high
				if (self.height < 300) {
					self.legend = false;
					font_size = 10;
					tick_count = 4
				} else {
					self.legend = true;
					font_size = 16;
					tick_count = 10;
				}
//console.log("====>",self.legend,font_size,tick_count);

				self.svg = d3.select(self.element)
								.append("svg")
									.attr("width", self.width + margin.left + margin.right)
									.attr("height", self.height + margin.top + margin.bottom)
								.append("g")
									.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				color.domain(d3.keys(data[0]).filter(function(key) { 
					return key !== "xLabel"; 
				}));

				//if a legend is specified, render it first
				var legend_height = 0
				if (self.legend) 
				{
					//this is a dynamically scaling legend, therefore, its height will influence the 
					//height available to the main graph
					var legend_var = self.svg.append("g")
					   .attr("class", "legend")
					   .attr("transform", "translate(0, " + (+self.height-25) + ")");

					var div_to_add = null
					var running_row_width = 0
					var row_counter = 0
					var x_spacing = 25
					var y_spacing = 25
					var current_x = 0
					var current_y = 0

					//add the first row
					div_to_add = d3.select("g.legend").append("g")
					   .attr("legend-row", row_counter)
					   .attr("transform", "translate(20," + row_counter + ")");

					for (var i = 0; i < color.domain().length; i++) {
						//add rectangle
						d3.select("g[legend-row=\"" + row_counter + "\"]").append("rect")
						  .attr("transform", "translate(" + current_x + ", " + current_y + ")")
						  .attr("width", 15)
						  .attr("height", 15)
						  .attr("legend-entry", i)
						  .style("fill", color.range()[i]);

						current_x += 20

						//add text
						d3.select("g[legend-row=\"" + row_counter + "\"]").append("text")
						  .attr("transform", "translate(" + current_x + ", " + (current_y + 7) + ")")
						  .attr("legend-entry", i)
						  .attr("dy", ".35em")
						  .style("text-anchor", "start")
						  .text(color.domain()[i]);

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

					legend_height = Math.round($("g.legend")[0].getBBox().height + 80)
				} else {
					legend_height = 60 // for padding
				}
				//debugger
				

				//axes settings			
				self.x = d3.scale.ordinal()
					.rangeRoundBands([0, self.width], 0.15);

				self.y = d3.scale.linear()
					.rangeRound([self.height - legend_height, 0]);

				self.xAxis = d3.svg.axis()
					.scale(self.x)
					.orient("bottom");

				self.yAxis = d3.svg.axis()
					.scale(self.y)
					.orient("left")
					.ticks(tick_count);

				data.forEach(function(d) {
					var y0 = 0;
					d.programs = color.domain().map(function(name) { 
						return {
							name: name, 
							y0: y0, 
							y1: y0 += +d[name]
						}; 
					});
					d.total = d.programs[d.programs.length - 1].y1;
				  });

				self.x.domain(data.map(function(d) { return d.xLabel; }));
				self.y.domain([0, d3.max(data, function(d) { return d.total; })*1.05]);


				// Create the y axis
				self.svg.append("g")
					  .attr("class", "y axis")
					  .call(self.yAxis)
					.append("text")
					  .attr("transform", "rotate(-90)")
					  .style("text-anchor", "middle")
					  .style("font-size",font_size)
					  .attr("y", -50)
					  .attr("x", -$(self.element).find(".y.axis")[0].getBBox().height / 2)
					  .attr("dy", ".32em")
					  .text(self.yAxis_name);

				yAxis = self.svg.selectAll(".y.axis");
				yAxis.selectAll(".tick text")
					  .style("font-size",font_size);

				// Create the x axis
				self.svg.append("g")
					  .attr("class", "x axis")
					  .attr("transform", "translate(0," + (+self.height - legend_height) + ")")
					  .call(self.xAxis)
					.append("text")
					  .style("text-anchor", "middle")
					  .style("font-size",font_size)
					  .attr("y", 10)
					  .attr("x", $(self.element).find(".x.axis")[0].getBBox().height / 2)
					  .attr("dy", ".71em")
					  .text(self.xAxis_name);


				xAxis = self.svg.selectAll(".x.axis");
				xAxis.selectAll(".tick text")
					  .style("font-size",font_size)
					  .call(wrap, self.x.rangeBand());




				var xLabel = self.svg.selectAll(".xLabel")
					  .data(data)
					.enter().append("g")
					  .attr("class", "g")
					  .attr("transform", function(d) { 
						return "translate(" + self.x(d.xLabel) + ",0)"; 
					  });

				xLabel.selectAll("rect")
					  .data(function(d) { return d.programs; })
					.enter().append("rect")
					  .attr("width", self.x.rangeBand())
					  .attr("y", function(d) { return self.y(d.y1); })
					  .attr("height", function(d) { return self.y(d.y0) - self.y(d.y1); })
					  .style("fill", function(d) { return color(d.name); });

				xLabel.selectAll("text")
					  .data(function(d) { return d.programs; })
					.enter().append("text")
					  .attr("class", "label-text")
					  .style("font-size",font_size)
					  .attr("y", function(d) { 
						//debugger
						return self.y(d.y1) + (self.y(d.y0) - self.y(d.y1))/2; 
					  })
					  .attr("x", function(d, i) { 
						//debugger
						return self.x.rangeBand()/2; 
					  });

					// use code below to label the bars
					  // .text(function(d){
						// //debugger
						// return d.y1 - d.y0
					  // });
						
				data.forEach(function(d) {
					delete d.programs;
					delete d.total;
				  });
				  
			this.firstRender(false);
			}

			self.update = function() {
				var data = self.data();
				var color = d3.scale.ordinal().range(self.color()[6]); 
				
				var font_size = 10;
				var tick_count = 4;
				
				// Determine whether to show legend
				// Render legend if area to visualize in is at least 300px high
				if (self.height < 300) {
					self.legend = false;
					font_size = 10;
					tick_count = 4
				} else {
					self.legend = true;
					font_size = 16;
					tick_count = 10;
				}
				
				var transDuration = 2500;
				//Define the transition (in ms)
				var transition = self.svg.transition().duration(transDuration);

				color.domain(d3.keys(data[0]).filter(function(key) { 
					return key !== "xLabel"; 
				}));

				//if a legend is specified, update it
				self.svg.select("g.legend").remove();
				var legend_height = 0
				if (self.legend) 
				{
					//this is a dynamically scaling legend, therefore, its height will influence the 
					//height available to the main graph
					var legend_var = self.svg.append("g")
					   .attr("class", "legend")
					   .attr("transform", "translate(0, " + (+self.height-25) + ")");

					var div_to_add = null
					var running_row_width = 0
					var row_counter = 0
					var x_spacing = 25
					var y_spacing = 25
					var current_x = 0
					var current_y = 0

					//add the first row
					div_to_add = d3.select("g.legend").append("g")
					   .attr("legend-row", row_counter)
					   .attr("transform", "translate(20," + row_counter + ")");

					for (var i = 0; i < color.domain().length; i++) {
						//add rectangle
						d3.select("g[legend-row=\"" + row_counter + "\"]").append("rect")
						  .attr("transform", "translate(" + current_x + ", " + current_y + ")")
						  .attr("width", 15)
						  .attr("height", 15)
						  .attr("legend-entry", i)
						  .style("fill", color.range()[i]);

						current_x += 20

						//add text
						d3.select("g[legend-row=\"" + row_counter + "\"]").append("text")
						  .attr("transform", "translate(" + current_x + ", " + (current_y + 7) + ")")
						  .attr("legend-entry", i)
						  .attr("dy", ".35em")
						  .style("text-anchor", "start")
						  .text(color.domain()[i]);

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
				//debugger

					
				data.forEach(function(d) {
					var y0 = 0;
					d.programs = color.domain().map(function(name) { 
						return {
							name: name, 
							y0: y0, 
							y1: y0 += +d[name]
						}; 
					});
					d.total = d.programs[d.programs.length - 1].y1; // caution with the data strucutre! (hence the '- 3')
				  });

				//axes settings			

				self.x.domain(data.map(function(d) { return d.xLabel; }));
				self.y.domain([0, d3.max(data, function(d) { return d.total; })*1.05]);			
				
				//apply the transition to the new axes
				transition.select("g.x.axis").call(self.xAxis).selectAll(".tick text").style("font-size",font_size).call(wrap, self.x.rangeBand());
				//transition.select("g.x.axis").call(self.xAxis);
				transition.select("g.y.axis").call(self.yAxis);

				// self.svg.append("g")
					  // .attr("class", "y axis")
					  // .call(self.yAxis)
					// .append("text")
					  // .attr("transform", "rotate(-90)")
					  // .style("text-anchor", "middle")
					  // .attr("y", -50)
					  // .attr("x", -$(self.element).find(".y.axis")[0].getBBox().height / 2)
					  // .attr("dy", ".71em")
					  // .text("$M (FY 2015)");
					  
				//Select ALL rects and point it to the newly defined data variable
				
				var rects = self.svg.selectAll("g.g rect");
				formatted_data = [];

				for(var i = 0; i < data.length; i++){
					for(var j = 0; j < data[i].programs.length; j++){
						formatted_data.push({name: data[i].programs[j].name, y0: +data[i].programs[j].y0, y1: +data[i].programs[j].y1})
					}
				}
				rects.data(formatted_data);

				//Apply the new positions to the rects with a transition
				rects.transition().duration(transDuration)
						.attr("class", "xLabel")
						  .attr("width", self.x.rangeBand())
						  .attr("y", function(d) { return self.y(d.y1); })
						  .attr("height", function(d) { return self.y(d.y0) - self.y(d.y1); })
						  .style("fill", function(d) { return color(d.name); });	  
				
				// labeling of the bars with the corresponding values
				/**********
				var text = self.svg.selectAll("g, g text");
				text.data(formatted_data);
				text.transition().duration(transDuration)
						.attr("class", "label-text")
							.attr("y", function(d) { 
								//debugger
								return self.y(d.y1) + (self.y(d.y0) - self.y(d.y1))/2 + 1; 
							  })
							  .attr("x", function(d, i) { 
								//debugger
								return self.x.rangeBand()/2; 
							  }); 
							  // .text(function(d){
								// //debugger
								// return d.y1 - d.y0
							  // });
				**********/		

				data.forEach(function(d) {
					delete d.programs;
					delete d.total;
				  });
			}
			
			self.rerender = function() {
					$(self.element).find('svg').remove();

					self.render();
				}

			self.reactor = ko.computed(function() {
				var data = self.data();
				var color = params.color();
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

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	StackedBarChart.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: StackedBarChart
		},
		template: templateMarkup
	};

});

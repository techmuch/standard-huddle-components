define(['jquery', 'knockout', 'd3', 'text!./grouped-bar-chart.html'], function($, ko, d3, templateMarkup) {

	function GroupedBarChart (params, componentInfo) {
		var vm = function(params) {
			var self = this;
			self.element = componentInfo.element;
			self.firstRender = ko.observable(true)
			self.data = params.data;
			self.color = params.color;
			self.options = params.options || function(){
				return {title: ''}
			};
			
			// list variable common to both render() and update()
			self.legend = true;

			self.render = function() {
				
				var data = self.data();
				var color = d3.scale.ordinal().range(self.color()[6]);
				
				var margin = {top: 20, right: 15, bottom: 56, left: 65};
				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;
				
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
					return (key !== "xLabel"); // in order to select the different TRLs
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

				/* 	var legend = self.svg.selectAll(".legend")
				.data(prog_data.slice().reverse())
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { 
					return "translate(0," + i * 20 + ")"; 
				});

				legend.append("rect")
					.attr("x", self.width - 18)
					.attr("width", 18)
					.attr("height", 18)
					.style("fill", self.color);

				legend.append("text")
					.attr("x", self.width - 24)
					.attr("y", 9)
					.attr("dy", ".35em")
					.style("text-anchor", "end")
					.text(function(d) { return d; }); */
					
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
					  .attr("y", -50)
					  .attr("x", -$(".y.axis")[0].getBBox().height / 2)
					  .attr("dy", ".71em")
					  .text(self.options().title);

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

				this.firstRender(false);
			}

			self.update = function() {
				var data = self.data();

				var margin = {top: 20, right: 15, bottom: 56, left: 65};
				self.width = $(self.element.parentElement).width() - margin.left - margin.right;
				self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;
				
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

				var color = d3.scale.ordinal().range(self.color()[6]);
				
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

				// self.svg.append("g")
					// .attr("class", "x axis")
					// .attr("transform", "translate(0," + (+self.height) + ")")
				// .call(self.xAxis);

				// self.svg.append("g")
					  // .attr("class", "y axis")
					  // .call(self.yAxis)
					// .append("text")
					  // .attr("transform", "rotate(-90)")
					  // .style("text-anchor", "middle")
					  // .attr("y", -50)
					  // .attr("x", -$(".y.axis")[0].getBBox().height / 2)
					  // .attr("dy", ".71em")
					  // .text(self.options().title);
					  
					
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

				// var thrust = self.svg.selectAll(".thrust")
					// .data(data)
					// .enter().append("g")
					// .attr("class", "g")
					// .attr("transform", function(d) { 
						// return "translate(" + self.x0(d.thrust) + ", 0)"; 
					// });

				// thrust.selectAll("rect")
					// .data(function(d) { 
						// return d.group; 
					// })
				// .enter().append("rect")
					// .attr("width", self.x1.rangeBand())
					// .attr("x", function(d) { 
						// return self.x1(d.name); 
					// })
					// .attr("y", function(d) { 
						// return self.y(d.value); 
					// })
					// .attr("height", function(d) { 
						// return self.height - self.y(d.value); 
					// })
					// .style("fill", function(d) { 
						// return color(d.name); 
					// });

			/* 	var legend = self.svg.selectAll(".legend")
					.data(prog_data.slice().reverse())
					.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function(d, i) { 
						return "translate(0," + i * 20 + ")"; 
					});

				legend.append("rect")
					.attr("x", self.width - 18)
					.attr("width", 18)
					.attr("height", 18)
					.style("fill", self.color);

				legend.append("text")
					.attr("x", self.width - 24)
					.attr("y", 9)
					.attr("dy", ".35em")
					.style("text-anchor", "end")
					.text(function(d) { return d; }); */
				// var data = self.data();
				// var color = d3.scale.ordinal().range(self.color()[6]);
				// //console.log('test update');

				// var transDuration = 2500;

				// //Define the transition (in ms)
				// var transition = self.svg.transition().duration(transDuration);

				// self.x0 = d3.scale.ordinal()
					// .rangeRoundBands([0, self.width], .1);

				// self.x1 = d3.scale.ordinal();

				// self.y = d3.scale.linear()
					// .range([self.height, 0]);

				// self.xAxis = d3.svg.axis()
					// .scale(self.x0)
					// .orient("bottom");

				// self.yAxis = d3.svg.axis()
					// .scale(self.y)
					// .orient("left").ticks(5);

				// //Template modification

				// var prog_data = d3.keys(data[0]).filter(function(key) { 
					// return (key !== "thrust"); 
				// });

				// data.forEach(function(d) {
					// d.group = prog_data.map(function(name) { 
						// return {name: name, value: +d[name]}; 
					// });
				// });

			  // self.x0.domain(data.map(function(d) { return d.thrust; }));
			  // self.x1.domain(prog_data).rangeRoundBands([0, self.x0.rangeBand()]);
			  // self.y.domain([0, d3.max(data, function(d) { return d3.max(d.group, function(d) { return d.value; }); })]);


				// //apply the transition to the NEW xAxis (xAxis is a function of x, which its domain was redefined above)
				// transition.select("g.x.axis").call(self.xAxis);
				// //apply the transition to the NEW yAxis (yAxis is a function of y, which its domain was redefined above)
				// transition.select("g.y.axis").call(self.yAxis);


			  // var thrust = self.svg.selectAll(".thrust")
				  // .data(data)
				// .enter().append("g")
				  // .attr("class", "g")
				  // .attr("transform", function(d) { return "translate(" + self.x0(d.thrust) + ",0)"; });

				// thrust.selectAll("rect")
					// .data(function(d) { 
						// return d.group; 
					// })
				// .enter().append("rect")
					// .attr("width", self.x1.rangeBand())
					// .attr("x", function(d) { 
						// return self.x1(d.name); 
					// })
					// .attr("y", function(d) { 
						// return self.y(d.value); 
					// })
					// .attr("height", function(d) { 
						// return self.height - self.y(d.value); 
					// })
					// .style("fill", function(d) { 
						// return color(d.name); 
					// });


				// //Select ALL rects and point it to the newly defined data variable
				// var rects = self.svg.selectAll("g rect");

				// rects.data(data);

				// //Apply the new positions to the rects with a transition
				// rects.transition().duration(transDuration)
						// .attr("class", "bar")
					  // .attr("x", function(d) { return self.x0(d.thrust); })
					  // .attr("width",self.x0.rangeBand())
					  // .attr("y", function(d) { return self.y(d.group); })
					  // .attr("height", function(d) { return self.height - self.y(d.group); });


			  // // var legend = self.svg.selectAll(".legend")
				  // // .data(prog_data.slice().reverse())
				// // .enter().append("g")
				  // // .attr("class", "legend")
				  // // .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			  // // legend.append("rect")
				  // // .attr("x", self.width - 5)
				  // // .attr("width", 18)
				  // // .attr("height", 18)
				  // // .style("fill", color);

			  // // legend.append("text")
				  // // .attr("x", self.width - 10)
				  // // .attr("y", 9)
				  // // .attr("dy", ".35em")
				  // // .style("text-anchor", "end")
				  // // .text(function(d) { return d; });


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

	return {
		viewModel: {
			createViewModel: GroupedBarChart
		},
		template: templateMarkup
	};

});
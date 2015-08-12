define(['jquery', 'knockout', 'd3', 'text!./radar-plot.html'], function($, ko, d3, templateMarkup) {

	function RadarPlot (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true)

		self.data = params.data || ko.observable({})

		// list variable common to both render() and update()
		self.svg = null;

		//debugger;

		self.render = function() {

				self.width = $(self.element.parentElement).width();
		self.height = $(self.element.parentElement).height();
		self.radiusRadar=Math.min(self.width,	 self.height)-4;
		var RadarChart = {
	defaultConfig: {
		containerClass: 'radar-chart',
		w: self.width,
		h: self.height,
		factor: 0.9,
		factorLegend: 1,
		levels: 3,
		maxValue: 0,
		radians: 2 * Math.PI,
		color: d3.scale.category10(),
		axisLine: true,
		axisText: true,
		circles: true,
		radius: 5,
		axisJoin: function(d, i) {
			return d.className || i;
		},
		transitionDuration: 300
	},
	chart: function() {
		// default config
		var cfg = Object.create(RadarChart.defaultConfig);

		function radar(selection) {
			selection.each(function(data) {
				var container = d3.select(this);

				// allow simple notation
				data = data.map(function(datum) {
					if(datum instanceof Array) {
						datum = {axes: datum};
					}
					return datum;
				});

				var maxValue = Math.max(cfg.maxValue, d3.max(data, function(d) { 
					return d3.max(d.axes, function(o){ return o.value; });
				}));

				var allAxis = data[0].axes.map(function(i, j){ return i.axis; });
				var total = allAxis.length;
				var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);

				container.classed(cfg.containerClass, 1);

				function getPosition(i, range, factor, func){
					factor = typeof factor !== 'undefined' ? factor : 1;
					return range * (1 - factor * func(i * cfg.radians / total));
				}
				function getHorizontalPosition(i, range, factor){
					return getPosition(i, range, factor, Math.sin);
				}
				function getVerticalPosition(i, range, factor){
					return getPosition(i, range, factor, Math.cos);
				}

				// levels && axises
				var levelFactors = d3.range(0, cfg.levels).map(function(level) {
					return radius * ((level + 1) / cfg.levels);
				});

				var levelGroups = container.selectAll('g.level-group').data(levelFactors);

				levelGroups.enter().append('g');
				levelGroups.exit().remove();

				levelGroups.attr('class', function(d, i) {
					return 'level-group level-group-' + i;
				});

				var levelLine = levelGroups.selectAll('.level').data(function(levelFactor) {
					return d3.range(0, total).map(function() { return levelFactor; });
				});

				levelLine.enter().append('line');
				levelLine.exit().remove();

				levelLine
					.attr('class', 'level')
					.attr('x1', function(levelFactor, i){ return getHorizontalPosition(i, levelFactor); })
					.attr('y1', function(levelFactor, i){ return getVerticalPosition(i, levelFactor); })
					.attr('x2', function(levelFactor, i){ return getHorizontalPosition(i+1, levelFactor); })
					.attr('y2', function(levelFactor, i){ return getVerticalPosition(i+1, levelFactor); })
					.attr('transform', function(levelFactor) {
						return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
					});

				if(cfg.axisLine || cfg.axisText) {
					var axis = container.selectAll('.axis').data(allAxis);

					var newAxis = axis.enter().append('g');
					if(cfg.axisLine) {
						newAxis.append('line');
					}
					if(cfg.axisText) {
						newAxis.append('text');
					}

					axis.exit().remove();

					axis.attr('class', 'axis');

					if(cfg.axisLine) {
						axis.select('line')
							.attr('x1', cfg.w/2)
							.attr('y1', cfg.h/2)
							.attr('x2', function(d, i) { return getHorizontalPosition(i, cfg.w / 2, cfg.factor); })
							.attr('y2', function(d, i) { return getVerticalPosition(i, cfg.h / 2, cfg.factor); });
					}

					if(cfg.axisText) {
						axis.select('text')
							.attr('class', function(d, i){
								var p = getHorizontalPosition(i, 0.5);

								return 'legend ' +
									((p < 0.4) ? 'left' : ((p > 0.6) ? 'right' : 'middle'));
							})
							.attr('dy', function(d, i) {
								var p = getVerticalPosition(i, 0.5);
								return ((p < 0.1) ? '1em' : ((p > 0.9) ? '0' : '0.5em'));
							})
							.text(function(d) { return d; })
							.attr('x', function(d, i){ return getHorizontalPosition(i, cfg.w / 2, cfg.factorLegend); })
							.attr('y', function(d, i){ return getVerticalPosition(i, cfg.h / 2, cfg.factorLegend); });
					}
				}

				// content
				data.forEach(function(d){
					d.axes.forEach(function(axis, i) {
						axis.x = getHorizontalPosition(i, cfg.w/2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor);
						axis.y = getVerticalPosition(i, cfg.h/2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor);
					});
				});

				var polygon = container.selectAll(".area").data(data, cfg.axisJoin);
				polygon.enter().append('polygon')
		
					.classed({area: 1, 'd3-enter': 1})
			
					.on('mouseover', function (d){
	/*	tooltip
								.attr('x', 100)
								.attr('y', 100)
								.text(d.className)
								.classed('visible', 1);*/
				
				
						container.classed('focus', 1);
						d3.select(this).classed('focused', 1);
			d3.select(this).append("title")
	 .text(function(d) {
				 return d.className;
	 });
					})
					.on('mouseout', function(){
		//	tooltip.classed('visible', 0);
						container.classed('focus', 0);
						d3.select(this).classed('focused', 0);
					});
				polygon.exit()
					.classed('d3-exit', 1) // trigger css transition
					.transition().duration(cfg.transitionDuration)
						.remove();

				polygon
					.each(function(d, i) {
						var classed = {'d3-exit': 0}; // if exiting element is being reused
						classed['radar-chart-serie' + i] = 1;
						if(d.className) {
							classed[d.className] = 1;
						}
						d3.select(this).classed(classed);
					})
					// styles should only be transitioned with css
					.style('stroke', function(d, i) { return cfg.color(i); })
					.style('fill', function(d, i) { return cfg.color(i); })
					.transition().duration(cfg.transitionDuration)
						// svg attrs with js
						.attr('points',function(d) {
							return d.axes.map(function(p) {
								return [p.x, p.y].join(',');
							}).join(' ');
						})
						.each('start', function() {
							d3.select(this).classed('d3-enter', 0); // trigger css transition
						});

				if(cfg.circles && cfg.radius) {
					var tooltip = container.selectAll('.tooltip').data([1]);
					tooltip.enter().append('text').attr('class', 'tooltip');
			
					var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);

					circleGroups.enter().append('g').classed({'circle-group': 1, 'd3-enter': 1});
					circleGroups.exit()
						.classed('d3-exit', 1) // trigger css transition
						.transition().duration(cfg.transitionDuration).remove();

					circleGroups
						.each(function(d) {
							var classed = {'d3-exit': 0}; // if exiting element is being reused
							if(d.className) {
								classed[d.className] = 1;
							}
							d3.select(this).classed(classed);
						})
						.transition().duration(cfg.transitionDuration)
							.each('start', function() {
								d3.select(this).classed('d3-enter', 0); // trigger css transition
							});

					var circle = circleGroups.selectAll('.circle').data(function(datum, i) {
						return datum.axes.map(function(d) { return [d, i]; });
					});

					circle.enter().append('circle')
						.classed({circle: 1, 'd3-enter': 1})
						.on('mouseover', function(d){
							tooltip
								.attr('x', d[0].x - 10)
								.attr('y', d[0].y - 5)
								.text(d[0].value)
								.classed('visible', 1);

							container.classed('focus', 1);
							container.select('.area.radar-chart-serie'+d[1]).classed('focused', 1);
						})
						.on('mouseout', function(d){
							tooltip.classed('visible', 0);

							container.classed('focus', 0);
							container.select('.area.radar-chart-serie'+d[1]).classed('focused', 0);
						});

					circle.exit()
						.classed('d3-exit', 1) // trigger css transition
						.transition().duration(cfg.transitionDuration).remove();

					circle
						.each(function(d) {
							var classed = {'d3-exit': 0}; // if exit element reused
							classed['radar-chart-serie'+d[1]] = 1;
							d3.select(this).classed(classed);
						})
						// styles should only be transitioned with css
						.style('fill', function(d) { return cfg.color(d[1]); })
						.transition().duration(cfg.transitionDuration)
							// svg attrs with js
							.attr('r', cfg.radius)
							.attr('cx', function(d) {
								return d[0].x;
							})
							.attr('cy', function(d) {
								return d[0].y;
							})
							.each('start', function() {
								d3.select(this).classed('d3-enter', 0); // trigger css transition
							});

					// ensure tooltip is upmost layer
					var tooltipEl = tooltip.node();
					tooltipEl.parentNode.appendChild(tooltipEl);
				}
			});
		}

		radar.config = function(value) {
			if(!arguments.length) {
				return cfg;
			}
			if(arguments.length > 1) {
				cfg[arguments[0]] = arguments[1];
			}
			else {
				d3.entries(value || {}).forEach(function(option) {
					cfg[option.key] = option.value;
				});
			}
			return radar;
		};

		return radar;
	},
	draw: function(id, d, options) {
		var chart = RadarChart.chart().config(options);
		var cfg = chart.config();

		d3.select(id).select('svg').remove();
		d3.select(id)
			.append("svg")
			.attr("width", self.width)
			.attr("height", self.height)
			.datum(d)
			.call(chart);
	}
};


RadarChart.defaultConfig.color = function() {};
RadarChart.defaultConfig.radius = 3;
RadarChart.defaultConfig.w = self.radiusRadar;
RadarChart.defaultConfig.h = self.radiusRadar;
var data = [
	{
		className: 'P1', // optional can be used for styling
		axes: [
			{axis: "ST1", value: 13}, 
			{axis: "ST2", value: 6}, 
			{axis: "ST3", value: 5},	
			{axis: "ST4", value: 9},	
			{axis: "ST5", value: 2},
		{axis: "ST6", value: 2}
		]
	},
	{
		className: 'P2',
		axes: [
			{axis: "ST1", value: 6}, 
			{axis: "ST2", value: 7}, 
			{axis: "ST3", value: 10},	 
			{axis: "ST4", value: 13},	 
			{axis: "ST5", value: 9},
		{axis: "ST6", value: 2}
		]
	}
	
];
function randomDataset() {
	return data.map(function(d) {
		return {
			className: d.className,
			axes: d.axes.map(function(axis) {		
		return {axis: axis.axis, value: Math.ceil(Math.random() * 10)};	
			})
		};
	
	});
	
}

//<span></span>


var chart = RadarChart.chart();
var cfg = chart.config(); // retrieve default config
var svg = d3.select(self.element).append('svg')
	.attr('width', self.width)
	.attr('height', self.height)
	.attr('viewBox', '0 0 '+self.height+' '+self.height+'');
	
svg.append('g').classed('single', 1).datum(data).call(chart);

// many radars
//chart.config({w: cfg.w / 4, h: cfg.h / 4, axisText: false, levels: 0, circles: false});
cfg = chart.config();


		
		
				
		
		
		
		
		}
		
		self.update = function() {

		}

		self.rerender = function() {
								$(self.element).find('svg').remove();
								self.render();
						}

						self.engridChangeHandle = $(window).on('engrid-change', function() {
								self.rerender()
						});
						self.resizeHandle = $(window).on('resize', function() {
								self.rerender()
						});
		
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
	RadarPlot.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: RadarPlot
		},
		template: templateMarkup
	};

});
define(['jquery', 'knockout', 'd3', 'text!./circle-pack.html'], function($, ko, d3, templateMarkup) {

	function CirclePack (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true)

		self.data = params.data || ko.observable(
		{
			"name":"Topics",
		 	"children":[
			{
				"name":"topic-1",
				"size":100,
				"children":[
				{
					"name":"Classes",
					"size":20,
					"children":[
					{
						"name":"class-1",
						"size":1
					},
					{
						"name":"class-2",
						"size":1
					},
					{
						"name":"class-3",
						"size":1
					},
					{
						"name":"class-4",
						"size":1
					}],
				},
				{
					"name":"Proposals",
					"size":10,
					"children":[
					{
						"name":"proposal-1",
						"size":1
					}],
				},
				{
					"name":"Publications",
					"size":15,
					"children":[
					{
						"name":"pub-1",
						"size":1
					},
					{
						"name":"pub-2",
						"size":1
					},
					{
						"name":"pub-3",
						"size":1
					},
					{
						"name":"pub-4",
						"size":1
					}],
				}]
			},
	
			{
				"name":"topic-2",
				"size":200
			},
			{
				"name":"topic-3",
				"size":300
			}]
		});

		// list variable common to both render() and update()
		self.svg = null;

		self.render = function() {
			var margin = {top: 10, right: 10, bottom: 10, left: 10};
			self.width = $(self.element.parentElement).width() - margin.left - margin.right;
			self.height = $(self.element.parentElement).height() - margin.top - margin.bottom;


			var data = self.data();
			
			var r = Math.min(self.width - margin.left - margin.right, self.height - margin.top - margin.bottom),
				x = d3.scale.linear().range([0, r]),
				y = d3.scale.linear().range([0, r]),
				node,
				root;

			var pack = d3.layout.pack()
				.size([r, r])
				.value(function(d) { return d.size; })

			var vis = d3.select(self.element).insert("svg:svg", "h2")
				.attr("width", self.width)
				.attr("height", self.height)
			  .append("svg:g")
				.attr("transform", "translate(" + ((self.width - r) / 2) + "," + ((self.height - r) / 2) + ")");
						
			node = root = data;

			var nodes = pack.nodes(root);

			vis.selectAll("circle")
				.data(nodes)
			.enter().append("svg:circle")
				.attr("class", function(d) { return d.children ? "parent" : "child"; })
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.attr("r", function(d) { return d.r; })
				.on("click", function(d) { return zoom(node == d ? root : d); });

			vis.selectAll("text")
				.data(nodes)
			.enter().append("svg:text")
				.attr("class", function(d) { return d.children ? "parent" : "child"; })
				.attr("x", function(d) { return d.x; })
				.attr("y", function(d) { return d.y; })
				.attr("dy", ".35em")
				.attr("text-anchor", "middle")
				.style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
				.text(function(d) { return d.name; });

			d3.select(window).on("click", function() { zoom(root); });

			function zoom(d, i) {
				var k = r / d.r / 2;
					x.domain([d.x - d.r, d.x + d.r]);
					y.domain([d.y - d.r, d.y + d.r]);

				var t = vis.transition()
					.duration(d3.event.altKey ? 7500 : 750);

				t.selectAll("circle")
					.attr("cx", function(d) { return x(d.x); })
					.attr("cy", function(d) { return y(d.y); })
					.attr("r", function(d) { return k * d.r; });

				t.selectAll("text")
					.attr("x", function(d) { return x(d.x); })
					.attr("y", function(d) { return y(d.y); })
					.style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

				node = d;
				d3.event.stopPropagation();
			}
			self.firstRender(false)
		}
		
		self.update = function() {
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

		$( window ).resize(function() {
				self.update();
		})

		$( window ).on('engrid-change', function() {
				self.update();
		})

		return self;
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	CirclePack.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: CirclePack
		},
		template: templateMarkup
	};

});
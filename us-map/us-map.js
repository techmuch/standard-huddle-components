define(['jquery', 'knockout', 'd3', 'text!./us-map.html'], function($, ko, d3, templateMarkup) {
	

	function UsMap (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true)

		self.data = params.data || ko.observable({})
		
		
		
				FizzyText = function() {
					//this.Plot = 'U.S. Map';
					//this.Data = 'Data';
					this.Size = 1;
					//console.log(this.Size);
				};
				var text = new FizzyText();
				var gui = new dat.GUI({ autoPlace: false });
				//gui.add(text, 'Plot');
				gui.add(text, 'Size', 0, 2).onChange(function(newValue) {
					self.update();
				});
				//gui.add(text, 'displayOutline');
				//gui.add(text, 'explode');
				//gui.add(text, 'Data', [ 'Workforce', 'Budget', 'Risk' ] );

				var customContainer = usMapDiv;
				customContainer.appendChild(gui.domElement);
		

		
		
		
		// list variable common to both render() and update()
		self.svg = null;
		self.width=null;
		self.height=null;
		self.projection=null;
		self.width = $(self.element.parentElement).width();
		self.height = $(self.element.parentElement).height();
        self.config = params.data.layout || ko.observable('a=/bcd2/2e3f;f=/ghij/klm/o2p3qr;');		
		$( window ).resize(function() {
			if(self.config() !== ''){
				self.update()
			}
		})
		
		self.render = function() {
			var data=self.data();
		self.projection = d3.geo.albersUsa()
			.scale(scaleCalculation(self.width, self.height))
			.translate([self.width / 2+5, self.height / 2-offsetHeight(self.width, self.height)]);
		self.path = d3.geo.path()
			.projection(self.projection);
		self.svg = d3.select(self.element).append("svg")
			.attr("width", self.width)
			.attr("height", self.height);
		self.g = self.svg.append("g");
	
		d3.json("/components/us-map/us.json", function(error, us) {//No


			self.g.append("g")
			  .attr("id", "states")
			.selectAll("path")
			  .data(topojson.feature(us, us.objects.states).features)
			.enter().append("path")
			  .attr("d", self.path)

			self.g.append("path")
			  .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
			  .attr("id", "state-borders")
			  .attr("d",self.path);
			self.g.selectAll("circle")
				   .data(data)
				   .enter()
				   .append("circle")
				   .attr("cx", function(d) {
						   return self.projection([d.lon, d.lat])[0];
						   
				   })
				   .attr("cy", function(d) {
						   return self.projection([d.lon, d.lat])[1];
				   })
				   .attr("r", function(d) {
						   return d.pop*circleScaling(self.width, self.height);
				   })
				   .style("fill", "red");

		});
		
		
		function scaleCalculation(w, h){
			var scale1=250*w/143-27630/143;
			var scale2=25/11*h-2275/11;
			return Math.min(scale1,scale2);
		}

		function circleScaling(w, h){
			var scale1=scaleCalculation(self.width, self.height);
			var scaleDots=scale1/920;
			return scaleDots;
		}
		
		function offsetHeight(w, h){
			var scale1=scaleCalculation(self.width, self.height);
			var scaleDots=10*scale1/257-1755/257;
			return Math.max(2,scaleDots);
		}
		
		/*var mouseOn = function() { 
	
		var circle = d3.select(this);
		console.log('bip')
		};*/
		
				
		};
		
		
		self.update = function() {
			
			var data = self.data();
			var transDuration = 25;
			var transition = self.svg.transition().duration(transDuration);
			function scaleCalculation(w, h){
			var scale1=250*w/143-27630/143;
			var scale2=25/11*h-2275/11;
			return Math.min(scale1,scale2);
		}
			function offsetHeight(w, h){
			var scale1=scaleCalculation(self.width, self.height);
			var scaleDots=10*scale1/257-1755/257;
			return Math.max(2,scaleDots);
		}
			function circleScaling(w, h){
			var scale1=scaleCalculation(self.width, self.height);
			var scaleDots=scale1/920;
			var scalingFactorControl=text.Size;
			return scaleDots*scalingFactorControl;
		}
		
				self.width = $(self.element.parentElement).width();
				self.height = $(self.element.parentElement).height();	
				
				self.svg.attr("width", self.width);
				self.svg.attr("height", self.height);
				self.projection.scale(scaleCalculation(self.width, self.height));
				self.projection.translate([self.width / 2+5, self.height / 2-offsetHeight(self.width, self.height)]);
					var circles = self.svg.selectAll("circle");
					circles.data(data);
					circles.transition().duration(transDuration)
	  				   .attr("cx", function(d) {
						   return self.projection([d.lon, d.lat])[0];
						   
				   })
				   .attr("cy", function(d) {
						   return self.projection([d.lon, d.lat])[1];
				   })
				   .attr("r", function(d) {
						   return d.pop*circleScaling(self.width, self.height);
				   })
				self.g.selectAll("path").attr("d", self.path);
				
			
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
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	UsMap.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: UsMap
		},
		template: templateMarkup
	};



});
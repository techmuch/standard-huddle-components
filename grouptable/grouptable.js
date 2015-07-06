define(['jquery', 'knockout', 'd3', 'text!./grouptable.html'], function($, ko, d3, templateMarkup) {
	
	function GroupTable(params, componentInfo) {
		
		var self = this;
		
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true);
		
		self.data = params.data;
		
		self.width = null;
		self.height = null;
		self.svg = null;
		self.groupSelector = null;
		
		self.rowsShown = 15;
		
    // draws one row in the table
    self.row = function(rowData) {
      var attrLen = rowData.length;
      
      var cell = d3.select(this).selectAll(".cell")
        .data(rowData)
        .enter().append("g")
        .attr("class", "cell")
        .attr("x", function(d, i) { return (self.width / attrLen) * i; })
        .attr("width", self.width / attrLen)
        .attr("height", self.height / self.rowsShown)
        .on("click", function(d, i) {
          self.groupChanged(i);
        });
      
      cell.append("rect")
        .attr("x", function(d, i) { return (self.width / attrLen) * i; })
        .attr("fill", "rgba(255,255,255,1)")
        .attr("stroke", "gray")
        .attr("width", self.width / attrLen)
        .attr("height", self.height / self.rowsShown - 1);
      
      cell.append("text")
        .attr("x", function(d, i) { return (self.width / attrLen) * i + 10; })
        .attr("y", self.height / self.rowsShown / 2)
        .attr("dy", ".35em")
        .text(function(d) { return d; });
        
    }
    
    // update groups
    self.groupChanged = function(groupIndex) {
      
      var data = self.data();
      
      // remove previous svgs
      d3.selectAll(".rows").selectAll(".row").remove();

      var vertOffset = self.height/self.rowsShown + 60;
      
      // draws rows based on groups
      var groupValues = [];
      data.data.forEach(function(element) {
        if (groupValues.indexOf(element[groupIndex]) == -1) groupValues.push(element[groupIndex]);
      });
      
      var iGroup = 0;
      groupValues.forEach(function(element) {
        
        self.svg.selectAll(".row").filter(".a" + iGroup)
            .data(data.data.filter( function(d) { 
            return d[groupIndex] == element; 
            }))
          .enter().append("g")
            .attr("class", "row a" + iGroup)
            .attr("transform", function(d, i) {
              vertOffset += self.height/self.rowsShown;
              return "translate(0," + (vertOffset - self.height/self.rowsShown) + ")"; })
            .each(self.row);
        
        vertOffset += 50;
        iGroup++;
        
      });
      
     
    }
		
		self.render = function() {
			
			var data = self.data();
			
			var widthpx = self.width = $(self.element.parentElement).width();
			var heightpx = self.height = $(self.element.parentElement).height();
			
			var margin = {
					top: 50,
					right: 30,
					bottom: 50,
					left: 50
			};
			self.width = widthpx - margin.left - margin.right;
			self.height = heightpx - margin.top - margin.bottom;

			// svg
      self.svg = d3.select(self.element).append("svg")
        .attr("width", self.width + margin.left + margin.right)
        .attr("height", self.height + margin.top + margin.bottom)
        .append("g")
        .attr("class", "rows")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // draw header
      var headerArr = [data.headers];
      self.svg.selectAll("tbheader")
        .data(headerArr)
      .enter().append("g")
        .attr("class", "tbheader")
        .attr("transform", function(d, i) {
          return "translate(0," + 30 + ")"; })
        .each(self.row);

      // update view
      self.groupChanged(0);
			
			this.firstRender(false);
		};
		
		
		self.update = function() {
		  self.groupChanged(0);
		};		
		
		self.reactor = ko.computed(function() {
			var data = self.data();
			
			if (typeof data.data !== 'undefined') {
				if (self.firstRender()) {
					self.render();
				} else {
					self.update();
				}
			}			
			return data;
		});
	}
	
	GroupTable.prototype.dispose = function() {};
	
	return {
		viewModel: {
			createViewModel: GroupTable
		},
		template: templateMarkup
	}
	
	
});
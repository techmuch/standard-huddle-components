define(['jquery', 'knockout', 'd3', 'text!./diverging-color-selector.html'], function($, ko, d3, templateMarkup) {

	function DivergingColorSelector (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;	
		self.svg = d3.select(this.element).selectAll(".div-palette")
					.data(d3.entries(tm.divergingColors))
					.enter().append("div-span")
					.attr("class", "div-palette")
					.attr("title", function(d) { return d.key; })
					.on("click", function(d) { 
						tm.selectedColors(d.value);
					})
					.selectAll(".div-swatch")
					.data(function(d) { return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]]; })
					.enter().append("div-span")
					.attr("class", "div-swatch")
					.style("background-color", function(d) { return d; });				
		return self;
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	DivergingColorSelector.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: DivergingColorSelector
		},
		template: templateMarkup
	};

});
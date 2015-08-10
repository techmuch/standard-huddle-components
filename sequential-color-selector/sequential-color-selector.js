define(['jquery', 'knockout', 'd3', 'text!./sequential-color-selector.html'], function($, ko, d3, templateMarkup) {

	function SequentialColorSelector (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;	
		self.svg = d3.select(this.element).selectAll(".seq-palette")
					.data(d3.entries(tm.sequentialColors))
					.enter().append("seq-span")
					.attr("class", "seq-palette")
					.attr("title", function(d) { return d.key; })
					.on("click", function(d) { 
						tm.selectedColorsStackedBarChart(d.value);
						tm.selectedColorsGroupedBarChart(d.value);
						tm.selectedColorsPieChart(d.value);
						tm.selectedColorsBarChart(d.value);
					})
					.selectAll(".seq-swatch")
					.data(function(d) { return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]]; })
					.enter().append("seq-span")
					.attr("class", "seq-swatch")
					.style("background-color", function(d) { return d; });				
		return self;
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	SequentialColorSelector.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: SequentialColorSelector
		},
		template: templateMarkup
	};

});
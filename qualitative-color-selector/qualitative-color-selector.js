define(['jquery', 'knockout', 'd3', 'text!./qualitative-color-selector.html'], function($, ko, d3, templateMarkup) {

	function QualitativeColorSelector (params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;	
		self.svg = d3.select(this.element).selectAll(".qual-palette")
					.data(d3.entries(tm.qualitativeColors))
					.enter().append("qual-span")
					.attr("class", "qual-palette")
					.attr("title", function(d) { return d.key; })
					.on("click", function(d) { 
						tm.selectedColorsStackedBarChart(d.value);
						tm.selectedColorsGroupedBarChart(d.value);
						tm.selectedColorsPieChart(d.value);
						tm.selectedColorsBarChart(d.value);
					})
					.selectAll(".qual-swatch")
					.data(function(d) { return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]]; })
					.enter().append("qual-span")
					.attr("class", "qual-swatch")
					.style("background-color", function(d) { return d; });				
		return self;
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	QualitativeColorSelector.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: QualitativeColorSelector
		},
		template: templateMarkup
	};

});
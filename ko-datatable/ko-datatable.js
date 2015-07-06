define(['knockout', 'text!./ko-datatable.html'], function(ko, templateMarkup) {

	function KoDatatable (params, componentInfo) {
		var self = this;	
		self.data = params.data(); // loads the data table
		return self;
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	KoDatatable.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: KoDatatable
		},
		template: templateMarkup
	};

});
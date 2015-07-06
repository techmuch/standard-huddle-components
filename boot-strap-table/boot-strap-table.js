define(['knockout', 'text!./boot-strap-table.html'], function(ko, templateMarkup) {

	function BootStrapTable (params, componentInfo) {
		var vm = function(params, componentInfo){
			var self = this;
		
			self.data = params.data || ko.observable({header:['People'], data:[['sarah'],['david']]})

			self.header = ko.observable([]);
			self.rows = ko.observable([]);

			self.reactor = ko.computed(function(){
				var d = self.data();
				self.header(d.header);
				self.rows(d.data);
			})

			return self;
		}

		return new vm(params)
		
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	BootStrapTable.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: BootStrapTable
		},
		template: templateMarkup
	};

});
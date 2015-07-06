define(['knockout', 'text!./boot-strap-controls.html'], function(ko, templateMarkup) {

	function BootStrapControls (params, componentInfo) {	

		var d = params.data();
		for (var i = 0; i < d.length; i++) {
			var uid = Math.floor(Math.random()*1000000);
			d[i].id = uid
		};

		var vm = function(params, componentInfo){
			var self = this;
			self.data = params.data || ko.observable([]);

			self.controlsId = Math.floor(Math.random()*1000000);

			return self;

		}

		return new vm(params)
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	BootStrapControls.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: BootStrapControls
		},
		template: templateMarkup
	};

});
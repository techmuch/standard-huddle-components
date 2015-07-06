define(['knockout', 'text!./doc-viewer.html'], function(ko, templateMarkup) {

	function DocViewer (params, componentInfo) {
		var vm = function(params, componentInfo){
			var self = this;
			
			self.docId = ko.observable(params.data);
			self.content = ko.computed(function(){
				var id = self.docId();
				var d = doc.documentation
				for (var i = 0; i < d.length; i++) {
					if(d[i].id === id){
						return d[i].contents
					}
				};
				return 'Document not found...'
			})

			return self;

		}

		return new vm(params)
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	DocViewer.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: DocViewer
		},
		template: templateMarkup
	};

});
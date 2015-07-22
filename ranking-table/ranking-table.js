define(['jquery','knockout','text!./ranking-table.html','bootstrap','knockstrap'], function($,ko, templateMarkup) {

	function RankingTable (params, componentInfo) {
		
		var self = this;
		self.element = componentInfo.element;
		self.data = params.data || ko.observable(null);
		self.extOld = params.old || ko.observable(null);
		
		self.updateExtOld = function(){
				var n = {};
				var o = self.data();
				for(var i = 0; i < o.length; i++){
					n[o[i].label]=i}
				self.extOld(n);
		}
				
		self.old = ko.observable({});
			
		self.table = ko.computed(function(){
			var o = self.data();
			var old = {};
			var a = [];
			
			var change = function(i, label){
				var old = self.extOld() || self.old()
				if(typeof old[label] === 'undefined'){
					return 0;
				}else{
					return old[label] - i;
				}
			}
			
			for(var i = 0; i < o.length; i++){
				a.push({
					label: o[i].label,
					relativeScore: o[i].relativeScore * 100,
					change: change(i, o[i].label)
				});
				old[o[i].label] = i;
			}
			
			self.old(old);
			return a;
		});
					
		return self;
		
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	RankingTable.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: RankingTable
		},
		template: templateMarkup
	};

});
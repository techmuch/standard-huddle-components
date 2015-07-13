define(['jquery','knockout','text!./ranking-table.html','bootstrap','knockstrap'], function($,ko, templateMarkup) {

	function RankingTable (params, componentInfo) {
		
		var self = this;
		self.element = componentInfo.element;
		self.data = params.data || ko.observable([{"label":"TC4","weighting":1,"weightedScore":421.2993279338273,"relativeScore":1},{"label":"TC2","weighting":1,"weightedScore":327.5547130794416,"relativeScore":0.7774869109947643},{"label":"TC1","weighting":1,"weightedScore":253.66189901774945,"relativeScore":0.6020942408376964},{"label":"TC3","weighting":1,"weightedScore":-84545.51094261589,"relativeScore":-200.6780104712042}]);
		self.extOld = params.old || ko.observable(null);
		
		self.updateExtOld = function(){			
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
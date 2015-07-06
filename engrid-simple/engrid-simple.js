define(['knockout', 'text!./engrid-simple.html'], function(ko, templateMarkup) {

	function EngridSimple (params) {
		var self = this;

		// remove all listeners on window
		$(window).off('engrid-change');
        
        self.config = params.data.layout || ko.observable('a=/bcd2/2e3f;f=/ghij/klm/o2p3qr;');
		self.showConfig = params.data.showConfiguration || ko.observable(false);
        self.content = params.data

        self.showExpand = ko.observable(true)
        self.orinigalLayout = self.config();
        self.fullsize = function(engrid, event){
        	var n = event.toElement.attributes['data-panel'].value
        	if(self.showExpand()){
        		self.config('a=/'+n);
        		self.showExpand(false);
        	}else{
        		self.resetLayout();
        		self.showExpand(true);
        	}
        }
        self.showDocumentation = function(engrid, event){
        	var n = event.toElement.attributes['data-panel'].value
        	var m = event.toElement.attributes['data-layout'].value
        	if(self.config() === self.orinigalLayout || self.config() === 'a=/'+n){
        		self.config(m);
        	}else{
        		self.resetLayout();
        	}
        }
        self.resetLayout = function(){
        	self.config(self.orinigalLayout);
        	self.showExpand(true);
        }


		self.divGenerator = function(){
			var tags = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
			var divString = '';
			for (var i = 0; i < tags.length; i++) {
                var c = '';
                var border = self.showConfig() ? 'tile-border' : ''
                if(typeof self.content[tags[i]] !== 'undefined'){
                    var w = self.content[tags[i]].widget() || ''; //widget
                    var p = self.content[tags[i]].params() || ''; //params to pass to widgets
                    var h = self.content[tags[i]].html() || ''; // pure html
                    var c1 = h === '' ? '' : h;
                    var c2 = w === '' ? '' : '<'+w+' params="'+p+'"></'+w+'>';
                    var c = c1 + c2;
                    if(typeof self.content[tags[i]].doc === 'function' && self.content[tags[i]].doc() !== ''){ // layout for documentation
                    	var d_html = '<span style="margin-right: 20px;" class="glyphicon glyphicon-question-sign pull-right" aria-hidden="true" data-panel="'+tags[i]+'" data-layout="'+self.content[tags[i]].doc()+'" data-bind="click: showDocumentation"></span>';
                    }else{
                    	var d_html = '';
                    }

                    if(typeof self.content[tags[i]].config === 'function' && self.content[tags[i]].config() !== ''){ // layout for configuration
                    	var f_html = '<span style="margin-right: 20px;" class="glyphicon glyphicon-wrench pull-right" aria-hidden="true" data-panel="'+tags[i]+'" data-layout="'+self.content[tags[i]].config()+'" data-bind="click: showConfig"></span>';
                    }else{
                    	var f_html = '';
                    }

                    if(typeof self.content[tags[i]].title === 'function' && self.content[tags[i]].title() !== ''){ // a non-blank title triggers the panels to display
                    	var t = self.content[tags[i]].title()
                    	c = '<div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">'+t+'<span class="glyphicon pull-right" aria-hidden="true" data-panel="'+tags[i]+'" data-bind="click: fullsize, css: {\'glyphicon-resize-full\': showExpand(), \'glyphicon-resize-small\': !showExpand()}"></span>'+f_html+d_html+'</h3></div><div class="panel-body">'+c+'</div></div>';
                    }
                }
                else{
                	c = self.showConfig() ? '<h1>'+tags[i]+'</h1>' : '';
                }
				divString += '<div class="grid grid-' + tags[i] + ' '+border+'" style="visibility:hidden;position: absolute"><div class="tile">'+c+'</div></div>'; 
			};
			return divString;
		}
		$('.engrid-container').html(self.divGenerator());

		var nEqn;
		var cEqn = [];
		var i;
		var j;
		var k;
		var nRow;
		var fRow = [];
		var nCol = [];
		var idCol = [];
		var fCol = [];
		for(i=0;i<100;i++){
			idCol[i] = [];
			fCol[i] = [];
		}

		function enGrid(gDivName){				
			var i;
			var j;
			var mWidth = parseInt($('.'+gDivName).width());
			var mHeight = parseInt($('.'+gDivName).height());
			var mTop = parseInt($('.'+gDivName).position().top);
			var mLeft = parseInt($('.'+gDivName).position().left);
			
			$('.'+gDivName).css('visibility','hidden');
			
			var fSumRow = 0;
			for(i=0;i<nRow;i++){
				fSumRow += fRow[i];
			}
			var fSumCol = [];
			for(i=0;i<nRow;i++){
				fSumCol[i] = 0;
				for(j=0;j<nCol[i];j++){
					$('.grid-'+idCol[i][j]).css('height',(mHeight*fRow[i]/fSumRow)+'px');
					$('.grid-'+idCol[i][j]+' div.tile').css('height',(mHeight*fRow[i]/fSumRow)-(20)+'px'); // added by df to set height of panels
					$('.grid-'+idCol[i][j]+' div.panel-body').css('height',(mHeight*fRow[i]/fSumRow)-(20)-50+'px'); // added by df to set height of panels
					fSumCol[i] += fCol[i][j];
				}
				for(j=0;j<nCol[i];j++){
					$('.grid-'+idCol[i][j]).css('width',(mWidth*fCol[i][j]/fSumCol[i])+'px');
				}
			}
			var top0 = mTop;
			var left0 = mLeft;	
			var pGrid;
			var pLeft;
			var pWidth;			
			$('.grid-'+idCol[0][0]).css('top',top0+'px');
			$('.grid-'+idCol[0][0]).css('left',left0+'px');
			for(j=1;j<nCol[0];j++){					
				pGrid = $('.grid-'+idCol[0][j-1]);
				pLeft = parseInt(pGrid.position().left);
				pWidth = parseInt(pGrid.width());					
				$('.grid-'+idCol[0][j]).css('top',top0+'px');
				$('.grid-'+idCol[0][j]).css('left',pLeft+pWidth+'px');
			}
			for(i=1;i<nRow;i++){
				top0 = parseInt($('.grid-'+idCol[i-1][0]).position().top);
				top0 += parseInt($('.grid-'+idCol[i-1][0]).height());
				$('.grid-'+idCol[i][0]).css('top',top0+'px');
				$('.grid-'+idCol[i][0]).css('left',left0+'px');
				for(j=1;j<nCol[i];j++){
					pGrid = $('.grid-'+idCol[i][j-1]);
					pLeft = parseInt(pGrid.position().left);
					pWidth = parseInt(pGrid.width());
					$('.grid-'+idCol[i][j]).css('top',top0+'px');
					$('.grid-'+idCol[i][j]).css('left',pLeft+pWidth+'px');
				}
			}
			for(i=0;i<nRow;i++){
				for(j=0;j<nCol[i];j++){
					$('.grid-'+idCol[i][j]).css('visibility','visible');
				}
			}
		}

		self.processConfiguration = function(){
			if(self.config() === ''){
				return null;
			}
			
			$('.grid').css('visibility','hidden');
			var cStr = self.config(); //var cStr = $('#sConfig').val();
			cStr = cStr.replace(/\s+/g,'');
			cEqn = cStr.split(";");
			nEqn = cEqn.length;
			if(cEqn[nEqn-1].length==0){
				nEqn--;
			}
			for(i=0;i<nEqn;i++){
				var cLHS = cEqn[i].split('=')[0];
				if(i==0){
					$('.grid-'+cLHS).css('left','0px');
					$('.grid-'+cLHS).css('top','0px');
					$('.grid-'+cLHS).css('width','100%');
					$('.grid-'+cLHS).css('height','100%');
					$('.grid-'+cLHS).css('visibility','visible');
				}
					
				var cRHS = cEqn[i].split('=')[1];
				var eLen = cRHS.length;
				nRow = 0;
				for(j=0;j<eLen;j++){
					if(cRHS[j]=='/'){
						if(j>0 && !isNaN(cRHS[j-1])){
							fRow[nRow] = parseInt(cRHS[j-1]);
						}
						else{
							fRow[nRow] = 1;
						}
						nRow++;
					}
				}
				cRHS = cRHS.replace('1/','/');
				cRHS = cRHS.replace('2/','/');
				cRHS = cRHS.replace('3/','/');
				cRHS = cRHS.replace('4/','/');
				cRHS = cRHS.replace('5/','/');
				cRHS = cRHS.replace('6/','/');
				cRHS = cRHS.replace('7/','/');
				cRHS = cRHS.replace('8/','/');
				cRHS = cRHS.replace('9/','/');
				var cRow = cRHS.split("/");
				for(j=1;j<=nRow;j++){
					var rLen = cRow[j].length;
					nCol[j-1] = 0;	
					for(k=0;k<rLen;k++){
						if(isNaN(cRow[j][k])){
							idCol[j-1][nCol[j-1]] = cRow[j][k];
							if(k>0 && !isNaN(cRow[j][k-1])){
								fCol[j-1][nCol[j-1]] = parseInt(cRow[j][k-1]);
							}
							else{
								fCol[j-1][nCol[j-1]] = 1;
							}
							nCol[j-1]++;
						}
					}
					
				}
				enGrid('grid-'+cLHS);						
			}			
		}

		var onConfigChange = ko.computed(function(){
			if(self.config() !== ''){
				//window.setTimeout(self.processConfiguration, 25);
				self.processConfiguration();
				$(window).trigger('engrid-change');
			}
		})

		$( window ).resize(function() {
			if(self.config() !== ''){
				self.processConfiguration();
			}
		})

	}


	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	EngridSimple.prototype.dispose = function() {};

	return {
		viewModel: EngridSimple,
		template: templateMarkup
	};

});
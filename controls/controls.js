define(['knockout', 'text!./controls.html', 'dat-gui'], function(ko, templateMarkup, dat) {



	function Controls (params, componentInfo) {
		var self = this;
		var dat = {
			GUI: dat
		}

		self.controled = params.data || ko.observable([]);
		/*self.outcomes = self.databases.outcomes();
		self.technologies = self.databases.technologies();
			
			
					
			
			var controlOutcomes=[];
			for (i=0;i<self.outcomes.length;i++){
				controlOutcomes[i]={Name:self.outcomes[i].name(), variable: self.outcomes[i].weighting, min: 0, max: 100, typeV:'range'};
			}
			
			var controlTechnologies=[];
			for (i=0;i<self.technologies.length;i++){
				controlTechnologies[i]={Name:self.technologies[i].name(), variable: self.technologies[i].weighting, typeV:'checkbox'};
			}
			
			self.controled = ko.observable([
			{
				folder: 'Outcomes',
				controls:controlOutcomes
			},
			{
				folder: 'Technologies',
				controls:controlTechnologies
				
			}
			]);*/

		var numbFolders=self.controled().length;
		
		
		var gui = new dat.GUI({ autoPlace: false });
		
		
		var configuration = {};

		//Function that drives all events
		var createEvents = function(i, j, self,tempName, typeV){
			if(typeV === 'range'){
				self.controled()[j].controls[i].handle.onChange(function(){self.controled()[j].controls[i].variable(configuration[tempName])})
				ko.computed(function(){configuration[tempName] = Number(self.controled()[j].controls[i].variable())})
			}else if(typeV === 'checkbox'){
				self.controled()[j].controls[i].handle.onChange(function(){self.controled()[j].controls[i].variable(configuration[tempName])})
				ko.computed(function(){
					var v = self.controled()[j].controls[i].variable();
					if(v === 'true' || v === '1' || v === true){
						configuration[tempName] = true;
					}else{
						configuration[tempName] = false;
					}
				})
			}else{
				self.controled()[j].controls[i].handle.onChange(function(){self.controled()[j].controls[i].variable(configuration[tempName])})
				ko.computed(function(){configuration[tempName] = self.controled()[j].controls[i].variable()})
			}
			self.controled()[j].controls[i].handle.listen();
			
		}
		
		
		for (j=0;j<numbFolders;j++){
			var numbElements=self.controled()[j].controls.length;
			var folder = gui.addFolder(self.controled()[j].folder);
			
		for (i=0;i<numbElements;i++){
			
			//Variable definition
			var tempName = self.controled()[j].controls[i].Name;
			var typeV = self.controled()[j].controls[i].typeV;
			
			
			if (typeV ==='range'){//Slider bar
				configuration[tempName] = Number(self.controled()[j].controls[i].variable());
				self.controled()[j].controls[i].handle = folder.add(configuration, tempName, self.controled()[j].controls[i].min, self.controled()[j].controls[i].max);
			
			}else if(typeV ==='checkbox'){//Checkbox
				var v = self.controled()[j].controls[i].variable();
				if(v === 'true' || v === '1' || v === true){
					configuration[tempName] = true;
				}else{
					configuration[tempName] = false;
				}
				self.controled()[j].controls[i].handle = folder.add(configuration, tempName);
			
			}else if(typeV ==='menu'){//Menu
				self.controled()[j].controls[i].handle = folder.add(configuration, tempName,self.controled()[j].controls[i].listOptions);
			
			}
			
			
			
			createEvents(i, j, self, tempName, typeV);
			folder.open();
			
		}


		
			
		}
		
		//Loop on all elements in the current folder
		



		
		//eval("NOx.onChange(function(){self.controled() [1].value=configuration['NOx']     });	NOx.listen();")
				
		gui.domElement.style.position='absolute';
		//gui.domElement.style.left="0px";
		var customContainer = controlMenu;
		customContainer.appendChild(gui.domElement);

		
		
		
		
		
		
		
		//With self.controled from dataprovider
			/*
		var numbFolders=self.controled().length;
		
		
		var gui = new dat.GUI({ autoPlace: false });
		
		
		var configuration = {};

		//Function that drives all events
		var createEvents = function(i, j, self,tempName){
			self.controled()[j].controls[i].handle.onChange(function(){self.controled()[j].controls[i].variable(configuration[tempName])})
			self.controled()[j].controls[i].handle.listen();
			self.update = ko.computed(function(){configuration[tempName] = self.controled()[j].controls[i].variable()})
		}
		
		
		for (j=0;j<numbFolders;j++){
			var numbElements=self.controled()[j].controls.length;
			var folder = gui.addFolder(self.controled()[j].folder);
			
		for (i=0;i<numbElements;i++){
			
			//Variable definition
			var tempName=self.controled()[j].controls[i].Name;
			configuration[tempName]=self.controled()[j].controls[i].variable();
			
			
			if (self.controled()[j].controls[i].typeV=='range'){//Slider bar
				self.controled()[j].controls[i].handle = folder.add(configuration, tempName, self.controled()[j].controls[i].min, self.controled()[j].controls[i].max);
			
			}else if(self.controled()[j].controls[i].typeV=='checkbox'){//Checkbox
			
				self.controled()[j].controls[i].handle = folder.add(configuration, tempName);
			
			}else if(self.controled()[j].controls[i].typeV=='menu'){//Menu
				self.controled()[j].controls[i].handle = folder.add(configuration, tempName,self.controled()[j].controls[i].listOptions);
			
			}
			
			
			
			createEvents(i, j, self, tempName);
			folder.open();
			
		}


		
			
		}
		
		//Loop on all elements in the current folder
		



		
		//eval("NOx.onChange(function(){self.controled() [1].value=configuration['NOx']     });	NOx.listen();")
				
		gui.domElement.style.position='absolute';
		//gui.domElement.style.left="0px";
		var customContainer = controlMenu;
		customContainer.appendChild(gui.domElement);
		*/
		return self;
		
	}


	
	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Controls.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: Controls
		},
		template: templateMarkup
	};

});
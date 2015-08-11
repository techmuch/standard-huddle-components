define(["knockout", "text!./settings-page.html", "mapping"], function(ko, Template, map) {

	 function ViewModel(route) {
		this.layout = map.fromJS({
			layout: 'a = /f',
			showConfiguration: false,
			f:{
				title: 'Settings',
				widget: 'settings-manager',
				params: '',
				html: ''
			}
		/*b: {
			html: '<h2>Sequential Color Selection</h2>',
			widget: 'sequential-color-selector',
			params: ''
			},
		c: {
			html: '<h2>Diverging Color Selection</h2>',
			widget: 'diverging-color-selector',
			params: ''
			},
		d: {
			html: '<h2>Qualitative Color Selection</h2>',
			widget: 'qualitative-color-selector',
			params: ''
			},
		e: {
			html: '<h2>Controls</h2>',
			widget: 'controls',
			params: ''
			}*/
		});
	}

	ViewModel.prototype.doSomething = function() {
		this.message('You invoked doSomething() on the viewmodel.');
	};

	return { viewModel: ViewModel, template: Template };

});

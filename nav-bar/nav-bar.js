define(['knockout', 'text!./nav-bar.html'], function(ko, template) {

	function NavBarViewModel(params) {

		var self = this;

		self.route = params.route;
		self.routes = params.routes;
		self.experimentalMode = params.experimentalMode;

		self.tabsLeft = ko.observableArray([]);
		self.tabsRight = ko.observableArray([]);

		self.compuTabs = ko.computed(function() {
			for (var i = 0; i < self.routes().length; i++) {
				if (self.routes()[i].params.pullRight === true) {
					self.tabsRight.push(self.routes()[i]);
				} else {
					self.tabsLeft.push(self.routes()[i]);
				}
			};
		})

		self.toggleExperimentalMode = function(navBarViewModel, event) {
			if (event.ctrlKey) {
				if (self.experimentalMode()) {
					self.experimentalMode(false)
				} else {
					self.experimentalMode(true)
				}
			} else {
				window.location.hash = '';
			}
		}

		$(window).on('shown.bs.dropdown', function() {
			$('ul.dropdown-menu.mega-dropdown-menu').on('click', function(event) {
				var events = $._data(document, 'events') || {};
				events = events.click || [];
				for (var i = 0; i < events.length; i++) {
					if (events[i].selector) {

						//Check if the clicked element matches the event selector
						if ($(event.target).is(events[i].selector)) {
							events[i].handler.call(event.target, event);
						}

						// Check if any of the clicked element parents matches the 
						// delegated event selector (Emulating propagation)
						$(event.target).parents(events[i].selector).each(function() {
							events[i].handler.call(this, event);
						});
					}
				}
				event.stopPropagation(); //Always stop propagation
			});
		})

		$(window).on('hidden.bs.dropdown', function() {
			$('ul.dropdown-menu.mega-dropdown-menu').off();
		})

		self.dispose = function() {
		}

		return self
	}

	return {
		viewModel: NavBarViewModel,
		template: template
	};
});
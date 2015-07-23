define(['knockout', 'text!./nav-bar.html'], function(ko, template) {

    function NavBarViewModel(params) {

        var self = this;

        self.route = params.route;
        self.routes = params.routes;
        self.experimentalMode = params.experimentalMode;

        self.navbarWidth = ko.observable($('.navbar').width())

        self.menuWidth = ko.computed(function() {
            return self.navbarWidth() - $('.navbar-header').width() - 33 + 'px'
        });

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

        self.resizeHandle = $(window).resize(function() {
            self.navbarWidth($('.navbar').width());
        })

        self.dispose = function() {
            self.resizeHandle.off();
        }

        return self
    }

    return {
        viewModel: NavBarViewModel,
        template: template
    };
});
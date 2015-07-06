define(['knockout', 'text!./nav-bar.html'], function(ko, template) {

  function NavBarViewModel(params) {

    // This viewmodel doesn't do anything except pass through the 'route' parameter to the view.
    // You could remove this viewmodel entirely, and define 'nav-bar' as a template-only component.
    // But in most apps, you'll want some viewmodel logic to determine what navigation options appear.

    this.route = params.route;
    this.routes = params.routes;
    this.experimentalMode = params.experimentalMode;
    this.menuWidth = ko.computed(function(){
    	return $('.navbar').width() - $('.navbar-header').width() - 33 + 'px'
    });
    this.navbarWidth = ko.observable($('.navbar').width())
    this.toggleExperimentalMode = function(navBarViewModel, event){
        if(event.ctrlKey){
            if(this.experimentalMode()){
                this.experimentalMode(false)
            }else{
                this.experimentalMode(true)
            }
        }else{
            window.location.hash = '';
        }
    }

    $(window).resize(function(){
    	this.navbarWidth($('.navbar').width());
    })
  }

  return { viewModel: NavBarViewModel, template: template };
});

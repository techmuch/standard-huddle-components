define(["knockout", "text!./about.html", "mapping", "text!./nav.html", "text!./contents.html"], function(ko, Template, map, nav, contents) {

  function ViewModel(route) {
  	var self = this;

    self.layout = map.fromJS(
        {
            //layout: "a=/bg;b=/c/def/lmn;g=/h/ijk;",
            layout: "a=/3qc",
            showConfiguration: false,
            q: {
            	title: 'Documentation',
                widget: "",
                params: "",
                html: contents
            },
            c: {
            	title: "Table of Contents",
                widget: "",
                params: "",
                html: nav
            }
        });
  }

  return { viewModel: ViewModel, template: Template };

});
define(['knockout', 'text!./controls.html', 'dat-gui'], function(ko, templateMarkup, dat) {



    function Controls(params, componentInfo) {
        var vm = function(params) {
            var self = this;
            self.element = componentInfo.element;

            self.controled = params.data || ko.observable([]);
            
            var numbFolders = self.controled().length;


            var gui = new dat.GUI({
                autoPlace: false
            });


            var configuration = {};

            //Function that drives all events
            var createEvents = function(i, j, self, tempName, typeV) {
                if (typeV === 'range') {
                    self.controled()[j].controls[i].handle.onChange(function() {
                        self.controled()[j].controls[i].variable(configuration[tempName])
                    })
                    ko.computed(function() {
                        configuration[tempName] = Number(self.controled()[j].controls[i].variable())
                    })
                } else if (typeV === 'checkbox') {
                    self.controled()[j].controls[i].handle.onChange(function() {
                        self.controled()[j].controls[i].variable(configuration[tempName])
                    })
                    ko.computed(function() {
                        var v = self.controled()[j].controls[i].variable();
                        if (v === 'true' || v === '1' || v === true) {
                            configuration[tempName] = true;
                        } else {
                            configuration[tempName] = false;
                        }
                    })
                } else {
                    self.controled()[j].controls[i].handle.onChange(function() {
                        self.controled()[j].controls[i].variable(configuration[tempName])
                    })
                    ko.computed(function() {
                        configuration[tempName] = self.controled()[j].controls[i].variable()
                    })
                }
                self.controled()[j].controls[i].handle.listen();

            }


            for (j = 0; j < numbFolders; j++) {
                var numbElements = self.controled()[j].controls.length;
                var folder = gui.addFolder(self.controled()[j].folder);

                for (i = 0; i < numbElements; i++) {

                    //Variable definition
                    var tempName = self.controled()[j].controls[i].Name;
                    var typeV = self.controled()[j].controls[i].typeV;


                    if (typeV === 'range') { //Slider bar
                        configuration[tempName] = Number(self.controled()[j].controls[i].variable());
                        self.controled()[j].controls[i].handle = folder.add(configuration, tempName, self.controled()[j].controls[i].min, self.controled()[j].controls[i].max);

                    } else if (typeV === 'checkbox') { //Checkbox
                        var v = self.controled()[j].controls[i].variable();
                        if (v === 'true' || v === '1' || v === true) {
                            configuration[tempName] = true;
                        } else {
                            configuration[tempName] = false;
                        }
                        self.controled()[j].controls[i].handle = folder.add(configuration, tempName);

                    } else if (typeV === 'menu') { //Menu
                        self.controled()[j].controls[i].handle = folder.add(configuration, tempName, self.controled()[j].controls[i].listOptions);

                    }



                    createEvents(i, j, self, tempName, typeV);
                    folder.open();

                }




            }

            gui.domElement.style.position = 'absolute';
            //gui.domElement.style.left="0px";
            
            self.element.appendChild(gui.domElement);
            window.a=gui
            gui.close();

            // This runs when the component is torn down. Put here any logic necessary to clean up,
            // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
            self.dispose = function() {};

            return self;
        }
        return new vm(params);

    }





    return {
        viewModel: {
            createViewModel: Controls
        },
        template: templateMarkup
    };

});
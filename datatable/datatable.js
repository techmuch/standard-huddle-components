define(['jquery', 'knockout', 'd3', 'text!./datatable.html'], function($, ko, d3, templateMarkup) {

	function Datatable(params, componentInfo) {
		var self = this;
		self.element = componentInfo.element;
		self.firstRender = ko.observable(true)

		self.data = params.data

		self.table = null;
		
		self.width = $(self.element.parentElement).width();
		self.height = $(self.element.parentElement).height();

		//debugger;

		self.render = function() {
			var data = self.data();

			self.table = d3.select(this.element).append("table")

			self.thead = self.table.append("thead");
			self.tbody = self.table.append("tbody");

			// append the header row
			self.thead.append("tr")
				.selectAll("th")
				.data(data.headers)
				.enter()
				.append("th")
				.text(function(header) {
					return header;
				});

			// create a row for each object in the data
			var rows = self.tbody.selectAll("tr")
				.data(data.data)
				.enter()
				.append("tr")

			// create a cell in each row for each column
			var cells = rows.selectAll("td")
				.data(function(row){
					return row;
				})
				.enter()
				.append("td")
				.attr("style", "font-family: Courier")
				.html(function(d) {
					//debugger;
					return d;
				});

			this.firstRender(false);
			//debugger;
		};

		self.update = function() {
			
			var data = self.data();

			//Select ALL circles and point it to the newly defined data variable
			var rows = self.tbody.selectAll("tr")
				.data(data.data)

			/*rows.enter()
				.append('tr')
				.data(function(extract_row_data){
					return extract_row_data;
				})*/

			rows.exit()
				.remove()

			// var rows_enter = rows.enter()
				// .append('tr')
				// .data(function(extract_row_data){
					// return extract_row_data;
				// });

			// var cells = rows_enter.selectAll('td')
				// .data(function(extracted_row_data){
					// return extracted_row_data;
				// });

			// var cells_enter = cells.enter()
				// .append("td")
				// .attr("style", "font-family: Courier")
				// .style('opacity', 0.0)
				// .attr('class', 'enter')
				// .transition()
				// .delay(900)
				// .duration(500)
				// .style('opacity', 1.0)
				// .text(function(extracted_cell_data){
					// return extracted_cell_data;
				// });

			// var rows_exit = rows.exit()
				// .attr('class', 'exit')
				// .transition()
				// .delay(200)
				// .duration(500)
				// .style('opacity', 0.0)
				// .remove();
		}


		self.reactor = ko.computed(function() {
			var data = self.data();
			if (self.firstRender()) {
				self.render()
			} else {
				self.update()
			}
		})

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Datatable.prototype.dispose = function() {};

	return {
		viewModel: {
			createViewModel: Datatable
		},
		template: templateMarkup
	};

});
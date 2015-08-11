define(['jquery', 'knockout', 'd3', 'text!./network-simple.html', 'mapping', 'mathjs'], function($, ko, d3, templateMarkup, map, math) {

	function NetworkSimple(params, componentInfo) {
		var vm = function(params) {
			var self = this;
			self.element = componentInfo.element;
			self.firstRender = ko.observable(true)

			self.nodes = [{
				id: 0,
				reflexive: false
			}, {
				id: 1,
				reflexive: false
			}, {
				id: 2,
				reflexive: false
			}, ];
			self.links = [{
				source: self.nodes[0],
				target: self.nodes[1],
				left: true,
				right: false,
				distance: 50,
				color: 'gray',
				thickness: .5
			}, {
				source: self.nodes[1],
				target: self.nodes[2],
				left: false,
				right: true,
				distance: 100,
				color: 'gray',
				thickness: .5
			}];

			self.data = typeof params.data === 'function' ? params.data() : {
				nodes: self.nodes,
				links: self.links
			};

			self.oldData = {
				nodes: [],
				links: []
			}

			self.options = typeof params.options === 'function' ? params.options() : {
				backgroundOnMousedown: function(d) {},
				nodeOnMousedown: function(d) {},
				linkOnMousedown: function(d) {},
				allowAddNode: true,
				allowAddEdge: true,
				allowChangeEdgeDirection: true,
				allowDragNodes: true,
				enableForceLayout: true

			};

			// index creator
			self.makeIndex = function(o) {
				var oi = {}
				for (var i = 0; i < o.length; i++) {
					oi[o[i].id] = i;
				};
				return oi
			}

			self.svg = null;

			self.render = function() {
				// list variable common to both render() and update()
				var width = $(self.element.parentElement).width(),
					height = $(self.element.parentElement).height(),
					colors = d3.scale.category10();

				var maxThick = 10;

				//		var colorScale = d3.scale.linear()
				//			.range(['lightgreen', 'black'])
				//			.domain([0, Math.max(20, self.data.nodes.length)]);

				var svg = d3.select(self.element)
					.append('svg')
					.attr('width', width)
					.attr('height', height);

				// set up initial nodes and links
				//	- nodes are known by 'id', not by index in array.
				//	- reflexive edges are indicated on the node (as a bold black circle).
				//	- links are always source < target; edge directions are set by 'left' and 'right'.

				var lastNodeId = self.data.nodes[self.data.nodes.length - 1].id;
				var nodes = self.data.nodes;
				var links = self.data.links;

				// create node index
				self.nodeIndex = self.makeIndex(nodes);

				// init D3 force layout
				var force = d3.layout.force()
					.nodes(self.data.nodes)
					.links(self.data.links)
					.size([width, height])
					.linkDistance(function(links) {
						if (isNaN(links.distance)) {
							return 100;
						} else {
							return links.distance;
						}
					})
					.charge(-500)
					.on('tick', tick)

				// define arrow markers for graph links
				svg.append('svg:defs').append('svg:marker')
					.attr('id', 'end-arrow')
					.attr('viewBox', '0 -5 10 10')
					.attr('refX', 6)
					.attr('markerWidth', 3)
					.attr('markerHeight', 3)
					.attr('orient', 'auto')
					.append('svg:path')
					.attr('d', 'M0,-5L10,0L0,5')
					.attr('fill', 'grey'); //arrow pointing

				svg.append('svg:defs').append('svg:marker')
					.attr('id', 'start-arrow')
					.attr('viewBox', '0 -5 10 10')
					.attr('refX', 4)
					.attr('markerWidth', 3)
					.attr('markerHeight', 3)
					.attr('orient', 'auto')
					.append('svg:path')
					.attr('d', 'M10,-5L0,0L10,5')
					.attr('fill', 'grey'); //function() {return colorScale(10)}); //arrow end

				// line displayed when dragging new nodes
				var drag_line = svg.append('svg:path')
					.attr('class', 'link dragline hidden')
					.attr('d', 'M0,0L0,0');


				// handles to link and node element groups
				var path = svg.append('svg:g')
					.selectAll('path');

				var circle = svg.append('svg:g').selectAll('g');

				// mouse event vars
				var selected_node = null,
					selected_link = null,
					mousedown_link = null,
					mousedown_node = null,
					mouseup_node = null;

				function resetMouseVars() {
					mousedown_node = null;
					mouseup_node = null;
					mousedown_link = null;
				}

				// update force layout (called automatically each iteration)
				function tick() {
					if (!self.options.enableForceLayout) return;

					var nn = []
					circle.attr('transform', function(d) {
						nn.push(d);
						return 'translate(' + d.x + ',' + d.y + ')';
					});
					var ni = self.makeIndex(nn);

					// draw directed edges with proper padding from node centers
					path.attr('d', function(d) {
						var deltaX = nn[ni[d.target.id]].x - nn[ni[d.source.id]].x,
							deltaY = nn[ni[d.target.id]].y - nn[ni[d.source.id]].y,
							dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
							normX = deltaX / dist,
							normY = deltaY / dist,
							sourcePadding = d.left ? 17 : 12,
							targetPadding = d.right ? 17 : 12,
							sourceX = nn[ni[d.source.id]].x + (sourcePadding * normX),
							sourceY = nn[ni[d.source.id]].y + (sourcePadding * normY),
							targetX = nn[ni[d.target.id]].x - (targetPadding * normX),
							targetY = nn[ni[d.target.id]].y - (targetPadding * normY);
						return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
					});
				}


				// update graph (called when needed)
				function restart() {
					//debugger
					//map.fromJS(nodes, self.data.nodes);
					//map.fromJS(links, self.data.links);
					//map.fromJS(lastNodeId, self.data.lastNodeId);
					restart2()
				}

				function restart2(links_update) {
					// path (link) group
					path = path.data(self.data.links);

					// update existing links
					path.classed('selected', function(d) {
						return d === selected_link;
					})
						.style('marker-start', function(d) {
							return d.left ? 'url(#start-arrow)' : '';
						})
						.style('marker-end', function(d) {
							return d.right ? 'url(#end-arrow)' : '';
						});



					// add new links
					path.enter().append('svg:path')
						.attr('class', 'link')
						.classed('selected', function(d) {
							return d === selected_link;
						})
						.style("stroke-width", function(d) {
							return d.thickness * maxThick; // d.source["id"]+d.target["id"])/2;
						}) //this and next line specify thickness and color
					.style("stroke", function(d) {
						return d.color; //colorScale((d.source["id"]+d.target["id"])/2);
					})
						.style('marker-start', function(d) {
							return d.left ? 'url(#start-arrow)' : '';
						})
						.style('marker-end', function(d) {
							return d.right ? 'url(#end-arrow)' : '';
						})
						.on('mousedown', function(d) {
							// external callback
							self.options.linkOnMousedown(d);

							if (d3.event.ctrlKey) return;

							// select link
							mousedown_link = d;
							if (mousedown_link === selected_link) selected_link = null;
							else selected_link = mousedown_link;
							selected_node = null;
							restart();
						});

					// remove old links
					path.exit().remove();


					// circle (node) group
					// NB: the function arg is crucial here! nodes are known by id, not by index!
					circle = circle.data(nodes, function(d) {
						return d.id;
					});

					// update existing nodes (reflexive & selected visual states)
					circle.selectAll('circle')
						.style('fill', function(d) {
							return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
						})
						.classed('reflexive', function(d) {
							return d.reflexive;
						});

					// add new nodes
					var g = circle.enter().append('svg:g');

					g.append('svg:circle')
						.attr('class', 'node')
						.attr('r', 12)
						.style('fill', function(d) {
							return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
						})
						.style('stroke', function(d) {
							return d3.rgb(colors(d.id)).darker().toString();
						})
						.classed('reflexive', function(d) {
							return d.reflexive;
						})
						.on('mouseover', function(d) {
							if (!mousedown_node || d === mousedown_node) return;
							// enlarge target node
							d3.select(this).attr('transform', 'scale(1.7)');
						})
						.on('mouseout', function(d) {
							if (!mousedown_node || d === mousedown_node) return;
							// unenlarge target node
							d3.select(this).attr('transform', '');
						})
						.on('mousedown', function(d) {
							d3.event.preventDefault();

							// external callback
							self.options.nodeOnMousedown(d);

							// select node
							mousedown_node = d;
							if (mousedown_node === selected_node) selected_node = null;
							else selected_node = mousedown_node;
							selected_link = null;

							if (d3.event.ctrlKey || !self.options.allowAddEdge) return;

							// reposition drag line
							drag_line
								.style('marker-end', 'url(#end-arrow)')
								.classed('hidden', false)
								.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

							restart();
						})
						.on('mouseup', function(d) {
							if (!mousedown_node) return;

							// needed by FF
							drag_line
								.classed('hidden', true)
								.style('marker-end', '');

							// check for drag-to-self
							mouseup_node = d;
							if (mouseup_node === mousedown_node) {
								resetMouseVars();
								return;
							}

							// unenlarge target node
							d3.select(this).attr('transform', '');

							// add link to graph (update if exists)
							// NB: links are strictly source < target; arrows separately specified by booleans
							var source, target, direction;
							if (mousedown_node.id < mouseup_node.id) {
								source = mousedown_node;
								target = mouseup_node;
								direction = 'right';
							} else {
								source = mouseup_node;
								target = mousedown_node;
								direction = 'left';
							}

							var link;
							link = links.filter(function(l) {
								return (l.source === source && l.target === target);
							})[0];

							if (link) {
								link[direction] = true;
							} else {
								link = {
									source: source,
									target: target,
									left: false,
									right: false
								};
								link[direction] = true;
								links.push(link);
							}

							// select new link
							selected_link = link;
							selected_node = null;
							restart();
						});

					// show node IDs
					g.append('svg:text')
						.attr('x', 0)
						.attr('y', 4)
						.attr('class', 'id')
						.text(function(d) {
							return d.id;
						});

					// remove old nodes
					circle.exit().remove();

					// set the graph in motion
					force.start();
				}

				self.restart2 = restart2;

				function mousedown() {
					// prevent I-bar on drag
					//d3.event.preventDefault();

					// because :active only works in WebKit?
					svg.classed('active', true);

					if (d3.event.ctrlKey || mousedown_node || mousedown_link) return;

					// external callback
					var point = d3.mouse(this);
					self.options.backgroundOnMousedown(point)

					if (!self.options.allowAddNode) return;

					// insert new node at point
					var node = {
						id: ++lastNodeId,
						reflexive: false
					};
					node.x = point[0];
					node.y = point[1];
					nodes.push(node);

					if (typeof params.newNode === 'function') {
						params.newNode(node);
					}

					restart();
				}

				function mousemove() {
					if (!mousedown_node) return;

					// update drag line
					drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

					restart();
				}

				function mouseup() {
					if (mousedown_node) {
						// hide drag line
						drag_line
							.classed('hidden', true)
							.style('marker-end', '');
					}

					// because :active only works in WebKit?
					svg.classed('active', false);

					// clear mouse event vars
					resetMouseVars();
				}

				function spliceLinksForNode(node) {
					var toSplice = links.filter(function(l) {
						return (l.source === node || l.target === node);
					});
					toSplice.map(function(l) {
						links.splice(links.indexOf(l), 1);
					});
				}

				// only respond once per keydown
				var lastKeyDown = -1;

				function keydown() {
					d3.event.preventDefault();

					if (lastKeyDown !== -1) return;
					lastKeyDown = d3.event.keyCode;

					// ctrl
					if (d3.event.keyCode === 17) {
						circle.call(force.drag);
						svg.classed('ctrl', true);
					}

					if (!selected_node && !selected_link) return;
					switch (d3.event.keyCode) {
						case 8: // backspace
						case 46: // delete
							if (selected_node) {
								nodes.splice(nodes.indexOf(selected_node), 1);
								spliceLinksForNode(selected_node);
							} else if (selected_link) {
								links.splice(links.indexOf(selected_link), 1);
							}
							selected_link = null;
							selected_node = null;
							restart();
							break;
						case 66: // B
							if (selected_link) {
								// set link direction to both left and right
								selected_link.left = true;
								selected_link.right = true;
							}
							restart();
							break;
						case 76: // L
							if (selected_link) {
								// set link direction to left only
								selected_link.left = true;
								selected_link.right = false;
							}
							restart();
							break;
						case 82: // R
							if (selected_node) {
								// toggle node reflexivity
								selected_node.reflexive = !selected_node.reflexive;
							} else if (selected_link) {
								// set link direction to right only
								selected_link.left = false;
								selected_link.right = true;
							}
							restart();
							break;
					}
				}

				function keyup() {
					lastKeyDown = -1;

					// ctrl
					if (d3.event.keyCode === 17) {
						circle
							.on('mousedown.drag', null)
							.on('touchstart.drag', null);
						svg.classed('ctrl', false);
					}
				}

				// app starts here
				svg.on('mousedown', mousedown)
					.on('mousemove', mousemove)
					.on('mouseup', mouseup);
				d3.select(self.element)
					.on('mouseover', function() {
						d3.select(window)
							.on('keydown', keydown)
							.on('keyup', keyup);
					})

				d3.select(self.element)
					.on('mouseout', function() {
						d3.select(window)
							.on('keydown', null)
							.on('keyup', null);
					})
				//restart();

				ko.computed(function() {
					/*debugger
				nodes = map.toJS(self.data.nodes);
				lastNodeId = map.toJS(self.data.lastNodeId);
				links = map.toJS(self.data.links);*/
					restart2();
				})

				self.firstRender(false);
			}

			self.update = function() {
				var nn = params.data().nodes;
				var on = self.data.nodes;
				var nl = params.data().links; // new links
				var nni = self.makeIndex(nn); // node index
				var oni = self.makeIndex(on);

				for (var i = nn.length - 1; i >= 0; i--) {
					if(typeof on[oni[nn[i].id]] !== 'undefined'){
						var onk = Object.keys(on[oni[nn[i].id]]);
						for (var j = onk.length - 1; j >= 0; j--) {
							nn[i][onk[j]] = on[oni[nn[i].id]][onk[j]];
						};
					}
				};
				/*for (var i = 0; i < nl.length; i++) {
					nl[i].source = self.data.nodes[nn[nl[i].source.id]];
					nl[i].target = self.data.nodes[nn[nl[i].target.id]];
					//self.data.links.push(nl[i]);
				};*/

				self.data.nodes = nn;
				self.data.links = nl;
				//self.restart2()
				
				self.restart2()
			}

			self.rerender = function() {
				$(self.element).find('svg').remove();
				self.render();
			}

			self.reactor = ko.computed(function() {
				var d = typeof params.data === 'function' ? params.data() : self.data;
				var o = typeof params.options === 'function' ? params.options() : self.options;
				var f = self.firstRender();
				if (f) {
					self.render();
				} else {
					self.update(d.links);
				}
			})

			self.resizeHandle = $(window).on('resize', function() {
				self.rerender();
			})

			self.engridHandle = $(window).on('engrid-change', function() {
				self.rerender();
			})

			// This runs when the component is torn down. Put here any logic necessary to clean up,
			// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
			self.dispose = function() {
				self.resizeHandle.off();
				self.engridHandle.off();
				self.reactor.dispose();
			};

			return self;
		}
		return new vm(params);
	}

	return {
		viewModel: {
			createViewModel: NetworkSimple
		},
		template: templateMarkup
	};

});
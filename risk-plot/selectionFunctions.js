function selectChangeX(val){
xAxisLabel=val;
xAxisData=xAxisLabel
updateFunction(val);
}

function selectChangeY(val){
yAxisLabel=val;
yAxisData=yAxisLabel;
updateFunction(val);
}

function updateFunction(){
	//Update name of y-axis
	svg.select(".y.label")
	.text(yAxisLabel);
	//Update name of x-axis
	svg.select(".x.label")
	.text(xAxisLabel);
	
	circles
	.transition().duration(1000)
	.attr({
	    cx: function(d) { return x(+d[xAxisLabel]); },
	    cy: function(d) { return y(+d[yAxisLabel]); },
	    r: 8,
	    id: function(d) { return d.techChall; }
	  })
	  
};
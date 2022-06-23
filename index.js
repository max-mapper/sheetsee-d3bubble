BySheetsee.d3BubbleChart = function(data, options) {
	var tree = {name: "data", children: []}
	var groups = {}

	// data needs to look like this:
	// var data = { name: "wahtever", children: [
	//   { name: "group1", children: [
	//     { name: 'bob', size: 3},
	//     { name: 'judy', size: 5}
	//   ]},
	//   { name: "group2", children: [
	//     { name: 'jim', size: 10},
	//     { name: 'bill', size: 5}
	//   ]}
	// ]}
	data.map(function(r) {
		var groupName = r[options.group]
		groups[groupName] = true
	})

	Object.keys(groups).map(function(groupName) {
		var groupMembers = []
		data.map(function(r) {
			if (r[options.group] !== groupName) return
			groupMembers.push({name: r[options.name], size: r[options.size]})
		})
		tree.children.push({name: groupName, children: groupMembers})
	})

	var diameter = options.diameter || 500,
    format = d3.format(",d"),
    color = d3.scale.category20c();

	var bubble = d3.layout.pack()
	    .sort(null)
	    .size([diameter, diameter])
	    .padding(1.5);

	var svg = d3.select(options.div).append("svg")
	    .attr("width", diameter)
	    .attr("height", diameter)
	    .attr("class", "bubble");

	var flattened = classes(tree)

	var node = svg.selectAll(".node")
	    .data(bubble.nodes(flattened)
	    .filter(function(d) { return !d.children; }))
	  .enter().append("g")
	    .attr("class", "node")
	    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("title")
	    .text(function(d) { return d.className + ": " + format(d.value); });

	node.append("circle")
	    .attr("r", function(d) { return d.r; })
	    .style("fill", function(d) { return color(d.packageName); });

	node.append("text")
	    .attr("dy", ".3em")
	    .style("text-anchor", "middle")
	    .text(function(d) { return d.className.substring(0, d.r / 3); });

	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function classes(root) {
	  var classes = [];

	  function recurse(name, node) {
	    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
	    else classes.push({packageName: name, className: node.name, value: node.size});
	  }

	  recurse(null, root);
	  return {children: classes};
	}

	d3.select(self.frameElement).style("height", diameter + "px");
}

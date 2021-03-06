var svg = d3.select("svg"),
	margin = {top: 20, right: 20, bottom: 100, left: 40},
	width = +svg.attr("width") - margin.left - margin.right,
	height = +svg.attr("height") - margin.top - margin.bottom,
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set x scale
var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

// set y scale
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// set the colors
var z = d3.scaleOrdinal()
    .range(["#98abc5", "#a05d56", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.json('data/all.json').then(function(data){
	console.log(data);
	console.log("javascript is loaded");
	var result=[];

	// Group By State
	data.reduce(function(res, value) {
		if (!res[value.state]) {
	    // res[value.state] = {state: value.state, age_group_Adult: 0 , age_group_Child: 0, age_group_Teen: 0, total: 0};
	    res[value.state] = {state: value.state, age_group_Adult: 0 , age_group_Child: 0, age_group_Teen: 0};
	    result.push(res[value.state]);
		};
		res[value.state].age_group_Adult += value.age_group_Adult;
		res[value.state].age_group_Child += value.age_group_Child;
	  	res[value.state].age_group_Teen += value.age_group_Teen;
		// res[value.state].total += value.age_group_Teen + value.age_group_Child + value.age_group_Adult;
		return res;
	}, {});
	console.log(result);

	// load the csv and create the chart
	// var keys = Object.keys(result[0]);
	var keys = Object.keys(result[0]).slice(1);
	console.log(keys);
	result.sort(function(a, b) { return (b.age_group_Teen+b.age_group_Adult+b.age_group_Child) - (a.age_group_Teen+a.age_group_Adult+a.age_group_Child); });
	console.log(result);
	x.domain(result.map(function(d) { return d.state; }));
	y.domain([0, d3.max(result, function(d) { return d.age_group_Adult+d.age_group_Teen+d.age_group_Child; })]).nice();
	z.domain(keys);

	g.append("g")
		.selectAll("g")
    	.data(d3.stack().keys(keys)(result))
	    .enter().append("g")
	      .attr("fill", function(d) { return z(d.key); })
	    .selectAll("rect")
	    .data(function(d) { return d; })
	    .enter().append("rect")
	      .attr("x", function(d) { return x(d.data.state); })
	      .attr("y", function(d) { return y(d[1]); })
	      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
	      .attr("width", x.bandwidth())
	    .on("mouseover", function() { tooltip.style("display", null); })
	    .on("mouseout", function() { tooltip.style("display", "none"); })
	    .on("mousemove", function(d) {
	      console.log(d);
	      var xPosition = d3.mouse(this)[0] - 5;
	      var yPosition = d3.mouse(this)[1] - 5;
	      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
	      tooltip.select("text").text(d[1]-d[0]);
	    });

	  g.append("g")
	      .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.15em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

	  g.append("g")
	      .attr("class", "axis")
	      .call(d3.axisLeft(y).ticks(null, "s"))
	    .append("text")
	      .attr("x", 2)
	      .attr("y", y(y.ticks().pop()) + 0.5)
	      .attr("dy", "0.32em")
	      .attr("fill", "#000")
	      .attr("font-weight", "bold")
	      .attr("text-anchor", "start");

	  var legend = g.append("g")
	      .attr("font-family", "sans-serif")
	      .attr("font-size", 10)
	      .attr("text-anchor", "end")
	    .selectAll("g")
	    .data(keys.slice().reverse())
	    .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
          

	  legend.append("rect")
	      .attr("x", width - 19)
	      .attr("width", 19)
	      .attr("height", 19)
	      .attr("fill", z);

	  legend.append("text")
	      .attr("x", width - 24)
	      .attr("y", 9.5)
	      .attr("dy", "0.32em")
	      .text(function(d) { return d; });
	});

	  // Prep the tooltip bits, initial display is hidden
	  var tooltip = svg.append("g")
	    .attr("class", "tooltip")
	    .style("display", "none");
	      
	  tooltip.append("rect")
	    .attr("width", 60)
	    .attr("height", 20)
	    .attr("fill", "white")
	    .style("opacity", 0.5);

	  tooltip.append("text")
	    .attr("x", 30)
	    .attr("dy", "1.2em")
	    .style("text-anchor", "middle")
	    .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("rotate (90)");
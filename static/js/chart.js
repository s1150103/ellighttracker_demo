
function makeChart(list1,list2,waterLevelList,date){
    console.log(list1);
    var tm=moment(date).add(1,'days');
    var margin = {top: 20,right:40,bottom:40,left:40};
    var margin2 = {top:20,right:10,bottom:40,left:60};
    var width=1200;//-margin.left-margin.right;
    var height=300-margin.top-margin.bottom;
    var width2=800;
    var height2=130-margin2.top-margin2.bottom;
    var strokeColors = ["red","steelblue","green"]; 
    
    //x軸のスケールはその日の00:00から次の日まで
    var x = d3.time.scale()
            .domain([date,tm.toDate()])
            .range([0,width]);
    //y軸は仮に0から12まで(おかしければ要修正)
    var y = d3.scale.linear()
            .domain([0,8])
            .range([height,0]);
    var wy = d3.scale.linear()
            .domain([0,1.2])
            .range([height,0])
    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.hour,1)
            .outerTickSize(0)
            .tickFormat(d3.time.format("%H:%M"));
            
    var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .outerTickSize(0)
                .innerTickSize(-width);
    var wyAxis = d3.svg.axis()
                .scale(wy)
                .orient("right")
                .outerTickSize(-width)
                .innerTickSize(0);
    
    var x2 = d3.time.scale()
            .domain(x.domain())
            .range([0,width2]);
    var y2 = d3.scale.linear()
            .domain(y.domain())
            .range([height2,0]);
    var x2Axis = d3.svg.axis()
                .scale(x2)
                .orient("bottom")
                .ticks(d3.time.hour,2)
                .outerTickSize(0)
                .tickFormat(d3.time.format("%H:%M"));
    var y2Axis = d3.svg.axis()
                 .scale(y2)
                 .orient("left")
                .outerTickSize(0)
                .ticks(6)
                .innerTickSize(-width);
    var line = d3.svg.line()
               .x(function(d){
            	   		var i;
                     i=x(d.Time)>0?x(d.Time):0;
                     i=i<width?i:width;
                     return i;
                     	
               })
               .y(function(d){
                       return y(d.data);
            });
    var line2 = d3.svg.line()
               .x(function(d){
                       return x2(d.Time)>0?x2(d.Time):0;
               })
               .y(function(d){
                       return y2(d.data);
            });
    var wline = d3.svg.line()
               .x(function(d){
                       return x(d.Time)>0?x(d.Time):0;
               })
               .y(function(d){
                       return wy(d.data);
            });

    var svg= d3.select("#chart")
      .append("svg")
      .attr({
        "class":"axis",
        "width":width+margin.left+margin.right,
        "height":height+margin.top+margin.bottom,
//         "padding-left":"20px"
//         "transform":"translate(30,0)"
        })
        .style({
            background:"white"
        });

        var minSvg=d3.select("#mchart")
                    .append("svg")
                    .attr(
                        {
                            "class":"minAxis",
                            "width":width2+margin2.left+margin2.right,
                            "height":height2+margin2.top+margin2.bottom,
                            "transform":"translate(20,10)"
                        }
                    )
                    .style({
                            background:"white"  
                    });

    svg.append("defs").append("clipPath")
        .attr("id","clip")
        .append("rect")
        .attr({
            "width":width,//+margin.left+margin.right,
            "height":height+margin.top+margin.bottom,
        });
   
    var focus = svg.append("g")
        .attr("transform","translate("+margin.left+","+margin.top+")");
    var context = minSvg.append("g")
        .attr("transform","translate("+margin2.left+","+margin2.top+")");

       //グラフの線 
//    drawGraphPath();
        focus.append("path")
        .datum(list1)
        .attr({
                d:line,
                "class":"cpath",
                stroke:strokeColors[0],
        });

        focus.append("path")
        .datum(list2)
        .attr({
                d:line,
                "class":"cpath",
                stroke:strokeColors[1],
        });
        focus.append("path")
        .datum(waterLevelList)
        .attr({
                d:wline,
                "class":"cpath",
                stroke:"black",
        });
        context.append("path")
        .datum(list1)
        .attr({
                d:line2,
                "class":"cpath",
                stroke:strokeColors[0]
        });

        context.append("path")
        .datum(list2)
        .attr({
                d:line2,
                "class":"cpath",
                stroke:strokeColors[1],
        });
	
 //   drawGraphAxis();
    focus.append("g")
        .attr("class","y axis")
        .call(yAxis)
        .selectAll("g")
        .filter(function(d){return d;})
        .classed("minor",true);

    focus.append("g")
        .attr("class","y axis")
        .attr("transform","translate("+(width)+",0)")
        .call(wyAxis)
        .selectAll("g")
        .filter(function(d){return d;})
        .classed("minor",true);

    focus.append("g")
        .attr("class","x axis") 
        .attr("transform","translate(0,"+height+")")
        .attr("clip-path","url(#clip)")
        .call(xAxis);
	

    focus.append("text")
        .text("時間")
        .attr("x",width-5)
        .attr("y",height+35);

    focus.append("text")
    .text("電流値(A)")
        .attr("x",0)
        .attr("y",-5);


    // for legend
    var legendLine=[{start:500,end:600},{start:700,end:800}];
    focus.append("line")
        .attr({
            x1:legendLine[0].start,
            y1:-10,
            x2:legendLine[0].end,
            y2:-10, 
            stroke:strokeColors[0],
            "stroke-width":3
        });
    focus.append("text")
        .text("揚水ポンプNo2")
        .attr({
                x:legendLine[0].end+10,
            y:-10,
        });
    focus.append("line")
        .attr({
            x1:legendLine[1].start,
            y1:-10,
            x2:legendLine[1].end,
            y2:-10, 
            stroke:strokeColors[1],
            "stroke-width":3
        });
    focus.append("text")
        .text("揚水ポンプ No1")
        .attr({
            x:legendLine[1].end+10,
            y:-10,
        });
    
    focus.append("line")
         .attr({
            x1:x(date),
            y1:y(6.4),
            x2:x(tm.toDate()),
            y2:y(6.4),
            stroke:"DarkRed",
            "stroke-width":2,
         });

    context.append("g")
        .attr("class","y axis")
        .call(y2Axis)
        .selectAll("g")
        .filter(function(d){return d;})
        .classed("minor",true);

    context.append("g")
        .attr("class","x axis") 
        .attr("transform","translate(0,"+height2+")")
        .call(x2Axis);


    var brush = d3.svg.brush()
                .x(x2)
                .on("brush",brushed);

    context.append("g")
    .attr({
            "class":"x brush"
    }) 
    .call(brush)
    .selectAll("rect")
    .attr({
            "height":height2,
            "fill":"red",
            "fill-opacity": ".125",
            "shape-redering":"crispEdges"
    });
    function brushed(){
//         console.log(brush.extent());
        x.domain(brush.empty()?x2.domain():brush.extent());
        xAxis.ticks(15);
        focus.selectAll(".cpath").attr("d",line);
        focus.selectAll(".x.axis").call(xAxis);
    }
    num=0;
    svg.append("rect")
     .attr({
    	width:width/2+40,
     	height:height,
     	transform:"translate("+((width/2))+",20)",
     	fill:"lightbule",
     	"fill-opacity":.0
     })
    .on("click",function(){
    	num+=3
    	if(num>=24) num=0;
    	x.domain([moment(date).hour(num-3),moment(date).hour(num)]);
        xAxis.ticks(15);
        focus.selectAll(".cpath").attr("d",line);
        focus.selectAll(".x.axis").call(xAxis);

    });
    svg.append("rect")
     .attr({
    	width:width/2+40,
     	height:height,
     	transform:"translate(0,20)",
     	fill:"red",
     	"fill-opacity":.0
     })
    .on("click",function(){
        num-=3;
    	if(num<=0) num=24;
    	x.domain([moment(date).hour(num-3),moment(date).hour(num)]);
        xAxis.ticks(15);
        focus.selectAll(".cpath").attr("d",line);
        focus.selectAll(".x.axis").call(xAxis);
    });

}

function drawDataPath(list1,list2){
	
}
function drawGraphAxis(){

}
function changeChart(list1,list2,waterLevelList,date){
	//追加でのxmlが呼ばれた場合すでに描画されているグラフを再描画する
    var tm=moment(date).add(1,'days');
    var margin = {top: 20,right:40,bottom:40,left:40};
    var margin2 = {top:20,right:10,bottom:40,left:60};
    var width=1200;//-margin.left-margin.right;
    var height=300-margin.top-margin.bottom;
    var width2=800;
    var height2=130-margin2.top-margin2.bottom;
    var strokeColors = ["red","steelblue","green"]; 
	
	
}

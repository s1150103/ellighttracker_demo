var GRAPH = GRAPH || {};
console.log("graph");
GRAPH={
    //propaty
    strokeColors:["red","steelblue","green"], 
    margin:{top:20,bottom:50,right:20,left:20},
   // width:1200,
    //height:300,
    //methods
     width:1500,
     height:500,
    xScale:function(domain,range){
        return d3.time.scale().domain(domain).range(range);
    },
    yScale:function(domain,range){
        return d3.scale.linear().domain(domain).range(range);
    },
    drawGraphReagion:function(date){
        var tm=moment(date).add(1,'days');
        //x軸のスケールはその日の00:00から次の日まで
        /*
        x = d3.time.scale()
                .domain([date,tm.toDate()])
                .range([0,this.width]);
        */
        //y軸は仮に0から12まで(おかしければ要修正)
        /*
        y = d3.scale.linear()
                .domain([0,8])
                .range([this.height,0]);
        */
        var x=this.xScale([date,tm.toDate()],[0,this.width]);
        var y=this.yScale([0,10],[this.height,0]);

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
                    .innerTickSize(-this.width);

        var yAxis2 = d3.svg.axis()
                    .scale(y)
                    .orient("right")
                    .outerTickSize(0)
                    .innerTickSize(this.width);

        var svg= d3.select("#chart")
          .append("svg")
          .attr({
            "id":"region",
            "class":"axis",
            "width":this.width+this.margin.left+this.margin.right,
            "height":this.height+this.margin.top+this.margin.bottom,
            //"viewBox":"0 0 "+this.width+" "+this.height,
    //         "transform":"translate(30,0)"
            })
            .style({
                background:"white"
            })
            .append("g")
            .attr({
                "transform":"translate("+this.margin.left+","+this.margin.top+")",    
            });
        svg.append("g")
            .attr("class","y axis")
            .call(yAxis)
            .selectAll("g")
            .filter(function(d){return d;})
            .classed("minor",true);

          svg.append("g")
            .attr("class","y2 axis")
            .call(yAxis2)
            .selectAll("g")
            .filter(function(d){return d;})
            .classed("minor",true);

        svg.append("g")
            .attr("class","x axis") 
            .call(xAxis)
            .attr("transform","translate(0,"+this.height+")"); //x軸を下に移動

        svg.append("text")
            .text("時間")
            .attr("x",this.width)
            .attr("y",this.height);

        svg.append("text")
        .text("電流値(A)")
            .attr("x",0)
            .attr("y",-5);

	
	
	
    /*
        svg.append("rect")
         .attr({
            width:this.width/2+40,
            height:this.height,
            transform:"translate("+((this.width/2))+",20)",
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
            width:this.width/2+40,
            height:this.height,
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
        */
    },
    //TODO cpathにindexを付与して各ラインを識別できるようにする.
    drawLineGraph: function(dataList,date,i){
        //dataListから線を描画する
        var tm=moment(date).add(1,'days');
        var x=this.xScale([date,tm.toDate()],[this.margin.left,this.width+this.margin.left])
        var y=this.yScale([0,10],[this.height+this.margin.top,0]);
        var line = d3.svg.line()
                   .x(function(d){
                	    t=moment(d.Time,"YYYY-MM-DD HH:mm:ss").toDate();
                       //console.log(x,d.Time,x(t));
                        return x(t);
                   })
                   .y(function(d){
                        //console.log(y,d.data,y(d.data));
                           return y(d.data);
                });

        var svg = d3.select("svg");
        svg.append("path")
            .datum(dataList)
            .attr({
                d:line,
                "id":"cpath"+i,
                stroke:this.colorList40()[i],
            })
	    .style({
		visibility:'visible'
	});
	
	// button
	d3.select("#chart")
	.append('input')
	.attr({
		type:"button",
		
	})
	.on('click',function() {
       		console.log(i);
		var elm = document.getElementById("cpath"+i);
	console.log(elm.style.visibility);
			if(elm.style.visibility=='hidden'){
				
			 	elm.style.visibility='visible';
   				console.log(elm.style.visibility);
			}else{
				elm.style.visibility='hidden';
			}
	});


	svg.append("line")
         .attr({
            x1:x(date),
            y1:y(6.4),
            x2:x(tm.toDate()),
            y2:y(6.4),
            stroke:"DarkRed",
            "stroke-width":2,
         });

    },
    updateLineGraph: function(dataList,date,i){
        var tm=moment(date).add(1,'days');
        var x=this.xScale([date,tm.toDate()],[this.margin.left,this.width+this.margin.left])
        var y=this.yScale([0,10],[this.height+this.margin.top,0]);
        var line = d3.svg.line()
                   .x(function(d){
                       t=moment(d.Time,"YYYY-MM-DD HH:mm:ss").toDate();
                       //console.log(x,d.Time,x(t));
                       return x(t);
                   })
                   .y(function(d){
                        console.log(d.data,y(d.data));
                           return y(d.data);
                });

             d3.select("svg")
             .selectAll(".cpath"+i)
            .datum(dataList)
             .transition()
             .ease("linear")
             .duration(300)
            .attr({
                d:line,
                "class":"cpath"+i,
               // stroke:this.strokeColors[i%this.strokeColors.length]
	      stroke:this.colorList40()[i]
            });
    },
    colorList40:function(){
        var color1 = d3.scale.category10().range();    
	// var color1 = d3.scale.category20().range();
        var color2 = d3.scale.category20b().range();
        //console.log(color1,color2)
        //var col = Array.prototype.push.apply(color1,color2)
        var col = color1.concat(color2);
	col = col.concat(d3.scale.category20c().range);
        //console.log(col[0],col.length)

        return col
    }
}
console.log("end graph");

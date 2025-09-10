console.log("loader");
var LOADER = LOADER || {};
console.log("loader");
LOADER={
	downloadJson:function(sid,date){
		$.ajax({
            //url:"http://localhost:8080/ellighttracker2?mode=j&date="+date+"&sid="+sid,
            url:"https://crud2-171605.appspot.com/ellighttracker2?mode=j&date="+date+"&sid="+sid,
            dataType:'json',
             error:function () {
                 alert("error:"+date+".json does not exist.");
             },
            success:LOADER.drawGraph(date)
		})
	},
	drawGraph:function (date) {
        return function(json,status){
            var cdate = moment(date,"YYYY-MM-DD").tz("Asia/Tokyo")
            if(document.getElementById("region")==null){
                GRAPH.drawGraphReagion(cdate.toDate());
                for(var i=0;i<json.data_lists.length;i++){
                    //for(var i=0;i<1;i++){
                    GRAPH.drawLineGraph(json.data_lists[i],cdate.toDate(),i);
                }
            }else{
                for(var i=0;i<json.data_lists.length;i++){
                    GRAPH.updateLineGraph(json.data_lists[i],cdate.toDate(),i);
                }
            }
        }
	},
    downloadXml:function(sid,date){
        $.ajax({
            url:"https://crud2-171605.appspot.com/ellighttracker2?mode=s&date="+date+"&sid="+sid,
           // url:"http://localhost:8080/ellighttracker2?mode=s&date="+date+"&sid="+sid,
//            url:"./"+date+".xml",
            type:'get',
            dataType:'xml',
            crossDomain:true,
             error:function () {
                 alert("error:"+date+".xml does not exist.");
             },
            success:LOADER.parseXml
            
            });
    },
    parseXml:function(xml,status){
        console.log(status);
        var date=app.date;
        var data1_list= [];
        var data2_list= [];
        var waterLevelList =[];
        var preData=0;
        var preData2=0;
        if(status!=='success'){return;}
        $(xml).find('result').each(function(){
                $(this).find('data').each(function(){
                        if($(this).attr('Time')!=='null'){
                            data1_list.push({
                                    Time:moment(date+" "+$(this).attr('Time'),"YYYY-MM-DD HH:mm:ss").toDate(),
                                    data:$(this).attr('Data1')
                            });

                            data2_list.push({
                                    Time:moment(date+" "+$(this).attr('Time'),"YYYY-MM-DD HH:mm:ss").toDate(),
                                    data:$(this).attr('Data2')
                            });
                            waterLevelList.push({
                                    Time:moment(date+" "+$(this).attr('Time'),"YYYY-MM-DD HH:mm:ss").toDate(),
                                    data:$(this).attr('Data3')
                            });

                        }else{
                            console.log("no attribute \"Time\" ")
                        }
                });
        });
        //console.log(data1_list[0]);
    var startTime=data1_list[0].Time;
        for (var i in data1_list) {
            console.log(data1_list[i].data);
            if (preData==0.0&&Number(data1_list[i].data)>0) {
                store.countCycle++;
                startTime=moment(data1_list[i].Time);
            } 
            if(preData>0&&Number(data1_list[i].data==0)){
                store.sum1+=Math.abs(startTime.diff(data1_list[i].Time,'minutes'));
            }
            preData=Number(data1_list[i].data);
        }
        var startTime2=data2_list[i].Time;
        for (var i in data2_list) {
            console.log(data2_list[i].data);
            if (preData2==0.0&&Number(data2_list[i].data)>0) {
                store.countCycle2++;
                startTime2=moment(data2_list[i].Time);
            } 
            if(preData2>0&&Number(data2_list[i].data)==0.0){
                store.sum2+=Math.abs(startTime2.diff(data2_list[i].Time,'minutes'));
            }
            preData2=Number(data2_list[i].data);
        }
        console.log(waterLevelList);
                var timezone = "Asia/Tokyo";
                var cdate = moment(date).tz(timezone)
                store.elec1=data1_list[data1_list.length-1].data
                store.elec2=data2_list[data2_list.length-1].data
                if(document.getElementById("region")==null){
                    GRAPH.drawGraphReagion(cdate.toDate());
                    GRAPH.drawLineGraph(data1_list,cdate.toDate(),0);
                    GRAPH.drawLineGraph(data2_list,cdate.toDate(),1);
                }else{
                    GRAPH.updateLineGraph(data1_list,cdate.toDate(),0);
                    GRAPH.updateLineGraph(data2_list,cdate.toDate(),1);
                }
     //           makeChart(data1_list,data2_list,waterLevelList,cdate.toDate());
    },    
} 

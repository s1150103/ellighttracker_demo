function loadXml(date) {
    console.log("call loadXml",date);
    $.ajax({
            url:"http://ellighttracker2.appspot.com/ellighttracker2?mode=s&date="+date+"&sid=1",
//            url:"./"+date+".xml",
            type:'get',
            dataType:'xml',
            crossDomain:true,
           // timeout:100000,
             error:function () {
                 alert("error:"+date+".xml does not exist.");
             },
            success:parse_xml
    });
}
function parse_xml(xml,status) {
    console.log(status);
    console.log(vm.message);
    var date=vm.message;
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

                    }
            });
    });
var startTime=data1_list[0].Time;
    for (var i in data1_list) {
        console.log(data1_list[i].data);
        if (preData==0.0&&Number(data1_list[i].data)>0) {
            vm.countCycle++;
            startTime=moment(data1_list[i].Time);
        } 
        if(preData>0&&Number(data1_list[i].data==0)){
            vm.sum1+=Math.abs(startTime.diff(data1_list[i].Time,'minutes'));
        }
        preData=Number(data1_list[i].data);
    }
    var startTime2=data2_list[i].Time;
    for (var i in data2_list) {
        console.log(data2_list[i].data);
        if (preData2==0.0&&Number(data2_list[i].data)>0) {
            vm.countCycle2++;
            startTime2=moment(data2_list[i].Time);
        } 
        if(preData2>0&&Number(data2_list[i].data)==0.0){
            vm.sum2+=Math.abs(startTime2.diff(data2_list[i].Time,'minutes'));
        }
        preData2=Number(data2_list[i].data);
    }
    console.log(waterLevelList);
            var timezone = "Asia/Tokyo";
            var cdate = moment(date).tz(timezone)
            vm.elec1=data1_list[data1_list.length-1].data
            vm.elec2=data2_list[data2_list.length-1].data
            GRAPH.drawGraphReagion();
 //           makeChart(data1_list,data2_list,waterLevelList,cdate.toDate());
}

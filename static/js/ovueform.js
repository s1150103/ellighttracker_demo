/**
 * Created by innocent on 4/11/17.
 */
Vue.component('form-table',{
    template:'#form-table-template',
    props:{
        data:Array,
        columns:Array,
    }
});
var from = new Vue({
     el:'#form',
     data: {
         baseUrl:"http://ellighttracker2.appspot.com",
         testUrl:"http://localhost:8080",
         regionId:3,
         title: "月報 大久保3 マンホールポンプ場",
         subTitle: "",
         targetYear:"",
         targetMonth:moment().month()+1,
         year: moment().year(),
         month: moment().month() + 1,
         date: moment().date(),
         stampTable: ['承認', '審査', '点検', '担当'],
         stampData: [' '],
         tableColumns: {cycle:'回数',time:'運転時間'},
         dummyData:[],
         days:[],
         dataJson:{
     },
         /*
         dummyJson:{
             "eqList":[],
             dataObjectList:[]
         }
         */
     },
     beforeCreate:function () {
       console.log("beforeCreate");
     },
     created:function(){
         console.log("created");

	var date = new Date();
	var yyyy = date.getFullYear();
	var dd = ("0"+date.getDate()).slice(-2); // 0
	var mm = ('0' + (date.getMonth() + 1)).slice(-2);

         var result = this.make_form_paper1(this.baseUrl,yyyy,mm);

         Vue.set(this,"dataJson",this.selectDataFormJson(result,1,2));

     },
     computed:{
         /*
        eraceNoData:function () {
            if(this.dataJson==={}) return {};
            var li = [];
            for(let item of this.dataJson.dataObjectList){
                var data = {}
               let flag=0;
                for(var eq of this.dataJson.eqList){
                 if(item["time"+eq.id]==="No data" || item["cycle"+eq.id]==="No data") continue;
                     data["cycle"+eq.id]=item["cycle"+eq.id];
                     data["time"+eq.id]=item["time"+eq.id];
                     li.push(data);
                }
            }
            console.log(li);
                return li;
        }
        */
     },
     methods:{
         selectDataFormJson(json,fistId,secondId){
            // fistId とsecondId はId値なのでindex+1
             var resultObject = {eqList:[],dataObjectList:[]};
             resultObject.eqList.push(json.eqList[fistId-1])
             resultObject.eqList.push(json.eqList[secondId-1])
             console.log(resultObject)
             for(var item of json.dataObjectList) {
                 var row = {}
                 row["date"] = item["date"]
                 row["cycle" + fistId] = item["cycle" + fistId]
                 row["time" + fistId] = item["time" + fistId]
                 row["cycle" + secondId] = item["cycle" + secondId]
                 row["time" + secondId] = item["time" + secondId]
                 resultObject.dataObjectList.push(row)
             }
             console.log(resultObject)
             return resultObject
         },
         objectMax:function (prev,current,index,self) {
             var row = {};

             for (var eq of this.dataJson.eqList) {
                     row["cycle" + eq.id] = this.max(prev["cycle" + eq.id], current["cycle" + eq.id]);
                     row["time" + eq.id] = timeMath.max(prev["time" + eq.id], current["time" + eq.id]);
             }
             return row;

         },
         objectMin:function (prev,current,index,self) {
             var row = {};

             for (var eq of this.dataJson.eqList) {
                     row["cycle" + eq.id] = this.min(prev["cycle" + eq.id], current["cycle" + eq.id]);
                     row["time" + eq.id] = timeMath.min(prev["time" + eq.id], current["time" + eq.id]);
             }
             return row;

         },
         objectSum:function (prev,current,index,self) {
             var row = {};

             for (var eq of this.dataJson.eqList) {
                     row["cycle" + eq.id] = prev["cycle" + eq.id] + current["cycle" + eq.id];
                     row["time" + eq.id] = timeMath.sum(prev["time" + eq.id], current["time" + eq.id]);
             }
             return row;

         },
         objectMean:function (prev,current,index,self) {
             console.log("test");
             var row = {};
             if (index === self.length - 1) {
                 for (let eq of this.dataJson.eqList) {
                         console.log(prev["time" + eq["id"]], prev);
                         row["cycle" + eq.id] = (prev["cycle" + eq.id]+current["cycle"+eq.id]) / self.length;
                         row["time" + eq.id] = timeMath.divnum(timeMath.sum(prev["time" + eq.id],current["time"+eq.id]), self.length);
                         console.log(prev["time"+eq.id],current["cycle"+eq.id]);
                 }
                 console.log(row);
                 return row;
             }
             for (var eq of this.dataJson.eqList) {
                     row["cycle" + eq.id] = prev["cycle" + eq.id] + current["cycle" + eq.id];
                     row["time" + eq.id] = timeMath.sum(prev["time" + eq.id], current["time" + eq.id]);
             }
             return row;

         },
         totalUptime:function (sumResult) {
             console.log(sumResult,timeMath.sum("00:30:00","00:30:00"));
             var result="00:00:00";
             for (var eq of this.dataJson.eqList) {
                 console.log(result);
                 result =timeMath.sum(sumResult["time"+eq["id"]],result);
             }
            return result;
         },
         totalCycle:function(sumResult){
             var result=0;
             for (var eq of this.dataJson.eqList) {
                 result +=sumResult["cycle"+eq["id"]];
             }
             return result;

         },
         max:function (prev,current) {
             return Math.max(prev,current)
         },
         min:function (prev,current) {
             return Math.min(prev,current)
         },
         mean:function(prev,current,index,self){
             if(index === self.length-1) return (prev+current)/self.length;
             return Math.floor(prev+current);
         },
        timeSum:function (prev,current) {
           return timeMath.sum(prev,current);
        },
        timeMean:function (prev,current,index,self) {
           if(index === self.length-1) return timeMath.divnum(timeMath.sum(prev,current),self.length);
           return timeMath.sum(prev,current);
        },
        timeMax:function (prev,current,index,self) {
            return timeMath.max(prev,current);
        },
        timeMin:function (prev,current,index,self) {
            return timeMath.min(prev,current);
        },
        makeDummyData:function () {
            this.dataJson["eqList"]=[];
            this.dataJson["dataObjectList"]=[];
             var list=[];
             console.log(moment().endOf(this.month));
             this.dataJson.eqList.push({"id":1,name:"No1"});
             this.dataJson.eqList.push({"id":2,name:"揚水ポンプNo2"});
             for(var n=1;n<=moment().endOf('month').date();n++){
                 var row = {
                     "date":n,
                 }
                 for(let eq of this.dataJson.eqList){
                      row["time"+eq["id"]] = "00:00:00";
                      row["cycle"+eq["id"]] = n;
                 }
                 this.dataJson.dataObjectList.push(row);
             }
         },
        makeDayList:function(){
            for(var n=1;n<=moment().endOf('month').date();n++){
                this.days.push(n);
            }

        },

       make_form_paper1:function (baseUrl,year,month) {
           console.log("make_form_paper1");
           return $.ajax({
               url: baseUrl+'/month?mode=t&year=' + year + "&month=" + month + "&rid=" + this.regionId,
               type:'post',
               dataType:'json',
               async:false,
           })
           .done(function (response,status) {
               console.log("SUCCESS:MonthData is downloaded");
               console.log(typeof response);
               console.log(this.url,status,year,month,response);
               //Vue.set(from, "dataJson", response);
                return response;
           })
           .fail(function () {
               console.log(this.url,status,year,month);
               console.log("ERROR:cannot download data")
               return null;
           }).responseJSON;
       },


     }


});

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
         baseUrl:"https://crud2-171605.appspot.com",
         testUrl:"http://localhost:8080",
         regionId:6,
         title: "日報 樟 マンホールポンプ場",
         subTitle: "",
         targetYear:"",
         targetMonth:moment().month()+1,
         year: moment().year(),
         month:moment().month()+1,
         date: moment().date(),
         stampTable: ['承認', '審査', '点検', '担当'],
         stampData: [' '],
         tableColumns: {cycle:'回数',time:'運転時間'},
         dummyData:[],
         days:[],
         dataJson:{
             eqList: [],
             dataObjectList: []
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
     created: function() {
  console.log("created");
  const useDummy = false; // ← テスト用フラグ

  if (useDummy) {
    const dummy = {
      eqList: [
        { id: 1, name: "装置A" },
        { id: 2, name: "装置B" }
      ],
      dataObjectList: [
        {
          date: "2025-03-01",
          cycle1: 3,
          time1: "01:15:00",
          cycle2: 5,
          time2: "02:30:00"
        },
        {
          date: "2025-03-02",
          cycle1: 2,
          time1: "00:45:00",
          cycle2: 6,
          time2: "03:00:00"
        }
      ]
    };
    Vue.set(this, "dataJson", dummy);
  } else {
    const date = new Date();
    const yyyy = date.getFullYear();
    //const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const mm = '03'; // ← ゼロ埋め済み
    const rid = 6;
    //const url = `${this.baseUrl}/month?mode=t&year=${yyyy}&month=${mm}&rid=${rid}`;
    const url = `${this.baseUrl}/month?mode=t&year=${yyyy}&month=${mm}&rid=${rid}`;
    axios.get(url)
.then(response => {
    const result = response.data;
    console.log("💡APIから返ってきたデータ：", result);  // ← ここを確認
    if (result && result.eqList && result.eqList.length >= 2) {
      Vue.set(this, "dataJson", this.selectDataFormJson(result, 1, 2));

    } else {
      console.warn("⚠️ API結果が不正またはデータ不足:", result);
    }
  })
  .catch(error => {
    console.error("❌ データ取得エラー:", error);
  });
  }
  },   //
     computed:{
      meanRow() {
      	const list = this.dataJson.dataObjectList;
  		if (list.length === 0) return {};
  		return list.reduce(this.objectMean, {}); // ← 初期値を指定
  }
     },
     methods:{
         selectDataFormJson(json,fistId,secondId){
           // 🔽 ここで元のJSONを確認
         console.log("🟢 JSON from backend:", json.dataObjectList[11]); // ← 12日のデータ

            // fistId とsecondId はId値なのでindex+1
            if (!json || !json.eqList || json.eqList.length < 2) {
    		    console.error("⚠️ eqListが存在しないか要素数が足りません", json);
       		 return { eqList: [], dataObjectList: [] };  // 空データ返す
    		}
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
        objectMean: function (prev, current, index, self) {
  	 var row = {};
  		if (index === self.length - 1) {
    			for (let eq of this.dataJson.eqList) {
      			const t1 = prev["time" + eq.id] || "00:00:00";
      			const t2 = current["time" + eq.id] || "00:00:00";
      			row["cycle" + eq.id] = (prev["cycle" + eq.id] + current["cycle" + eq.id]) / self.length;
      			row["time" + eq.id] = timeMath.divnum(timeMath.sum(t1, t2), self.length);
    			}
    			return row;
  		}
  		for (var eq of this.dataJson.eqList) {
    			const t1 = prev["time" + eq.id] || "00:00:00";
    			const t2 = current["time" + eq.id] || "00:00:00";
    				row["cycle" + eq.id] = prev["cycle" + eq.id] + current["cycle" + eq.id];
    				row["time" + eq.id] = timeMath.sum(t1, t2);
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
        objectSum: function (prev, current, index, self) {
  const row = {};
  for (const eq of this.dataJson.eqList) {
    const t1 = prev["time" + eq.id] || "00:00:00";
    const t2 = current["time" + eq.id] || "00:00:00";
    row["cycle" + eq.id] = (prev["cycle" + eq.id] || 0) + (current["cycle" + eq.id] || 0);
    row["time" + eq.id] = timeMath.sum(t1, t2);
  }
  return row;
},
              //base
           make_form_paper_month: function (baseUrl, year, month, rid) {
	      //test 
           //make_form_paper_month: function (testUrl, year, month, rid) {
               console.log("make_form_paper_month");
               let result = null;
               year = 2025;
               month = "03";
               day = "12";
               rid = 6;
           console.log("make_form_paper1");
           return $.ajax({
               url: baseUrl + '/month?mode=e&year=' + year + "&month=" + month + "&rid=" + rid,
              // url: testUrl + '/month?mode=e&year=' + year + "&month=" + month + "&rid=" + rid,
               type:'get',
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

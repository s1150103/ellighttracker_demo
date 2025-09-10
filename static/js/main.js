/*(function() {
  'use strict';

  var vm = new Vue({
    el: '#app',
    data: {
      newItem: '',
      todos: [
        'task 1',
        'task 2',
        'task 3'
      ]
    },
    methods: {
      // addItem: function(e) {
      //   e.preventDefault();
      //   this.todos.push(this.newItem);
      // }
      addItem: function() {
        this.todos.push(this.newItem);
        this.newItem = '';
      }
    }
  });
})();
*/

(function() {
  'use strict';

/**
 * Created by innocent on 4/25/17.
 */
Vue.component('form-table',{
    template:'#form-table-template',
    props:{
        data:Array,
        columns:Object,
    }
});
var form2 = new Vue({
    el:'#form2',
    data:{
	newItem1: '',
	newItem2: '',
        newItem3: '',
        regionId:2,
        baseUrl:"http://ellighttracker2.appspot.com",
        testUrl:"http://localhost:8080",
        columns:{date:"発生日時",targetName:"データ名称",startTime:"運転時刻",endTime:"停止時刻",upTime:"運転時間",MaxData:"最大電流値"},
        dataJson:{},
      dummy:{
          datalist:[
              {
                  date:"2016/10/20",
                  id:1,
                  //name:"市営住宅小田原団地",
                  dataName:"揚水ポンプNo.1",
                  startTime:"00:00:00",
                  endTime:"01:00:11",
                  ampere:0.0
              },
              {
                  date:"",
                  id:1,
                  //name:"name",
                  dataName:"揚水ポンプ",
                  startTime:"",
                  endTime:"",
                  ampere:0.0

              }
          ]
      },


    },
    created:function () {
        var result = this.make_form_paper2(this.baseUrl,this.newItem1,this.newItem2);
        Vue.set(this,"dataJson",result);
    },
    methods:{
    make_form_paper2:function (baseUrl,year,month) {
               console.log("make_form_paper2");
               return $.ajax({
                   url: baseUrl+ '/month?mode=e&year=' + year + "&month=" + month + "&rid=" + this.regionId,
                   type:'post',
                   dataType:'json',
                   async:false,
               })
               .done(function (response,status) {
                   console.log("SUCCESS:MonthData is downloaded");
                   console.log(typeof response);
                   console.log(status,year,month,response);
                   //Vue.set(from, "dataJson", response);
                    return response;
               })
               .fail(function () {
                   console.log("ERROR:cannot download data")
                   return null;
               }).responseJSON;
           },
    },

})
})();

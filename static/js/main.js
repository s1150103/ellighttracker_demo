/**
 * main.js - ELLight Tracker メインJavaScriptファイル
 * 
 * Vue.jsを使用したフロントエンド機能の実装
 * - フォームテーブルコンポーネント
 * - 月次データの取得と表示
 * - APIとの通信処理
 */

/*
// 以前のVue.jsの基本的なTODOアプリケーション（コメントアウト）
(function() {
  'use strict';
  var vm = new Vue({
    el: '#app',
    data: {
      newItem: '',
      todos: ['task 1', 'task 2', 'task 3']
    },
    methods: {
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
 * フォームテーブルコンポーネント
 * データを表形式で表示するためのVue.jsコンポーネント
 */
Vue.component('form-table',{
    template:'#form-table-template',
    props:{
        data:Array,        // 表示するデータ配列
        columns:Object,    // カラム定義オブジェクト
    }
});

/**
 * メインVueインスタンス
 * フォーム入力と月次データの表示を管理
 */
var form2 = new Vue({
    el:'#form2',
    data:{
        newItem1: '',     // 入力フィールド1（年）
        newItem2: '',     // 入力フィールド2（月）
        newItem3: '',     // 入力フィールド3（予備）
        regionId:2,       // 地域ID（デフォルト値）
        baseUrl:"http://ellighttracker2.appspot.com",  // 本番環境URL
        testUrl:"http://localhost:8080",               // テスト環境URL
        // テーブルカラム定義
        columns:{
            date:"発生日時",
            targetName:"データ名称", 
            startTime:"運転時刻",
            endTime:"停止時刻",
            upTime:"運転時間",
            MaxData:"最大電流値"
        },
        dataJson:{},      // APIから取得したデータ
        // ダミーデータ（開発・テスト用）
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
    /**
     * Vueインスタンス作成時の初期化処理
     * 初期データを取得してdataJsonに設定
     */
    created:function () {
        var result = this.make_form_paper2(this.baseUrl,this.newItem1,this.newItem2);
        Vue.set(this,"dataJson",result);
    },
    methods:{
        /**
         * 月次データを取得するメソッド
         * 
         * @param {string} baseUrl - APIのベースURL
         * @param {string} year - 取得する年
         * @param {string} month - 取得する月
         * @returns {Object} - APIレスポンスのJSONデータ
         */
        make_form_paper2:function (baseUrl,year,month) {
            console.log("make_form_paper2");
            return $.ajax({
                // APIエンドポイントURL構築
                url: baseUrl+ '/month?mode=e&year=' + year + "&month=" + month + "&rid=" + this.regionId,
                type:'post',
                dataType:'json',
                async:false,  // 同期処理（注意: 通常は非同期推奨）
            })
            .done(function (response,status) {
                // 成功時の処理
                console.log("SUCCESS:MonthData is downloaded");
                console.log(typeof response);
                console.log(status,year,month,response);
                return response;
            })
            .fail(function () {
                // エラー時の処理
                console.log("ERROR:cannot download data")
                return null;
            }).responseJSON;
        },
    },

})
})();

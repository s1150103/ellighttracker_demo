from flask import Flask, render_template, request, jsonify, Response
from flask import send_from_directory
import json
from google.cloud import datastore
from datetime import datetime
import calendar
import time
import os
import xml.etree.ElementTree as ET
from datetime import timezone, timedelta

app = Flask(__name__, template_folder="templates")
datastore_client = datastore.Client()

@app.route("/")  # ルートURL
def home():
    return render_template("el_target_register.html")  # 🔹 HTMLファイルを描画

@app.route("/download")
def download_page():
    return render_template("download.html")

@app.route("/el_target_register",methods=["POST"])  # /el_target_register でもアクセス可能にする
def el_target_register():
    return render_template("el_target_register.html")


@app.route("/target", methods=["POST"])
def register_target():
    """ 対象機器の登録API """
    try:
        data = request.get_json()  # ✅ JSON データを取得する
        print(f"📥 受信データ: {data}")  # ✅ 受け取ったデータをログ出力
        
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        mode = data.get("mode", "register")  # デフォルト値として 'register' をセット
        region_id = data.get("regionId")
        target_id = data.get("targetId")
        target_name = data.get("targetName")

        if mode != "register":
            return jsonify({"error": "Invalid mode"}), 400

        if not region_id or not target_id or not target_name:
            return jsonify({"error": "Missing required parameters"}), 400

        # Datastore に保存
        key = datastore_client.key("ElTarget", f"{region_id}#{target_id}")
        entity = datastore.Entity(key=key)
        entity.update({
            "regionId": region_id,
            "targetId": target_id,
            "targetName": target_name
        })
        datastore_client.put(entity)

        print(f"✅ ElTarget 登録成功: regionId={region_id}, targetId={target_id}")
        return jsonify({"message": "Target registered successfully"}), 200

    except Exception as e:
        print(f"❌ エラー発生: {e}")
        return jsonify({"error": "Internal server error"}), 500

### ElTarget クラス（ターゲットデータの保存・管理）
class ElTarget:
    @staticmethod
    def get_region_id_by_target(target_id):
        """
        ✅ target_id に対応する regionId を取得
        🔹 2025-03-10: ElTarget を検索し、regionId を取得するメソッドを追加
        """
        query = datastore_client.query(kind="ElTarget")
        query.add_filter("targetId", "=", sys_id)
        result = list(query.fetch(limit=1))  # ✅ 1件だけ取得

        if not result:
            print(f"⚠️ sysId {sys_id} に対応する targetId が見つかりません")
            return None
            
        entity = result[0]
        print(f"🔍 ElTarget 取得: targetId={entity['targetId']}, regionId={entity['regionId']}")
        return entity
        
    @staticmethod
    def get_target_by_sysid(sys_id):
        """ sysId から ElTarget のエンティティを取得 """
        query = datastore_client.query(kind="ElTarget")
        query.add_filter("targetId", "=", sys_id)  # sys_id を targetId として検索
        result = list(query.fetch(limit=1))  # 最初の1件を取得

        if not result:
            return None  # 見つからなかった場合

        return result[0]  # ElTarget のエンティティを返す 
        
    def __init__(self, region_id, target_id, target_name):
        self.id = f"{region_id}#{target_id}"
        self.region_id = region_id
        self.target_id = target_id
        self.target_name = target_name

    def save(self):
        key = datastore_client.key('ElTarget', self.id)
        entity = datastore.Entity(key=key)
        entity.update({
            'regionId': self.region_id,
            'targetId': self.target_id,
            'targetName': self.target_name
        })
        datastore_client.put(entity)

    @staticmethod
    def get_target(target_id):
        """ target_id から ElTarget の情報を取得（regionId を含む） """
        query = datastore_client.query(kind='ElTarget')
        query.add_filter('targetId', '=', target_id)
        results = list(query.fetch(limit=1))  # 最初の1件を取得
        if results:
            return results[0]  # ElTarget のエンティティを返す
        return None  # 見つからなかった場合

    @staticmethod
    def get_region_id_by_target(target_id):
        """ target_id から regionId を取得 """
        target = ElTarget.get_target(target_id)
        if target:
            return target['regionId']
        return None  # 見つからなかった場合
     # koreiru??
    def register_el_target(region_id, target_id, target_name):
        key = datastore_client.key("ElTarget", f"{region_id}#{target_id}")
        entity = datastore.Entity(key=key)
        entity.update({
            "regionId": region_id,
            "targetId": target_id,
            "targetName": target_name
        })
        datastore_client.put(entity)
        print(f"✅ ElTarget 登録成功: regionId={region_id}, targetId={target_id}")

    # ✅ DAQA005 を手動で登録（regionId=6）
    #register_el_target("6", "DAQA005", "北塩原村　第３水源")



### SensorData クラス（センサーデータの保存・管理）
class SensorData:
    def __init__(self, sys_id, date, time_value, data1, data2, data3):
        self.sys_id = sys_id
        self.date = date
        self.time = time_value
        self.udt = datetime.utcnow().isoformat()
        self.id = str(int(time.time() * 1000))
        self.data1 = data1
        self.data2 = data2
        self.data3 = data3

    def save(self):
        key = datastore_client.key('SensorData', self.id)
        entity = datastore.Entity(key=key)
        entity.update({
            'sysId': self.sys_id,
            'date': self.date,
            'time': self.time,
            'udt': self.udt,
            'data1': self.data1,
            'data2': self.data2 or "",
            'data3': self.data3 or ""
        })
        datastore_client.put(entity)

### ElWorkRecord クラス（稼働データの保存）
class ElWorkRecord:
    def __init__(self, region_id, target_id, start_time, max_data):
        self.id = f"{region_id}-{target_id}-{start_time}"
        self.region_id = region_id
        self.target_id = target_id
        self.start_time = start_time
        self.end_time = None
        self.max_data = max_data
        # ✅ `start_time`（ミリ秒）を `datetime` に変換
        dt_obj = datetime.utcfromtimestamp(start_time / 1000)  # UNIX時間を `datetime` に変換
        self.date_string = dt_obj.strftime("%Y-%m-%d")  # "YYYY-MM-DD" 形式
        self.year = dt_obj.strftime("%Y")  # "YYYY"
        self.month = dt_obj.strftime("%m")  # "MM"
        self.date = dt_obj.strftime("%d")  # "DD"

        self.mean = max_data  # 平均データ用
     
    def save(self):
        key = datastore_client.key('ElWorkRecord', self.id)
        entity = datastore.Entity(key=key)
        entity.update({
            'regionId': self.region_id,
            'targetId': self.target_id,
            'startTime': self.start_time,
            'endTime': self.end_time,
            'maxData': self.max_data,
            'dateString': self.date_string,  # ✅ 追加 (2025-03-11 修正)
            'year': self.year,  # ✅ 追加 (2025-03-11 修正)
            'month': self.month,  # ✅ 追加 (2025-03-11 修正)
            'date': self.date,  # ✅ 追加 (2025-03-11 修正)
        })
        datastore_client.put(entity)
        print(f"✅ Datastore に保存: {self.id} (2025-03-11 修正)")  # 修正日を追加
        
           # ✅ データが保存されたか直後に確認
        saved_entity = datastore_client.get(key)
        if saved_entity:
            print(f"✅ Datastore に保存確認: {saved_entity}")
        else:
            print(f"❌ Datastore に保存されていません！")


    def update_end_time(self, end_time):
        key = datastore_client.key('ElWorkRecord', self.id)
        entity = datastore_client.get(key)
        if entity:
            entity['endTime'] = end_time
            datastore_client.put(entity)
            print(f"✅ ElWorkRecord 更新: {self.id} (終了: {end_time}) (2025-03-11 修正)")  # 修正日を追加


### ElState クラス（センサーデータの変化を監視し、ElWorkRecord を作成）
class ElState:
    def __init__(self, sys_id, region_id):
        self.sys_id = sys_id
        self.region_id = region_id
        self.last_data = None
        self.active_records = {}
     
    def parse_sensor_data(self, data_string):
        """
        📌 センサーデータ文字列を解析し、辞書形式に変換 (2025-03-11 修正)
        例: "ch1 0.0,ch2 5.0,ch3 NA" → {"ch1": 0.0, "ch2": 5.0, "ch3": None}
        """
        parsed_data = {}
        for entry in data_string.split(","):
            parts = entry.strip().split(" ")
            if len(parts) == 2:
                ch_key, value = parts
                try:
                    parsed_data[ch_key] = float(value) if value.upper() != "NA" else None
                except ValueError:
                    parsed_data[ch_key] = None  # 無効なデータは `None` にする

        return parsed_data
        
    def update_state(self, sensor_data):
        """
        📌 すべてのchに対して ElWorkRecord を作成・更新 (2025-03-11 修正)
        """
        parsed_data = self.parse_sensor_data(sensor_data.data1)  # ✅ すべてのchのデータを取得
    
        if self.last_data is None:
            self.last_data = {ch_key: 0.0 for ch_key in parsed_data.keys()}  # ✅ 初回データを 0.0 に初期化

        # ✅ `sysId` から `targetId` を取得
        target_entity = ElTarget.get_target_by_sysid(self.sys_id)
        if not target_entity:
            print(f"⚠️ sysId {self.sys_id} に対応する targetId が見つかりません")
            return

        target_id = target_entity["targetId"]  # `targetId` を取得
        region_id = target_entity["regionId"]  # `regionId` を取得
       
        print(f"✅ sysId={self.sys_id} に対応する targetId={target_id}, regionId={region_id}")

        for ch_key, prev_value in self.last_data.items():
            new_value = parsed_data.get(ch_key, 0.0)  # `None` の場合は 0.0 に変換

            if new_value is None:
                new_value = 0.0
        
            try:
                new_value = float(new_value)  # ✅ 数値変換チェック追加
            except ValueError:
                print(f"⚠️ 無効なデータ: ch_key={ch_key}, value={new_value} (2025-03-11 修正)")
                continue  # 無効なデータはスキップ

            # ✅ `regionId.targetId.ch_key` の形式で `key_string` を作成
            #key_string = f"{region_id}.{target_id}.{ch_key}"
            #start_time = int(time.time() * 1000)
            # ✅ `ch1`, `ch2`, ... から `1`, `2`, ... を取得 (chの数値だけ抽出)
            ch_num = int(ch_key.replace("ch", ""))  # "ch1" → 1, "ch2" → 2

        # ✅ `regionId.targetId.ch_num` の形式で `key_string` を作成
            key_string = f"{region_id}.{ch_num}"
            start_time = int(time.time() * 1000)

            # ✅ 0 → 3 以上の変化をチェックし、ElWorkRecord を作成
            if prev_value <= 3.0 and new_value > 3.0:
                print(f"✅ ElWorkRecord 作成: {region_id} - {ch_num} (開始: {start_time})")
                #record = ElWorkRecord(region_id, target_id, start_time, new_value)
                record = ElWorkRecord(region_id, ch_num, start_time, new_value)
                record.save()
                self.active_records[ch_key] = record

            # ✅ 3 以上 → 3 未満の変化をチェックし、ElWorkRecord を更新
            elif prev_value >= 3.0 and new_value < 3.0 and ch_key in self.active_records:
                end_time = int(time.time() * 1000)
                self.active_records[ch_key].update_end_time(end_time)
                del self.active_records[ch_key]
                print(f"✅ ElWorkRecord 更新: {region_id} - {ch_num} (終了: {end_time})")


            # ✅ 3 以上の状態が続く場合、最大値を更新
            elif new_value > 3.0 and ch_key in self.active_records:
                record = self.active_records[ch_key]
                if record.max_data < new_value:
                    record.max_data = new_value
                    record.save()
                    print(f"✅ ElWorkRecord 更新: {region_id} - {target_id} - {ch_key} (maxData 更新: {new_value})")

            # ✅ 最新データを保存
            self.last_data[ch_key] = new_value
    
# ElState のインスタンスを保持（各 sysId ごとに管理）
el_state_map = {}

### 📌 ElStateManager の統合
class ElStateManager:
    _instance = None  # シングルトン
    state_map = {}  # sysId をキーとする ElState の辞書

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ElStateManager, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        """ EoE_Eden_Number.xml を読み込んで ElState インスタンスを作成 """
        xml_file_path = os.path.join(os.path.dirname(__file__), "EoE_Eden_Number.xml")
        if not os.path.exists(xml_file_path):
            print("❌ EoE_Eden_Number.xml が見つかりません")
            return

        print("✅ EoE_Eden_Number.xml 読み込み開始")
        tree = ET.parse(xml_file_path)
        root = tree.getroot()

        for region in root.findall("region"):
            region_id = region.get("num")
            for client in region.findall("client"):
                sys_id = client.get("sysid")
                now = datetime.now(timezone.utc)
                date = now.strftime("%Y-%m-%d")
                time_str = now.strftime("%H:%M:%S")

                print(f"📌 ElState 登録: sysId={sys_id}, regionId={region_id}")
                self.state_map[sys_id] = ElState(sys_id, region_id)
        
        print("✅ ElStateManager 初期化完了")

    def reload_status(self):
        """ 1分以上更新がない ElState のステータスを変更 """
        now = datetime.now(timezone.utc)
        for el_state in self.state_map.values():
            last_request_time = datetime.strptime(el_state.get_last_request_datetime(), "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            
            if (now - last_request_time) > timedelta(minutes=1):
                el_state.to_next_stage()
            else:
                el_state.set_status_code("FINE")

    def update_state(self, sensor_data):
        """ 状態の更新 """
        if sensor_data.sys_id in self.state_map:
            #print(f"🔄 {sensor_data.sys_id} の状態更新")
            self.state_map[sensor_data.sys_id].update_state(sensor_data)
        else:
            print(f"⚠️ ERROR: {sensor_data.sys_id} は登録されていません")
            
el_state_manager = ElStateManager()  # アプリ起動時に ElStateManager を初期化

@app.route('/elsettingtargets', methods=['POST'])
def elsettingtargets():
    mode = request.form.get('mode')
    target_id = request.form.get('tid')
    target_name = request.form.get('tname')
    region_id = request.form.get('rid')

    if mode == 'register':
        if not target_id or not target_name or not region_id:
            return jsonify({"error": "Missing required parameters"}), 400

        target = ElTarget(region_id, target_id, target_name)
        target.save()
        return jsonify({"message": "Target registered successfully"}), 200

    return jsonify({"error": "Invalid mode"}), 400

def parse_all_channels(data1):
    """
    data1 の文字列を解析し、辞書形式で {ch1: 0.0, ch2: 2.97, ..., ch32: None} の形式に変換 (2025-03-11 修正)
    """
    channel_data = {}
    valid_data_found = False  # 有効なデータがあるか確認

    try:
        for item in data1.split(","):
            parts = item.strip().split(" ")
            if len(parts) == 2 and parts[0].startswith("ch"):
                ch_name = parts[0]  # 例: ch1, ch2, ..., ch32
                try:
                    channel_data[ch_name] = float(parts[1])  # 数値変換
                    valid_data_found = True
                except ValueError:
                    channel_data[ch_name] = None  # "NA" などの無効値は None にする

    except Exception as e:
        print(f"⚠️ データ解析エラー: {e} (2025-03-11 修正)")
        return None  # 解析エラー時は None を返す

    if not valid_data_found:
        print(f"⚠️ すべてのデータが無効: {data1} (2025-03-11 修正)")
        return None

    return channel_data


@app.route('/ellighttracker2', methods=['POST', 'GET'])
def ellighttracker2():
    mode = request.form.get('mode') or request.args.get('mode') 
    sys_id = request.form.get('sysId') or request.form.get('sid') or request.args.get('sysId') or request.args.get('sid')
    date = request.form.get('date') or request.args.get('date')
    time_value = request.form.get('time')
    data1 = request.form.get('data1', '').replace('+', ' ')
    data2 = request.form.get('data2', '').replace('+', ' ')
    data3 = request.form.get('data3', '').replace('+', ' ')

    if mode == 'd':
        sensor_data = SensorData(sys_id, date, time_value, data1, data2, data3)
        sensor_data.save()
        
        # ✅ ch1 ~ ch32 の値を辞書に変換
        channel_values = parse_all_channels(data1)
        # ✅ sys_id が None の場合、エラーを返す
        if not channel_values:
            print(f"⚠️ 無効なデータ: {data1} ({date} 修正）")
            return jsonify({"error": f"⚠️ 無効なデータ: {data1}"}), 
            
        if not sys_id:
            error_msg = "⚠️ sys_id が指定されていません"
            print(f"🚨 ERROR: {error_msg}")
            return jsonify({"error": "⚠️ sys_id が指定されていません"}), 400

        # ✅ ElTarget から sys_id に対応する regionId を取得
        actual_region_id = ElTarget.get_region_id_by_target(sys_id)  # sys_id から正しい regionId を取得

        if actual_region_id is None:
            print(f"⚠️ sysId {sys_id} に対応する regionId が見つかりません")  # ✅ デバッグ用
            return jsonify({"error": f"⚠️ sysId {sys_id} に対応する regionId が見つかりません"}), 400

        print(f"🔍 sys_id={sys_id} に対応する regionId={actual_region_id}")  # ✅ デバッグ用

        # ✅ ElState インスタンスがない場合、取得した regionId で作成
        if sys_id not in el_state_map:
            el_state_map[sys_id] = ElState(sys_id, actual_region_id)
            print(f"✅ ElState 作成: sysId={sys_id}, regionId={actual_region_id}")  # ✅ デバッグ用

          # ✅ 以前の状態を保存しておく
        #prev_state = float(el_state_map[sys_id].last_data) if el_state_map[sys_id].last_data else 0.0
        # ✅ last_data を辞書として扱い、すべてのチャンネルを処理
        prev_state = {ch: float(value) if value is not None else 0.0 for ch, value in (el_state_map[sys_id].last_data or {}).items()}


          # ✅ 状態を更新し、ElWorkRecord を作成
        el_state_map[sys_id].update_state(sensor_data)

          # ✅ 更新後の状態を取得
        #new_state = float(el_state_map[sys_id].last_data) if el_state_map[sys_id].last_data else 0.0
        new_state = float(el_state_map[sys_id].last_data.get("ch2", 0.0))  # ch2 の値を取得し、なければ 0.0

          # ✅ 状態変化があればログ出力
        if prev_state != new_state:
            print(f"🔄 状態変化: {prev_state} → {new_state} (sysId={sys_id}, regionId={actual_region_id})")  # ✅ デバッグ用

        return jsonify({"message": "✅ Data stored successfully", "id": sensor_data.id, "udt": sensor_data.udt}), 200


    elif mode == 's':
        query = datastore_client.query(kind='SensorData')
        query.add_filter('sysId', '=', sys_id)
        query.add_filter('date', '=', date)
        query.order = ['time']
        results = list(query.fetch())

        xml_response = f"<?xml version='1.0' encoding='UTF-8'?>\n<result date='{date}' sysId='{sys_id}'>"
        for entity in results:
            xml_response += f"\n    <data ID='{entity.key.name}' Data1='{entity['data1']}' Data2='{entity['data2']}' Data3='{entity['data3']}' Time='{entity['time']}' UDT='{entity['udt']}'/>"
        xml_response += "\n</result>"
        return Response(xml_response, mimetype="application/xml")
     
    elif mode == 'j':
       # mode = request.form.get('mode') or request.args.get('mode')
        sys_id = request.form.get('sysId') or request.form.get('sid') or request.args.get('sysId') or request.args.get('sid')
        date = request.form.get('date') or request.args.get('date')

        print("🔍 sys_id:", sys_id)
        print("🔍 date:", date)

        if not sys_id or not date:
            return Response(json.dumps({"error": "sysId または date が指定されていません"}), mimetype="application/json", status=400)

        query = datastore_client.query(kind='SensorData')
        query.add_filter('sysId', '=', sys_id)
        query.add_filter('date', '=', date)
        query.order = ['time']
        results = list(query.fetch())

        print("📦 results 件数:", len(results))
        #channel_data = {f'ch{i+1}': [] for i in range(32)}
        data_lists = [[] for _ in range(31)]
        for entity in results:
            raw_data = entity.get('data1', '')
            time_val = entity.get('time', '')
            try:
                if raw_data.startswith('ch'):
                    items = raw_data.split(',')
                    for i, item in enumerate(items):
                        if i < len(items):
                            parts = item.strip().split(' ')
                            if len(parts) == 2:
                                val = parts[1]
                                if val != 'NA':
                                    data_lists[i - 1].append({
                                        'data': float(val),
                                        'Time': time_val
                                    })
                                else:
                                    data_lists[i - 1].append({
                                        'data': None,
                                        'Time': time_val
                                         })
                            else:
                                data_lists[i - 1].append({
                                        'data': None,
                                        'Time': time_val
                                         })
            except Exception as e:
                print("[ERROR] Data parse failed:", e)
          
        response_data = {
            'Date': date,
            'data_lists': data_lists
          }

        print("[DEBUG] Response JSON:", response_data)

        return jsonify(response_data)                  
                            
        return jsonify({'error': 'Invalid mode'}), 400


@app.route('/elworkrecord', methods=['GET'])
def get_elworkrecord():
    region_id = request.args.get('regionId')

    query = datastore_client.query(kind='ElWorkRecord')
    query.add_filter('regionId', '=', region_id)
    results = list(query.fetch())

    json_data = {
        "regionId": region_id,
        "records": [
            {
                "ID": entity.key.name,
                "targetId": entity["targetId"],
                "startTime": entity["startTime"],
                "endTime": entity.get("endTime", None),
                "maxData": entity["maxData"]
            }
            for entity in results
        ]
    }
    return jsonify(json_data)

# -- クラス: 各設備・各日付の合計回数・稼働時間を保持 --
class ElCounter:
    def __init__(self, target_id, count=0, uptime=0, day=1):
        self.target_id = target_id
        self.count = count
        self.uptime = uptime
        self.day = day

    def apply_data(self, uptime):
        self.count += 1  # 稼働レコード1件あたり1加算
        self.uptime += uptime  # 稼働時間(秒)を加算

    def get_count_cycle_data(self):
        return self.count

    def get_colon_format_time(self):
        hours = self.uptime // 3600
        minutes = (self.uptime % 3600) // 60
        return f"{int(hours):02}:{int(minutes):02}"

# -- 静的HTMLファイルの提供: KunugiPaper5.html を公開 --
@app.route('/KunugiPaper5.html')
def serve_kunugi():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'KunugiPaper5.html')

# -- APIエンドポイント: /month (GET,POST) --
@app.route('/month', methods=['GET','POST'])
def el_month():
    if request.method == 'POST':
        mode = request.form.get('mode')
        region_id = request.form.get('rid')
        year = request.form.get('year')
        month = request.form.get('month')
    else:
        mode = request.args.get('mode')
        region_id = request.args.get('rid')
        year = request.args.get('year')
        month = request.args.get('month')

    if not all([mode, region_id, year, month]):
        return Response("Missing required parameters", status=400)

    if mode == 't':
        return process_total_mode(year, month, region_id)
    elif mode == 'e':
        return process_each_mode(year, month, region_id)
    else:
        return Response("Invalid mode parameter", status=400)

# -- モード=t：各日付ごとの設備の合計データ（回数・稼働時間） --
def process_total_mode(year, month, region_id):

     # データが文字列型で保存されている場合に対応
    year = int(year)
    region_id = int(region_id)
    month = str(month).zfill(2)  # 例: 3 → "03"
    
    query = datastore_client.query(kind='ElWorkRecode')
    query.add_filter('year', '=', year)
    query.add_filter('month', '=', month)
    query.add_filter('regionId', '=', region_id)
    query.order = ['startTime']

    records = list(query.fetch())

    eq_map = {}  # targetId → targetName
    counter_map = {}  # targetId@date → ElCounter

    for record in records:
        target_id = record['targetId']
        date_str = record['date']
        key_string = f"{target_id}@{date_str}"

        if target_id not in eq_map:
            key = datastore_client.key('ElTarget', f"{region_id}#{target_id}")
            target_entity = datastore_client.get(key)
            eq_map[target_id] = target_entity['targetName']

        if 'endTime' in record and record['endTime'] != 0:
            if key_string not in counter_map:
                counter_map[key_string] = ElCounter(target_id, 0, 0, int(date_str))
            counter_map[key_string].apply_data(record['uptime'])

    # 月日ごとのデータ生成
    days_in_month = calendar.monthrange(int(year), int(month))[1]
    response_json_list = []
    for day in range(1, days_in_month + 1):
        entry = {"date": day}
        for target_id in eq_map:
            key_string = f"{target_id}@{day}"
            if key_string not in counter_map:
                counter_map[key_string] = ElCounter(target_id, 0, 0, day)
            counter = counter_map[key_string]
            entry[f"cycle{target_id}"] = counter.get_count_cycle_data()
            entry[f"time{target_id}"] = counter.get_colon_format_time()
        response_json_list.append(entry)

    eq_list = [{"id": k, "name": v} for k, v in eq_map.items()]
    return jsonify({"eqList": eq_list, "dataObjectList": response_json_list})

# -- モード=e：各レコードの詳細稼働データ出力 --
def process_each_mode(year, month, region_id):

    print("🔍 クエリ条件: year =", year, "month =", month, "regionId =", region_id)

    year = str(year)
    region_id = str(region_id)
    month = str(month).zfill(2)

    # 正規化後もログ出す
    print("🛠 フィルタ用値: year =", year, "month =", month, "regionId =", region_id)

    query = datastore_client.query(kind='ElWorkRecode')
    query.add_filter('year', '=', year)
    query.add_filter('month', '=', month)
    query.add_filter('regionId', '=', region_id)
    query.order = ['startTime']
    records = list(query.fetch())
    print(f"取得したレコード数: {len(records)}")
    
    # 🔍 保存データ確認用（開発・デバッグ用）
    query_all = datastore_client.query(kind='ElWorkRecode')
    all_records = list(query_all.fetch(limit=5))
    for r in all_records:
        print("📄 ElWorkRecodeレコード:", dict(r))
     
          
    target_map = {}  # targetId → targetName
    response_json_list = []

    for record in records:
        target_id = record['targetId']

        if target_id not in target_map:
            key = datastore_client.key('ElTarget', f"{region_id}#{target_id}")
            target_entity = datastore_client.get(key)
            target_map[target_id] = target_entity['targetName']
               
            if not target_entity:
                print(f"target_entityが存在しません: target_id={target_id}, key={key}")
                target_map[target_id] = "不明なターゲット"
            else:
                target_map[target_id] = target_entity.get('targetName', '名前なし')
                if 'targetName' not in target_entity:
                    print(f"targetNameが存在しません: target_id={target_id}, entity={target_entity}")

        max_data = Decimal(str(record.get('maxData', 0))).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)

        response_json_list.append({
            "targetName": target_map[target_id],
            "targetId": target_id,
            "MaxData": float(max_data),
            "startTime": record.get('startTime', ''),
            "endTime": record.get('endTime', ''),
            "upTime": record.get('uptime', ''),
            "date": record.get('date', '')
        })

    return jsonify({"datalist": response_json_list})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)


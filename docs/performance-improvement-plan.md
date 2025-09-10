# ELLight Tracker パフォーマンス改善計画

**作成日**: 2025-09-10  
**対象プロジェクト**: ELLight Tracker Demo  
**分析者**: Claude Code Assistant  

## 📊 現状分析

### 発見された主要な問題

1. **データベースアクセス効率性**
   - N+1 クエリ問題が発生
   - 単発クエリによる不要なDB接続
   - インデックスが最適化されていない

2. **フロントエンド処理**
   - 同期Ajax処理によるUIブロック
   - データキャッシュ機能なし
   - Vue.jsの最適化不足

3. **アプリケーション設計**
   - キャッシュ戦略なし
   - パフォーマンス監視なし
   - エラーハンドリング不備

---

## 🔥 重大なパフォーマンス問題

### 1. Datastore クエリの非効率性

**現在の問題**:
```python
# N+1 クエリ問題
for record in records:
    target_id = record['targetId']
    if target_id not in target_map:
        key = datastore_client.key('ElTarget', f"{region_id}#{target_id}")
        target_entity = datastore_client.get(key)  # 毎回DB接続
```

**改善案**:
```python
def get_targets_batch(region_id, target_ids):
    """複数のターゲットを一度に取得"""
    keys = [datastore_client.key('ElTarget', f"{region_id}#{tid}") for tid in target_ids]
    entities = datastore_client.get_multi(keys)  # 一括取得
    return {entity['targetId']: entity for entity in entities if entity}

# 使用例
target_ids = list(set(record['targetId'] for record in records))
target_map = get_targets_batch(region_id, target_ids)
```

**期待効果**: データベース接続回数を 80-90% 削減

---

### 2. 同期処理による UI ブロック

**現在の問題**:
```javascript
return $.ajax({
    async:false,  // UIをブロック！
    // ...
})
```

**改善案**:
```javascript
async function fetchMonthData(baseUrl, year, month, regionId) {
    try {
        const response = await fetch(`${baseUrl}/month?mode=e&year=${year}&month=${month}&rid=${regionId}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('データ取得エラー:', error);
        return null;
    }
}
```

**期待効果**: ユーザー体験の大幅改善、レスポンシブな UI

---

## 📊 データベースクエリ最適化

### 3. インデックス戦略の改善

**推奨 index.yaml 設定**:
```yaml
indexes:
- kind: ElWorkRecord
  properties:
  - name: regionId
  - name: year  
  - name: month
  - name: startTime

- kind: SensorData
  properties:
  - name: sysId
  - name: date
  - name: time
```

### 4. クエリの最適化

```python
def process_each_mode_optimized(year, month, region_id):
    # 複合インデックスを活用したクエリ
    query = datastore_client.query(kind='ElWorkRecord')
    query.add_filter('regionId', '=', region_id)
    query.add_filter('year', '=', str(year))
    query.add_filter('month', '=', str(month).zfill(2))
    query.order = ['startTime']
    
    # プロジェクション（必要なフィールドのみ取得）
    query.projection = ['targetId', 'startTime', 'endTime', 'maxData', 'date']
    
    records = list(query.fetch())
    
    # バッチでターゲット名を取得
    unique_target_ids = list(set(r['targetId'] for r in records))
    target_map = get_targets_batch(region_id, unique_target_ids)
    
    return build_response(records, target_map)
```

### 5. メモリ使用量の最適化

```python
from functools import lru_cache

class OptimizedDataManager:
    @lru_cache(maxsize=128)
    def get_target_name(self, region_id, target_id):
        """ターゲット名をキャッシュ付きで取得"""
        key = datastore_client.key('ElTarget', f"{region_id}#{target_id}")
        entity = datastore_client.get(key)
        return entity.get('targetName', 'Unknown') if entity else 'Unknown'
    
    def process_records_streaming(self, query):
        """大量データを段階的に処理"""
        for batch in self.batch_fetch(query, batch_size=100):
            yield self.process_batch(batch)
    
    def batch_fetch(self, query, batch_size=100):
        """バッチ単位でデータを取得"""
        cursor = None
        while True:
            if cursor:
                query.start_cursor = cursor
            
            batch = list(query.fetch(limit=batch_size))
            if not batch:
                break
                
            yield batch
            cursor = query.end_cursor
```

---

## ⚡ フロントエンド最適化

### 6. データ取得の最適化

```javascript
class DataManager {
    constructor() {
        this.cache = new Map();
        this.loadingStates = new Map();
    }
    
    async fetchWithCache(url, cacheKey, maxAge = 300000) { // 5分キャッシュ
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < maxAge) {
            return cached.data;
        }
        
        if (this.loadingStates.get(cacheKey)) {
            return this.loadingStates.get(cacheKey);
        }
        
        const promise = fetch(url).then(r => r.json());
        this.loadingStates.set(cacheKey, promise);
        
        try {
            const data = await promise;
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } finally {
            this.loadingStates.delete(cacheKey);
        }
    }
}
```

### 7. Vue.js パフォーマンス改善

```javascript
// 最適化されたVueコンポーネント
const OptimizedFormTable = {
    template: '#form-table-template',
    props: {
        data: Array,
        columns: Object,
    },
    computed: {
        // 計算プロパティでフィルタリング処理をキャッシュ
        filteredData() {
            return this.data.filter(item => item.upTime > 0);
        }
    },
    methods: {
        // 仮想スクロール対応
        getVisibleItems(startIndex, endIndex) {
            return this.filteredData.slice(startIndex, endIndex);
        }
    }
};

// メインVueインスタンスの最適化  
const form2 = new Vue({
    el: '#form2',
    data: {
        // ...既存のデータ
        loading: false,
        error: null,
    },
    computed: {
        // 重い計算をキャッシュ
        processedData() {
            if (!this.dataJson.datalist) return [];
            return this.dataJson.datalist.map(item => ({
                ...item,
                formattedTime: this.formatTime(item.upTime)
            }));
        }
    },
    methods: {
        async fetchData(year, month) {
            if (this.loading) return;
            
            this.loading = true;
            this.error = null;
            
            try {
                const cacheKey = `${year}-${month}-${this.regionId}`;
                const data = await this.dataManager.fetchWithCache(
                    `${this.baseUrl}/month?mode=e&year=${year}&month=${month}&rid=${this.regionId}`,
                    cacheKey
                );
                
                this.dataJson = data;
            } catch (error) {
                this.error = error.message;
                console.error('データ取得エラー:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});
```

---

## 🗄️ キャッシュ戦略

### 8. Flask-Caching の導入

```python
from flask_caching import Cache

# キャッシュ設定
app.config['CACHE_TYPE'] = 'simple'  # 開発用、本番ではRedisを推奨
cache = Cache(app)

@app.route('/month', methods=['GET','POST'])
@cache.cached(timeout=300, key_prefix='month_data')  # 5分キャッシュ
def el_month():
    # 既存のコード...
    pass

# 動的キー生成
def make_cache_key(*args, **kwargs):
    mode = request.args.get('mode') or request.form.get('mode')
    region_id = request.args.get('rid') or request.form.get('rid')
    year = request.args.get('year') or request.form.get('year')
    month = request.args.get('month') or request.form.get('month')
    return f"month_{mode}_{region_id}_{year}_{month}"

@app.route('/month', methods=['GET','POST'])
@cache.cached(timeout=300, make_cache_key=make_cache_key)
def el_month_cached():
    # 処理...
    pass
```

### 9. HTTP キャッシュヘッダー

```python
from flask import make_response
from datetime import datetime, timedelta

@app.route('/static-data')
def static_data():
    response = make_response(jsonify(data))
    # 1時間キャッシュ
    response.headers['Cache-Control'] = 'public, max-age=3600'
    response.headers['ETag'] = generate_etag(data)
    return response

@app.route('/realtime-data')  
def realtime_data():
    response = make_response(jsonify(data))
    # 短時間キャッシュ
    response.headers['Cache-Control'] = 'public, max-age=60'
    return response
```

### 10. CDN とリソース最適化

```html
<!-- 静的リソースの最適化 -->
<link rel="preload" href="/static/css/main.css" as="style">
<link rel="preload" href="/static/js/main.js" as="script">

<!-- CDN からライブラリを読み込み -->
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
```

---

## 📈 パフォーマンス監視

### 11. メトリクス収集

```python
import time
from functools import wraps

def track_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            end_time = time.time()
            logger.info(f"{func.__name__} took {end_time - start_time:.2f} seconds")
    return wrapper

@track_performance
def process_each_mode(year, month, region_id):
    # 処理...
    pass
```

---

## 🎯 実装優先度

### 🔴 高優先度（即座に実装推奨）
1. **N+1クエリ問題の解決** - 最も効果的
   - 期待効果: DB接続数 80-90% 削減
   - 実装時間: 2-3時間
   - リスク: 低

2. **同期Ajax→非同期への変更** - UX改善
   - 期待効果: UI応答性の劇的向上
   - 実装時間: 1-2時間
   - リスク: 低

3. **バッチクエリの導入** - DB負荷軽減
   - 期待効果: レスポンス時間 50-70% 短縮
   - 実装時間: 3-4時間
   - リスク: 中

### 🟡 中優先度（1-2週間以内）
4. **Flask-Cachingの導入** - レスポンス時間短縮
   - 期待効果: API応答時間 40-60% 短縮
   - 実装時間: 4-6時間
   - リスク: 中

5. **インデックスの最適化** - クエリ性能向上
   - 期待効果: クエリ実行時間 30-50% 短縮
   - 実装時間: 2-3時間
   - リスク: 低

6. **Vue.js計算プロパティの活用** - フロントエンド最適化
   - 期待効果: 画面描画性能 20-30% 向上
   - 実装時間: 3-4時間
   - リスク: 低

### 🟢 低優先度（1ヶ月以内）
7. **ストリーミング処理の導入** - 大容量データ対応
   - 期待効果: メモリ使用量 70% 削減
   - 実装時間: 8-12時間
   - リスク: 高

8. **CDNの導入** - 静的リソース配信最適化
   - 期待効果: ページ読み込み時間 20-40% 短縮
   - 実装時間: 4-6時間
   - リスク: 中

9. **パフォーマンス監視の実装** - 継続的改善
   - 期待効果: 問題の早期発見・対応
   - 実装時間: 6-8時間
   - リスク: 低

---

## 📝 実装チェックリスト

### Phase 1: 緊急対応 (1週間)
- [ ] N+1クエリ問題修正
- [ ] 同期Ajax→非同期変更
- [ ] バッチクエリ実装
- [ ] 基本的なエラーハンドリング追加

### Phase 2: 基盤強化 (2-3週間)
- [ ] Flask-Caching導入
- [ ] インデックス最適化
- [ ] Vue.js最適化
- [ ] HTTPキャッシュヘッダー設定

### Phase 3: 高度な最適化 (1-2ヶ月)
- [ ] ストリーミング処理
- [ ] CDN導入
- [ ] パフォーマンス監視
- [ ] 仮想スクロール実装

---

## 📊 期待される改善効果

| 項目 | 現状 | 改善後 | 効果 |
|------|------|--------|------|
| API応答時間 | 2-5秒 | 0.5-1秒 | 70-80%短縮 |
| ページ読み込み | 3-8秒 | 1-3秒 | 60-70%短縮 |
| DB接続数 | 月100万回 | 月20万回 | 80%削減 |
| メモリ使用量 | 高負荷時500MB | 高負荷時150MB | 70%削減 |
| ユーザー体験 | ブロッキングあり | レスポンシブ | 大幅改善 |

---

## ⚠️ 実装時の注意事項

1. **段階的実装**: 全てを一度に変更せず、優先度順に実装
2. **テスト重視**: 各変更後は必ず動作確認を実施
3. **ロールバック準備**: 問題発生時の復旧手順を準備
4. **監視強化**: 実装後のパフォーマンス監視を継続
5. **ドキュメント更新**: 変更内容を必ずドキュメント化

---

**最終更新**: 2025-09-10  
**次回レビュー予定**: 実装開始後1週間
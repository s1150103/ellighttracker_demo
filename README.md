# ELLight Tracker Demo

Google App Engine 上で動作する Python 製 Web アプリケーションです。Docker を用いてローカル開発が可能で、Google Cloud Datastore をバックエンドに使用しています。

## 🚀 概要

- **Google App Engine（GAE）対応**
- **Python Flask フレームワーク**
- **Docker / docker-compose によるローカル開発環境**
- **認証機能付き Web アプリ**
- **ファイルアップロード機能**
- **Datastore 連携によるデータ管理**

## 📁 ディレクトリ構成

```
ellighttracker_demo/
├── 📄 main.py                    # Flask アプリケーション本体
├── 📄 auth.py                    # 認証処理
├── 📄 datastore_check.py         # Datastore 接続確認スクリプト
├── 📄 mode_bac.py                # バックアップ用モード設定
├── 📄 main_bac.py                # バックアップ用メインファイル
├── 🐳 Dockerfile                 # Docker イメージ設定
├── 🐳 docker-compose.yml         # ローカル開発用設定
├── 📝 requirements.txt           # Python パッケージ一覧
├── ⚙️ app.yaml                   # GAE 本番環境設定
├── ⚙️ app_back.yaml              # GAE バックアップ設定
├── ⚙️ app_bac.yaml               # GAE 追加設定
├── ⚙️ app_standar.yaml           # GAE 標準設定
├── 📊 index.yaml                 # Datastore インデックス定義
├── 📋 EoE_Eden_Number.xml        # データファイル
├── 🖼️ images/                    # 画像ファイル
│   └── medichine.jpeg
├── 📁 templates/                 # HTML テンプレート
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── download.html
│   └── el_target_register.html
├── 📁 static/                    # 静的ファイル
│   ├── 📁 css/                   # スタイルシート
│   │   ├── bootstrap.min.css
│   │   ├── main.css
│   │   ├── dashboard.css
│   │   ├── chartStyle.css
│   │   └── ...
│   ├── 📁 js/                    # JavaScript
│   │   ├── main.js
│   │   ├── chart.js
│   │   ├── graph.js
│   │   ├── vueform.js
│   │   └── ...
│   ├── 📁 lib/                   # ライブラリ
│   │   ├── vue.min.js
│   │   ├── d3.min.js
│   │   ├── bootstrap.min.js
│   │   └── ...
│   ├── *.html                    # 追加HTMLファイル
│   └── logo.png
├── 📁 uploads/                   # アップロードファイル格納
└── 📁 docs/                      # ドキュメント
    └── report/                   # 作業報告書
        ├── 2025-07-02.md
        └── 2025-07-03.md
```

## 🛠 セットアップと実行

### ローカル環境（Docker 使用）

```bash
# イメージのビルドと起動
docker-compose up --build
```

ブラウザで http://localhost:8080 にアクセス

### GAE へのデプロイ

```bash
gcloud app deploy
```

初回は `gcloud init` や `gcloud auth login` が必要な場合があります。

## ✨ 主な機能

- **ユーザー認証**（ログイン・ログアウト）
- **ファイルのアップロードと管理**
- **Datastore へのデータ保存と表示**
- **管理画面テンプレートを使ったUI**
- **グラフ表示機能**
- **レスポンシブデザイン**

## ✅ 環境要件

- **Python 3.8 以上**
- **Docker / Docker Compose**
- **Google Cloud SDK（gcloud）**

## 🧑‍💻 開発者

佐藤 彰（akira.sato@aqua-crew.jp）

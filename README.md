<<<<<<< HEAD
# Flask + Google Cloud Datastore App

このリポジトリは、Flask を使った Web アプリと Google Cloud Datastore 連携のサンプルです。  
Docker によるローカル実行や GCP へのデプロイが可能です。

---

## 📁 構成

- `main.py` : Flask アプリ本体
- `Dockerfile` : アプリの Docker ビルド構成
- `credentials.json` : GCP サービスアカウントの認証情報（gitに含めないこと）
- `app.yaml` : GAE 用の設定ファイル（`gcloud app deploy` 用）

---

## 🐳 Dockerでのローカル起動方法

### 1. ビルド

```bash
docker build -t flask-app .
```

### 2. 実行

```bash
./run.sh
```

※ `run.sh` は以下の内容です：

```bash
#!/bin/bash

docker run -p 8080:8080 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/keys/credentials.json \
  -v $(pwd)/credentials.json:/app/keys/credentials.json:ro \
  flask-app
```

---

## ☁️ GCP へデプロイする場合

事前に Google Cloud SDK をインストールしてください：

```bash
gcloud app deploy
```

---

## 🔐 注意

- `credentials.json` は公開しないよう `.gitignore` に追加してください。
- `.env` の活用や Secret Manager の利用も検討可能です。

---

## 🧑‍💻 開発者

佐藤 彰（akira.sato@aqua-crew.jp）

=======
# My GAE EL（my-gae-el）

Google App Engine 上で動作する Python 製 Web アプリケーションプロジェクトです。Docker を用いてローカル開発が可能で、Google Cloud Datastore をバックエンドに使用しています。

## 🚀 概要

- Google App Engine（GAE）対応
- Python（Flask または FastAPI を想定）
- Docker / docker-compose によるローカル開発環境
- 認証機能付き Web アプリ
- ファイルアップロード機能
- Datastore 連携によるデータ管理

## 📁 ディレクトリ構成

my-gae-el/
├── Dockerfile # GAE デプロイ用 Dockerfile
├── docker-compose.yml # ローカル開発用 docker-compose
├── app.py / main.py # アプリケーション本体
├── auth.py # 認証処理
├── datastore_check.py # Datastore 接続確認スクリプト
├── requirements.txt # Python パッケージ一覧
├── app.yaml # GAE 構成ファイル
├── index.yaml # GAE のインデックス定義（Datastore用）
├── templates/ # HTMLテンプレート
├── static/ # 静的ファイル（CSS, JSなど）
├── uploads/ # アップロードファイル格納ディレクトリ
├── images/ # 画像ファイル
├── gittorkun.txt # Git関連メモ？（用途不明）
└── EoE_Eden_Number.xml # データファイル（用途に応じて要説明）


## 🛠 セットアップと実行

### ローカル環境（Docker 使用）

```bash
# イメージのビルドと起動
docker-compose up --build

ブラウザで http://localhost:8080 にアクセス。
GAE へのデプロイ

gcloud app deploy

初回は gcloud init や gcloud auth login が必要な場合があります。
✨ 主な機能（例）

    ユーザー認証（ログイン・ログアウト）

    ファイルのアップロードと管理

    Datastore へのデータ保存と表示

    管理画面テンプレートを使ったUI（templates/）

✅ 環境要件

    Python 3.8 以上

    Docker / Docker Compose

    Google Cloud SDK（gcloud）
>>>>>>> Initial commit

"""
認証モジュール (auth.py)

ユーザー認証（ログイン、登録、ログアウト）機能を提供
Flask Blueprint を使用してルートを管理
"""

import os
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from google.cloud import datastore
from flask_bcrypt import Bcrypt

# Flask-Bcrypt の初期化（パスワードハッシュ化用）
bcrypt = Bcrypt()

# Flask Blueprint の定義（認証関連のルートをグループ化）
auth_bp = Blueprint("auth", __name__)

# Google Cloud Datastore クライアントの初期化
# 注意: 本番環境では環境変数で認証情報を設定
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/your-service-account.json"
client = datastore.Client()

def create_user(email, password):
    """
    新規ユーザーを Datastore に登録
    
    Args:
        email (str): ユーザーのメールアドレス（一意のキー）
        password (str): プレーンテキストのパスワード
    """
    key = client.key("User", email)  # メールアドレスをキーとして使用
    entity = datastore.Entity(key)
    entity["email"] = email
    # パスワードをハッシュ化して保存（セキュリティ対策）
    entity["password"] = bcrypt.generate_password_hash(password).decode('utf-8')
    client.put(entity)

def get_user(email):
    """
    メールアドレスでユーザー情報を取得
    
    Args:
        email (str): 検索するメールアドレス
        
    Returns:
        Entity or None: ユーザー情報、見つからない場合は None
    """
    key = client.key("User", email)
    return client.get(key)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    """
    ユーザーログイン処理
    
    GET: ログインフォームを表示
    POST: ログイン認証を実行
    """
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        # ユーザー情報を取得し、パスワードを検証
        user = get_user(email)
        if user and bcrypt.check_password_hash(user["password"], password):
            # ログイン成功: セッションにユーザー情報を保存
            session["user"] = email
            flash("ログイン成功", "success")
            return redirect(url_for("index"))
        else:
            # ログイン失敗: エラーメッセージを表示
            flash("メールアドレスまたはパスワードが違います", "danger")

    return render_template("login.html")

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    """
    新規ユーザー登録処理
    
    GET: 登録フォームを表示
    POST: ユーザー登録を実行
    """
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        # 既存ユーザーの重複チェック
        if get_user(email):
            flash("このメールアドレスは既に登録されています", "danger")
        else:
            # 新規ユーザーを登録
            create_user(email, password)
            flash("登録成功！ログインしてください", "success")
            return redirect(url_for("auth.login"))

    return render_template("register.html")

@auth_bp.route("/logout")
def logout():
    """
    ユーザーログアウト処理
    
    セッションからユーザー情報を削除し、ログイン画面にリダイレクト
    """
    session.pop("user", None)  # セッションからユーザー情報を削除
    flash("ログアウトしました", "info")
    return redirect(url_for("auth.login"))


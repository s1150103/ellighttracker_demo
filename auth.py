from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from google.cloud import datastore
from flask_bcrypt import Bcrypt
import os

bcrypt = Bcrypt()
auth_bp = Blueprint("auth", __name__)  # ✅ Blueprint を正しく定義

# Google Cloud Datastore クライアント
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/your-service-account.json"
client = datastore.Client()

# ユーザーデータを Datastore に保存
def create_user(email, password):
    key = client.key("User", email)
    entity = datastore.Entity(key)
    entity["email"] = email
    entity["password"] = bcrypt.generate_password_hash(password).decode('utf-8')
    client.put(entity)

# ユーザーを取得
def get_user(email):
    key = client.key("User", email)
    return client.get(key)

# ログイン処理
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        user = get_user(email)
        if user and bcrypt.check_password_hash(user["password"], password):
            session["user"] = email
            flash("ログイン成功", "success")
            return redirect(url_for("index"))  # ✅ Blueprint なしの場合は "index"
        else:
            flash("メールアドレスまたはパスワードが違います", "danger")

    return render_template("login.html")

# 新規会員登録処理
@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        if get_user(email):
            flash("このメールアドレスは既に登録されています", "danger")
        else:
            create_user(email, password)
            flash("登録成功！ログインしてください", "success")
            return redirect(url_for("auth.login"))  # ✅ Blueprint のリダイレクトは "auth.login"

    return render_template("register.html")

# ログアウト処理
@auth_bp.route("/logout")
def logout():
    session.pop("user", None)
    flash("ログアウトしました", "info")
    return redirect(url_for("auth.login"))  # ✅ ログアウト後はログイン画面へ


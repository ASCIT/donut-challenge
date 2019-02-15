from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.update(
    DEBUG = True,
    STATIC_FOLDER = "static",
    UPLOAD_FOLDER = "media",
    SECRET_KEY = "1234567890qwertyuiopasdfghjklzxcvbnm",
    SQLALCHEMY_DATABASE_URI = "sqlite:///donut_challenge.sqlite",
    SQLALCHEMY_TRACK_MODIFICATIONS = False,

    USER_APP_NAME = "Donut Challenge",
    USER_ENABLE_EMAIL = False,
    USER_ENABLE_USERNAME = True,
)
db = SQLAlchemy(app)

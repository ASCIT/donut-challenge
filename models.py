from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_user import UserMixin

from app import db

class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer(), primary_key=True)
    active = db.Column(db.Boolean(), nullable=False, server_default="t")
    username = db.Column(db.String(128, collation="NOCASE"), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    songs = db.relationship("Song", backref="user", lazy=True)

class Song(db.Model):
    __tablename__ = "songs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

db.create_all()

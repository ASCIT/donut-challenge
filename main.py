from flask import Flask, render_template, render_template_string, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_user import current_user, UserManager, login_required
from werkzeug import secure_filename

from app import app, db
from models import User, Song

import glob
import os

user_manager = UserManager(app, db, User)


def song_id_to_fn(song_id, add_folder=True):
    if add_folder:
        return os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(str(song_id)+".wav"))
    return secure_filename(str(song_id)+".wav")

@app.route("/")
def index():
    songs = []
    for filename in glob.glob(os.path.join(app.config["STATIC_FOLDER"], "music", "*")):
        name = os.path.splitext(os.path.basename(filename))[0]
        songs.append((name, filename))
    if current_user.is_authenticated:
        for song in current_user.songs:
            songs.append((song.title, "/uploads/"+song_id_to_fn(song.id, False)))
    return render_template("index.html", songs=songs)

@app.route("/upload_wav", methods=["POST"])
@login_required
def upload_wav():
    audio = request.files["audio"]
    title = request.form["title"]
    song = Song(title=title)
    current_user.songs.append(song)
    db.session.add(song)
    db.session.add(current_user)
    db.session.commit()
    audio.save(song_id_to_fn(song.id))
    return jsonify(success=True)

@app.route("/uploads/<fn>")
def get_file(fn):
    return send_from_directory(app.config["UPLOAD_FOLDER"], fn)

# Donny the Dot game
(donut challenge)

### Instructions:
To spin up the server <code>cd</code> into this dir and run:
```
virtualenv env
source env/bin/activate
pip -r install requirements.txt
python app.py
```


### NOTE:
I realize I didn't use python flask as it should be used as a backend, mostly because halfway through creating the game I decided I didn't need a backend and just created a simple front-end game. But since flask was already part of my project, I didn't bother to take it out.

Original repo (with commit history and such): https://github.com/kushaltirumala/flask_music_player

### Things to fix:
- Weird OSError: broken pipe that doesn't affect the game, and doesn't happen for any given reason (I didn't know how to fix it).

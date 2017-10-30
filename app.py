from flask import Flask, render_template, make_response
import os
import uuid


app = Flask(__name__)


port = int(os.getenv('PORT', 5000))

@app.route('/')
def index():
	user_id = str(uuid.uuid4())
	resp = make_response(render_template('index.html'))
	resp.set_cookie('user_id', user_id)
	return resp

@app.route('/start_game')
def start_game():
	return render_template('main_game.html')

if __name__ == '__main__':
   	app.run(port=port, debug = False)
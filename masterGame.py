import Monster
import Character
import random
import json
from game import *
from flask import Flask, g, jsonify, render_template, request
from werkzeug.utils import find_modules, import_string
app = Flask(__name__)

class MasterGame:

    def __init__(self, character):
        self.character = character
        self.monster = None
        self.win = 0
        self.lose = 0
        self.curmonster = ''
        self.game = None
        self.marketInventory = ['potion', '' ,'Novice Wizard Hat', \
        'Eye of beholder', 'Novice Staff', 'Wizard Staff', '', '', '', '','', '', '']

    # Decide which monster to defeat and to create a game
    def fightMonster(self):
        self.curmonster = self.getMonsterName()
        stats = self.getMonsterStats(self.curmonster)
        self.monster = Monster.Monster(self.curmonster, stats[0], stats[1], stats[2])
        toMove = 0
        self.game = Game(self.character, self.monster, toMove)

    # Determine monster name by random
    def getMonsterName(self):
        if(self.win == 0):
            return 'Wondering Child'
        i = random.randint(1, 4)
        arr = ['Forgotten doll', 'Demon', 'Wondering Child', \
               'Bandit', 'Shopkeeper']
        return arr[i]

    # Attack, defense, health
    # Get stats depending on monster name
    def getMonsterStats(self, monsterName):
        if(monsterName == 'Forgotten doll'):
            return (20, 10, 50)
        elif(monsterName == 'Demon'):
            return (50, 90, 300)
        elif(monsterName == 'Wondering Child'):
            return (0, 0, 30)
        elif(monsterName == 'Bandit'):
            return (30, 30, 100)
        elif(monsterName == 'Shopkeeper'):
            return (15, 15, 40)

# Render index
@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')

# Render town
@app.route('/town.html')
def town():
    return render_template('town.html')

# Render fight
@app.route('/fight.html')
def fight():
    curGame.fightMonster()
    return render_template('fight.html')

# Render market
@app.route('/market.html')
def market():
    return render_template('market.html')

# Make the game object attack monster and attack player
@app.route('/_attack')
def attack():
    curGame.game.makeMove('attack')
    return 'done'

# Make the game object heal player + attack player
@app.route('/_potion')
def heal():
    curGame.game.makeMove('potion')
    return 'done'

# Not implmented
@app.route('/_run')
def run():
    curGame.game.makeMove('run')
    curGame.game = None
    return 'done'

# Update revelent char info to be parse in JS
@app.route('/_getCharInfo')
def charInfo():
    healthstr = str(curGame.character.health) + '/' + str(curGame.character.maxHealth)
    return jsonify(name = curGame.character.name, \
                health=healthstr, \
                attack = curGame.character.attack, \
                defense = curGame.character.defense, \
                gold = curGame.character.money, \
                kills = curGame.win, \
                potion = curGame.character.potions)

# Check on alive/dead status and decide on loot
@app.route('/_status')
def statInfo():
    if curGame.character.checkAlive() == False:
        curGame.character.health = curGame.character.maxHealth
        curGame.character.gold = 0
        curGame.lose += 1
        return jsonify(status = 'Lost', \
                       gold = 0, \
                       item = '', \
                       potion = 0)
    elif(curGame.monster.checkAlive() == False):
        gold = random.randint(10, 100)
        index = random.randint(1, 10)
        potion = random.randint(0, 2)
        curGame.win += 1
        curGame.character.getLoot(gold, curGame.marketInventory[index], potion)
        return jsonify(status = 'Win', \
                       gold = gold, \
                       item = curGame.marketInventory[index], \
                       potion = potion)
    else:
        return jsonify(status = 'ongoing', \
                       gold = 0, \
                       item = '', \
                       potion = 0)

# Get HP, name, potion info from the current game
@app.route('/_getHp')
def hpInfo():
    healthstr = str(curGame.character.health) + '/' + str(curGame.character.maxHealth)
    mhealthstr = str(curGame.monster.health) + '/' + str(curGame.monster.maxHealth)
    return jsonify(playerHealth = healthstr, \
                   monsterHealth = mhealthstr, \
                   monsterName = curGame.curmonster, \
                   name = curGame.character.name, \
                   potion = curGame.character.potions)

# Buying function from market
@app.route('/_buy', methods = ['POST'])
def buy():
    jsdata = request.form['itemType']
    if(jsdata == 'buyPotion'):
        if(curGame.character.money >= 20):
            curGame.character.money -= 20
            curGame.character.potions += 1
    elif(jsdata == 'buyNoviceHat'):
        if(curGame.character.money >= 100):
            curGame.character.money -= 100
            curGame.character.getLoot(0, 'Novice Wizard Hat', 0)
    elif(jsdata == 'buyEyeHat'):
        if(curGame.character.money >= 500):
            curGame.character.money -= 500
            curGame.character.getLoot(0, 'Eye of beholder', 0)
    elif(jsdata == 'buyNoviceStaff'):
        if(curGame.character.money >= 200):
            curGame.character.money -= 200
            curGame.character.getLoot(0, 'Novice Staff', 0)
    elif(jsdata == 'buyWizardStaff'):
        if(curGame.character.money >= 500):
            curGame.character.money -= 500
            curGame.character.getLoot(0, 'Wizard Staff', 0)
    return jsonify()

# Dump inventory to be parsed in JS
@app.route('/_inventory')
def getInventory():
    return json.dumps(curGame.character.inventory);

# Equips player with given item
@app.route('/_equip', methods = ['POST'])
def equip():
    jsdata = request.form['itemType']
    if(jsdata == 'NoviceWizard'):
        curGame.character.arm('hat', 'Novice Wizard Hat')
    elif(jsdata == 'Eyeof'):
        curGame.character.arm('hat', 'Eye of beholder')
    elif(jsdata == 'NoviceStaff'):
        curGame.character.arm('weapon', 'Novice Staff')
    elif(jsdata == 'WizardStaff'):
        curGame.character.arm('weapon', 'Wizard Staff')
    return 'done'

if __name__ == '__main__':
    hero = Character.Character('Hero')
    curGame = MasterGame(hero)
    app.static_folder = 'static'
    app.run()

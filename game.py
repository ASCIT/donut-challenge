import Monster
import Character


class Game:

    def __init__(self, character, monster, toMove):
        self.character = character
        self.monster = monster
        # toMove 1 = AI
        # 0 = player
        self.toMove = toMove
        # self.result =


    def makeMove(self, action):
        amount = self.determine_amount()
        if(self.toMove == 1):
            self.character.damaged(amount)
            self.toMove = 0
        elif(self.toMove == 0):
            if(action == 'potion'):
                self.character.heal(20)
            elif(action == 'attack'):
                self.monster.damaged(amount)
            elif(action == 'run'):
                self.end('draw')
            self.toMove = 1
            self.makeMove('anything')

    def end(self, string):
        return string

    def determine_amount(self):
        if(self.toMove == 1):
            amount = self.monster.attack - self.character.defense
        else:
            amount = self.character.attack - self.monster.defense
        if(amount < 0):
            return 0
        return amount

    def play(self):
        return false

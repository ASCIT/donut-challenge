class Monster:

    def __init__(self, name, attack, defense, maxHealth):
        self.name = name
        self.attack = attack
        self.defense = defense

        self.health = maxHealth
        self.maxHealth = maxHealth

    def damaged(self, damage):
        self.health -= damage

    def checkAlive(self):
        if (self.health > 0):
            return True
        return False

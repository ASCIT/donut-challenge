class Character:

    def __init__(self, name):
        self.name = name
        self.attack = 10
        self.defense = 10
        self.armAtt = 0
        self.armDef = 0
        self.weapAtt = 0
        self.baseAtt = 10
        self.baseDef = 10
        self.hat = ''
        self.weapon = ''
        self.shield = ''

        self.health = 50
        self.maxHealth = 50
        self.potions = 0
        self.money = 0
        self.inventory = []
        self.inventoryAmount = 0

    # For monster damaging
    def damaged(self, damage):
        self.health -= damage

    # For potion use
    def heal(self, heal):
        self.health += heal
        if self.health > self.maxHealth:
            self.health = self.maxHealth
        self.potions -=1

    # Check if player is still alive
    def checkAlive(self):
        if (self.health > 0):
            return True
        return False

    # Put loot into potion and inventory
    def getLoot(self, amount, item, potion):
        self.money += amount
        self.potions += potion
        if(item != ''):
            self.inventory.append(item)
            self.inventoryAmount += 1

    # Dump all the current inventory to MasterGame
    def getInventory(self):
        return self.inventory

    # Update current stats
    def updateStat(self):
        if(self.hat == 'Novice Wizard Hat'):
            self.armAtt = 4
            self.armDef = 5
        if(self.hat == 'Eye of beholder'):
            self.armAtt = 10
            self.armDef = 9
        if(self.weapon == 'Novice Staff'):
            self.weapAtt = 10
        if(self.weapon == 'Wizard Staff'):
            self.weapAtt = 20
        if(self.shield == 'Old Shield'):
            self.armDef += 5
        if(self.shield == 'Magical Shield'):
            self.armDef += 10
        self.attack = self.armAtt + self.baseAtt + self.weapAtt
        self.defense = self.armDef + self.baseDef

    # When the user wants to arm something,
    # first determine arm type, and disarm appropriately.
    # Next, arm it
    # We then update the current stats
    # If the user was not armed prior, we update inventory.
    def arm(self, armType, item):
        itemLocation = 0
        replace = False
        for curitem in self.inventory:
            if(curitem == item):
                break
            itemLocation += 1
        if(armType == 'weapon'):
            if(self.weapon != ''):
                self.inventory[itemLocation] = self.weapon
                replace = True
            self.weapon = item
        elif(armType == 'shield'):
            if(self.shield != ''):
                self.inventory[itemLocation] = self.shield
                replace = True
            self.shield = item
        elif(armType == 'hat'):
            if(self.hat != ''):
                self.inventory[itemLocation] = self.hat
                replace = True
            self.hat = item
        if (replace == False):
            del self.inventory[itemLocation]
            self.inventoryAmount -= 1
        self.updateStat()

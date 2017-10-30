
document.addEventListener('DOMContentLoaded', function() {
    getInfo();
    getInventoryJS();
}, false);

// Update current inventory by creating tables dynamically.
function getInventoryJS()
{
  var curTable = document.getElementById('inventoryTable');
  $.getJSON($SCRIPT_ROOT + '/_inventory', {
      }, function(data) {
        console.log(data);
        console.log(data.length);
        var oldRows = curTable.rows.length;
        for(var i = 0; i<oldRows-1; i++)
        {
          curTable.deleteRow(1);
        }
        for(var i = 0; i<data.length; i++)
        {
          var thisRow = curTable.insertRow(1);
          var cell1 = thisRow.insertCell(0);
          var cell2 = thisRow.insertCell(1);
          cell1.innerHTML = data[i];
          var item = data[i].toString()
          console.log(item);
          var res = item.split(" ");
          cell2.innerHTML = '<button id='+ res[0] + res[1] +'>Equip</button>';
          document.getElementById(res[0] + res[1]).addEventListener("click", equip);
        }
      });
      getInfo();
          //window.setTimeout(listen, 1000);
}

// Update stats
function getInfo()
{
  $.getJSON($SCRIPT_ROOT + '/_getCharInfo', {
      }, function(data) {
        $('#name').text(data.name);
        $('#health').text(data.health);
        $('#attack').text(data.attack);
        $('#defense').text(data.defense);
        $('#gold').text(data.gold);
        $('#kills').text(data.kills);
        $('#potions').text(data.potion);
      });
}

// Called on when 'equip' button is clicked.
function equip(e){
  var info = e.toElement;
  var id = info.id;
  $.ajax({
    url: $SCRIPT_ROOT+'/_equip',
    type: 'POST',
    data:{itemType: id}
  });
  getInventoryJS();
};

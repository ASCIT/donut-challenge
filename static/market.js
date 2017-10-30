// Setting listener for when user clicks on buying any items
document.getElementById("buyPotion").addEventListener("click", buy);
document.getElementById("buyNoviceHat").addEventListener("click", buy);
document.getElementById("buyEyeHat").addEventListener("click", buy);
document.getElementById("buyNoviceStaff").addEventListener("click", buy);
document.getElementById("buyWizardStaff").addEventListener("click", buy);

// This function will tell the backend to purchase things
function buy(e){
  var info = e.toElement;
  var id = info.id;
  console.log(id);
  console.log('buyyyy');
  $.ajax({
    url: $SCRIPT_ROOT+'/_buy',
    type: 'POST',
    data:{itemType: id}
  });
  // Update current inventory and gold count
  getInfo();
  getInventoryJS()
};

// Show current items and gold once the page loads
document.addEventListener('DOMContentLoaded', function() {
    getInfo();
    getInventoryJS();
    document.addEventListener("load",function(e){});
}, false);

// Asks the backend to dump the player's inventory
// After that, delete the rows that was there, and
// dynamicallt recreate the current inventory table
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
          cell1.innerHTML = data[i];
          console.log(data[i]);
          console.log(cell1);
        }
      });

}

// Receive gold information
function getInfo(){
  $.getJSON($SCRIPT_ROOT + '/_getCharInfo', {
      }, function(data) {
        $('#gold').text(data.gold);
      });
}

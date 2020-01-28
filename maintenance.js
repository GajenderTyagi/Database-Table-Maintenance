
function maintenance() {
  pjs.defineDisplay("display", "maintenance.json");

  while (!btnExit) {
    loadGrid();
    display.main.execute();
    if (btnAdd) addRecord();
    else processGrid();
  }

  // Load current set of records
  function loadGrid() {
    var sql = "SELECT productLine, textDescription FROM productlines";
    display.grid.replaceRecords(pjs.query(sql));
  }

  // Process any interaction with the grid
  function processGrid() {
    display.grid.readChanged();
    if (!pjs.endOfData()) {
      if (iconDelete) deleteRecord(productLine);
      else if (iconEdit) editDetail(productLine);
      else if (iconView) viewDetail(productLine);
    }
  }

  // Prompt to delete and then delete the record
  function deleteRecord(key_productLine) {
    display.delete.execute();
    if (btnYes) {
      try {
        pjs.query("DELETE FROM productlines WHERE productLine = ? ", key_productLine);
      }
      catch (err) {
        displayMessage("Product line " + key_productLine + " can not be deleted because it has products assigned.");
      }
    }
  }

  // Allow user to update a record
  function editDetail(key_productLine) {
    protectDescription = false;
    protectProductLine = true;
    var record = pjs.query("SELECT productLine, textDescription FROM productlines WHERE productLine = ? limit 1", key_productLine)[0];
    pjs.setFields(record);
    display.details.execute();
    if (btnCancel) return true;

    var fieldsToUpdate = {
      textDescription: textDescription
    }
    pjs.query("UPDATE productlines SET ? WHERE productLine = ?", [fieldsToUpdate, key_productLine]);
  }

  // Show data to the user
  function viewDetail(key_productLine) {
    protectDescription = true;
    protectProductLine = true;
    var record = pjs.query("SELECT productLine, textDescription FROM productlines WHERE productLine = ? limit 1", key_productLine)[0];
    pjs.setFields(record);
    display.details.execute();
  }

  // Allow user to add a new record
  function addRecord() {
    protectDescription = false;
    protectProductLine = false;
    productLine = '';
    textDescription = '';
    display.details.execute();
    if (btnCancel)  return;
    if (recordExists(productLine)) {
      displayMessage("Record for " + key_productLine + " already exists.");
      return;
    }
    pjs.query("INSERT INTO productlines SET ?", {
      productLine: productLine,
      textDescription: textDescription
    });
  }

  // Check if a record exists
  function recordExists(key_productLine) {
    var data = pjs.query("SELECT count(productLine) as count FROM productlines WHERE productLine = ? limit 1", key_productLine);
    return (data.count > 0);
  }

  // Display a message
  function displayMessage(message) {
    display.message.execute({ msgText: message });
  }

}

module.exports.default = maintenance;

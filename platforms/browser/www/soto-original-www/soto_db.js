/** Initializes the local SOTO SQL-Lite Database Tables
* @deprecated
*/
 function init_db_r1() {
  db.transaction(
      function (transaction) {
          transaction.executeSql(
              'CREATE TABLE IF NOT EXISTS studentObservations ' +
              ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
              ' subjectName TEXT NOT NULL, ' +
              ' classLocation TEXT NOT NULL, ' +
              ' observationDate DATE NOT NULL, ' +
              ' activityDescription TEXT NOT NULL );'
          );
      }
  );

  db.transaction(
      function (transaction) {
          transaction.executeSql(
              'CREATE TABLE IF NOT EXISTS intervalData ' +
              ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
      ' soid INT NOT NULL, ' +
              ' interval INT NOT NULL, ' +
              ' target TEXT NOT NULL, ' +
              ' onTask TEXT NOT NULL, ' +
              ' OTM BOOLEAN NOT NULL, ' +
              ' OTV BOOLEAN NOT NULL, ' +
              ' OTP BOOLEAN NOT NULL );'
          );
      }
  );
}

/** Initializes the local SOTO SQL-Lite Database Tables
*
*/
function init_db() {
  var strSql;

  // For development and testing purposes
  tctExecuteSql('DROP TABLE Student');
  tctExecuteSql('DROP TABLE Observation');
  tctExecuteSql('DROP TABLE IntervalData');

  strSql = 'CREATE TABLE IF NOT EXISTS Student ' +
              ' (StudentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
              ' FirstName TEXT NOT NULL, ' +
              ' LastName TEXT NOT NULL, ' +
              ' DateOfBirth DATE NULL, ' +
              ' DateAdded DATE NOT NULL DEFAULT CURRENT_DATE);'
  tctExecuteSql(strSql);

  strSql = 'CREATE TABLE IF NOT EXISTS Observation ' +
              ' (ObservationId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
              ' StudentId INTEGER NOT NULL, ' +
              ' Location TEXT NOT NULL, ' +
              ' DateObservation DATE NOT NULL DEFAULT CURRENT_DATE, ' +
              ' ActivityDescription TEXT NOT NULL );'
  tctExecuteSql(strSql);

  strSql = 'CREATE TABLE IF NOT EXISTS IntervalData ' +
           ' (IntervalDataId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
           ' ObservationId INT NOT NULL, ' +
           ' IntervalNumber INT NOT NULL, ' +
           ' Target TEXT NOT NULL, ' +
           ' OnTask TEXT NOT NULL, ' +
           ' OffTask_1 BOOLEAN NOT NULL, ' +
           ' OffTask_2 BOOLEAN NOT NULL, ' +
           ' OffTask_3 BOOLEAN NOT NULL, ' +
           ' OffTask_4 BOOLEAN NOT NULL, ' +
           ' OffTask_5 BOOLEAN NOT NULL, ' +
           ' OffTask_6 BOOLEAN NOT NULL );'
  tctExecuteSql(strSql);
}

function migrate_r1_to_r2() {
  db.transaction(
    function (transaction) {
      transaction.executeSql('SELECT * FROM studentObservations;',[],
        function (transaction, result) {
          for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows.item(i);
            var studentName = row.subjectName;
            var date = new Date(Date.parse(row.observationDate));
            var minutes = date.getUTCMinutes().toString();
            if (minutes.length == 1) minutes = "0" + minutes;
            var shortDate = date.getMonth() + 1 + "/" + date.getDate() + "/" +
                            date.getFullYear() + " at " + date.getHours() +
                            ":" +  minutes;

            db.transaction (function (tx) {
              tx.executeSql('INSERT INTO Student (FirstName, LastName, DateAdded) VALUES (?,?,?)',
                            [studentName, studentName, shortDate],
                            function (transaction, resultSet) {
                              if (!resultSet.rowsAffected) {
                                 // Previous insert failed. Bail.
                                 alert('No rows affected!');
                                 return false;
                              }
                              else {
                                return resultSet.insertId
                              }
                           });



            var classLocation = row.classLocation;
          });
        } //end FOR Loop
      },
        errorHandler
      ); //end executeSQL
    }
  );   //end db.transaction
}


/** Helper function to execute a SQL transaction
 * @param {string} strSql - SQL statement to execute
 */
function tctExecuteSql(strSql){
  console.table(strSql);
  console.log(strSql);
  db.transaction(function (transaction) {
          transaction.executeSql(strSql);
  });
}

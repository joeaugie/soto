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

  var rstStudentObservations;
  var qryStudentObservations = function (tx, results) {
    tx.executeSql('SELECT * FROM studentObservations;', [], function (tx, rs) {
      rstStudentObservations = rs;
      return procStudentObservations(tx);
    });
  };

  var procStudentObservations = function (tx) {
    for (var i = 0; i < rstStudentObservations.rows.length; i++) {
      var row = rstStudentObservations.rows.item(i);
      var studentName = row.subjectName;
      var classLocation = row.classLocation;
      var activityDescription = row.activityDescription;
      var date = new Date(Date.parse(row.observationDate));
      var minutes = date.getUTCMinutes().toString();
      if (minutes.length == 1) minutes = "0" + minutes;
      var shortDate = date.getMonth() + 1 + "/" + date.getDate() + "/" +
        date.getFullYear() + " at " + date.getHours() +
        ":" +  minutes;

      var newStudentId;
      tx.executeSql('INSERT INTO Student (FirstName, LastName, DateAdded) VALUES (?,?,?)',
        [studentName, studentName, shortDate], function(tx, rs) {
          newStudentId = rs.insertId;
          return true;
        });

      var newObservationId;
      tx.executeSql('INSERT INTO Observation (StudentId, Location, DateObservation, ActivityDescription) VALUES (?,?,?,?)',
        [newStudentId, studentName, classLocation, activityDescription], function(tx, rs) {
        newObservationId = rs.insertId;
        return true;
      });

      var rstIntervalData;
      var qryIntervalData = function (tx, results) {
        tx.executeSql('SELECT * FROM intervalData WHERE soid = ?;', [row.id], function (tx, rs) {
          rstIntervalData = rs;
          return procIntervalData(tx);
        });
      };

      var procIntervalData = function (tx) {
        for (var i = 0; i < rstIntervalData.rows.length; i++) {
          var recIntervalData = rstIntervalData.rows.item(i);

          tx.executeSql('INSERT INTO IntervalData (ObservationId, IntervalNumber, Target, OnTask, OffTask_1, OffTask_2, OffTask_3) VALUES (?,?,?, ?, ?, ?, ?)',
            [newObservationId, rstIntervalData.interval, rstIntervalData.target, rstIntervalData.onTask, rstIntervalData.OTM, rstIntervalData.OTV, rstIntervalData.OTP], function(tx, rs) {
              return true;
          });
        }
      };
    }
  };
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

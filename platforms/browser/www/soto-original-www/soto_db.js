/** Initializes the local SOTO SQL-Lite Database Tables
* @deprecated
*/
function init_db_r1() {
   tctExecuteSql('CREATE TABLE IF NOT EXISTS studentObservations ' +
    ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
    ' subjectName TEXT NOT NULL, ' +
    ' classLocation TEXT NOT NULL, ' +
    ' observationDate DATE NOT NULL, ' +
    ' activityDescription TEXT NOT NULL );');

    tctExecuteSql('CREATE TABLE IF NOT EXISTS intervalData ' +
      ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
      ' soid INT NOT NULL, ' +
      ' interval INT NOT NULL, ' +
      ' target TEXT NOT NULL, ' +
      ' onTask TEXT NOT NULL, ' +
      ' OTM BOOLEAN NOT NULL, ' +
      ' OTV BOOLEAN NOT NULL, ' +
      ' OTP BOOLEAN NOT NULL );');
}

/** Initializes the local SOTO SQL-Lite Database Tables
*
*/
function init_db() {
  var strSql;

  // For development and testing purposes
  tctExecuteSql('DROP TABLE Student');
  tctExecuteSql('DROP TABLE Observation');
  tctExecuteSql('DROP TABLE Interval');

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

  strSql = 'CREATE TABLE IF NOT EXISTS Interval ' +
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
  console.log("begin migrate_r1_to_r2()");

  var qryStudentObservations = function (tx, rs) {
    console.log("entered qryStudentObservations()");
    tx.executeSql('SELECT * FROM studentObservations;', [], function (tx, rs) {
      rstStudentObservations = rs;
      return migrate_StudentObservations(tx, rstStudentObservations);
    });
  };

  var migrate_StudentObservations = function (tx, rstStudentObservations){
    console.log("entered migrate_StudentObservations()");
    for (var i = 0; i < rstStudentObservations.rows.length; i++) {
      var r1_obsv = rstStudentObservations.rows.item(i);
        insert_NewStudent (tx, r1_obsv, insert_NewObservation);
      }
  }
  var insert_NewStudent = function (tx, r1_obsv, after_InsertNewStudent) {
    console.log("entered insert_NewStudent(" + r1_obsv.subjectName + ")");
    var newStudentId;
    var studentName = r1_obsv.subjectName;
    var date = new Date(Date.parse(r1_obsv.observationDate));
    var minutes = date.getUTCMinutes().toString();
    if (minutes.length == 1) minutes = "0" + minutes;
    var shortDate = date.getMonth() + 1 + "/" + date.getDate() + "/" +
      date.getFullYear() + " at " + date.getHours() +
      ":" +  minutes;

    tx.executeSql('INSERT INTO Student (FirstName, LastName, DateAdded) VALUES (?,?,?)',
      [studentName, studentName, shortDate], function(tx, rs) {
        console.log("callback [insert into student] newStudentId: " + rs.insertId);
        newStudentId = rs.insertId;
        return after_InsertNewStudent(tx, newStudentId, r1_obsv, migrate_IntervalData);
      });
    }


  var insert_NewObservation = function (tx, newStudentId, r1_obsv, after_InsertNewObservation) {
    console.log("entered insert_NewObservation()");
    var newObservationId;
    var classLocation = r1_obsv.classLocation;
    var activityDescription = r1_obsv.activityDescription;
    var date = new Date(Date.parse(r1_obsv.observationDate));
    var minutes = date.getUTCMinutes().toString();
    if (minutes.length == 1) minutes = "0" + minutes;
    var shortDate = date.getMonth() + 1 + "/" + date.getDate() + "/" +
      date.getFullYear() + " at " + date.getHours() +
      ":" +  minutes;

    tx.executeSql('INSERT INTO Observation (StudentId, Location, DateObservation, ActivityDescription) VALUES (?,?,?,?)',
      [newStudentId, classLocation, shortDate, activityDescription], function(tx, rs) {
      newObservationId = rs.insertId;
      return after_InsertNewObservation(tx, newObservationId, r1_obsv);
    });
  };

  var migrate_IntervalData = function (tx, newObservationId, r1_obsv) {
    console.log("entered migrate_IntervalData()");
    var rstIntervalData;

    /*
    var qryIntervalData = function (tx, results) {
      tx.executeSql('SELECT * FROM intervalData WHERE soid = ?;', [r1_obsv.id], function (tx, rs) {
        rstIntervalData = rs;
        return procIntervalData(tx);
      });
    */
    return true;
    };

  var insert_NewInterval = function (tx) {
    for (var i = 0; i < rstIntervalData.rows.length; i++) {
      var recIntervalData = rstIntervalData.rows.item(i);

      tx.executeSql('INSERT INTO Interval (ObservationId, IntervalNumber, Target, OnTask, OffTask_1, OffTask_2, OffTask_3) VALUES (?,?,?, ?, ?, ?, ?)',
        [newObservationId, rstIntervalData.interval, rstIntervalData.target, rstIntervalData.onTask, rstIntervalData.OTM, rstIntervalData.OTV, rstIntervalData.OTP], function(tx, rs) {
          return true;
      });
    }
  };

  db.transaction(qryStudentObservations);
  console.log("end   migrate_r1_to_r2()");
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

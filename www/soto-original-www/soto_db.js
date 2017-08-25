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
              ' OtCode1 TEXT NULL, ' +
              ' OtCode2 TEXT NULL, ' +
              ' OtCode3 TEXT NULL, ' +
              ' OtCode4 TEXT NULL, ' +
              ' OtCode5 TEXT NULL, ' +
              ' OtCode6 TEXT NULL, ' +
              ' ActivityDescription TEXT NOT NULL );'
  tctExecuteSql(strSql);

  strSql = 'CREATE TABLE IF NOT EXISTS Interval ' +
           ' (IntervalDataId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
           ' ObservationId INT NOT NULL, ' +
           ' IntervalNumber INT NOT NULL, ' +
           ' Target TEXT NOT NULL, ' +
           ' OnTask TEXT NOT NULL, ' +
           ' OffTask_1 BOOLEAN NULL, ' +
           ' OffTask_2 BOOLEAN NULL, ' +
           ' OffTask_3 BOOLEAN NULL, ' +
           ' OffTask_4 BOOLEAN NULL, ' +
           ' OffTask_5 BOOLEAN NULL, ' +
           ' OffTask_6 BOOLEAN NULL );'
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
      var recStudent = new Student();
      recStudent.mapR1Student(r1_obsv);
      insert_NewStudent (tx, recStudent, insert_NewObservation, r1_obsv);
    }
    console.log("finished migrate_StudentObservations()");
  };

  var insert_NewStudent = function (tx, student, after_InsertNewStudent, r1_obsv) {
    console.log("entered insert_NewStudent()");
    student.printStudent();
    tx.executeSql('INSERT INTO Student (FirstName, LastName, DateAdded) VALUES (?,?,?)',
      [student.FirstName, student.LastName, student.DateAdded], function(tx, rs) {
      console.log("callback [insert into student] newStudentId: " + rs.insertId);
      student.StudentId = rs.insertId;
      return after_InsertNewStudent(tx, student, r1_obsv, qryIntervalData);
    });
  };

  var insert_NewObservation = function (tx, student, r1_obsv, after_InsertNewObservation) {
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

    tx.executeSql('INSERT INTO Observation (StudentId, Location, DateObservation, ActivityDescription, OtCode1, OtCode2, OtCode3) VALUES (?,?,?,?,?,?,?)',
      [student.StudentId, classLocation, shortDate, activityDescription, 'OTM', 'OTV', 'OTP'], function(tx, rs) {
      newObservationId = rs.insertId;
      return after_InsertNewObservation(tx, newObservationId, r1_obsv);
    });
  };

  var qryIntervalData = function (tx, newObservationId, r1_obsv) {
    console.log("entered qryIntervalData(" + r1_obsv.id + ")");
    tx.executeSql('SELECT * FROM intervalData WHERE soid = ?;', [r1_obsv.id], function (tx, rs) {
      console.log("callback [select from intervalData]");
      return migrate_IntervalData(tx, newObservationId, rs);
    });
  };

  var migrate_IntervalData = function (tx, newObservationId, rstIntervalData){
    console.log("entered migrate_IntervalData()");
    for (var i = 0; i < rstIntervalData.rows.length; i++) {
      var r1_interval = rstIntervalData.rows.item(i);
      console.log("inserting interval record " + i + ", Interval #: " + r1_interval.interval + ", newObservationId: " + newObservationId)
      insert_NewInterval (tx, newObservationId, r1_interval);
    }
    console.log("finished migrate_IntervalData()");;
  };

  var insert_NewInterval = function (tx, newObservationId, r1_interval) {
      tx.executeSql('INSERT INTO Interval (ObservationId, IntervalNumber, Target, OnTask, OffTask_1, OffTask_2, OffTask_3) VALUES (?,?,?,?,?,?,?)',
        [newObservationId, r1_interval.interval, r1_interval.target, r1_interval.onTask, r1_interval.OTM, r1_interval.OTV, r1_interval.OTP], function(tx, rs) {
          console.log("callback [insert into Interval] insertId: " + rs.insertId);
          return true;
      });
  };

  db.transaction(qryStudentObservations, txtTransactionErrorCallback);
  console.log("end   migrate_r1_to_r2()");
}

/** Select all Students
 * @param processSelectStudents - Your callback function to handle the return of all students resultset.
 */
function qryStudents(processSelectStudents) {
  console.log("entered qryStudents()");
  db.transaction(function (tx) {
    console.log("entered getStudents()");
    tx.executeSql('SELECT * FROM Student;', [], function (tx, rs) {
      console.log("callback [select from Student]");
      return processSelectStudents(rs);
    });
  }, txtTransactionErrorCallback);
  console.log("exiting qryStudents()");
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

function txtTransactionErrorCallback(error)
{
    alert('DB TRANSACTION ERROR!  Error was '+error.message+' (Code '+error.code+')');
}

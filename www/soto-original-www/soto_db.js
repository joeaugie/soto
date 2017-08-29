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

function insert_NewStudent (tx, student, after_InsertNewStudent, r1_obsv) {
  console.log("entered insert_NewStudent()");
  student.printStudent();
  tx.executeSql('INSERT INTO Student (FirstName, LastName, DateAdded) VALUES (?,?,?)',
    [student.FirstName, student.LastName, student.DateAdded], function(tx, rs) {
    console.log("callback [insert into student] newStudentId: " + rs.insertId);
    student.StudentId = rs.insertId;
    return after_InsertNewStudent(tx, student, r1_obsv, qryIntervalData);
  });
}

function insert_NewObservation (tx, student, r1_obsv, after_InsertNewObservation) {
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
}

function insert_NewInterval (tx, newObservationId, r1_interval) {
    tx.executeSql('INSERT INTO Interval (ObservationId, IntervalNumber, Target, OnTask, OffTask_1, OffTask_2, OffTask_3) VALUES (?,?,?,?,?,?,?)',
      [newObservationId, r1_interval.interval, r1_interval.target, r1_interval.onTask, r1_interval.OTM, r1_interval.OTV, r1_interval.OTP], function(tx, rs) {
        console.log("callback [insert into Interval] insertId: " + rs.insertId);
        return true;
    });
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
  }, tctTransactionErrorCallback);
  console.log("exiting qryStudents()");
}

/** Select Observations
 * @param _studentId - Optional Integer when you want Observations for a given student id
 * @param processSelectObservations - Your callback function to handle the return of all students resultset.
 */
function qryObservations(_studentId, processSelectObservations) {
  console.log("entered qryObservations()");
  db.transaction(function (tx) {
    console.log("entered qryObservations() --> db.transaction()");
    var strSql = 'SELECT o.ObservationId, o.StudentId, o.Location, o.DateObservation, \
      o.ActivityDescription, o.OtCode1, o.OtCode2, o.OtCode3, o.OtCode4, o.OtCode5, o.OtCode6 \
      s.FirstName, s.LastName, s.DateOfBirth, s.DateAdded FROM Observation AS o INNER JOIN Student AS s ON o.StudentId = s.StudentId '
    var args = [];
    if (Number.isInteger(_studentId)) {
      strSql = strSql + 'WHERE StudentId = ?'
      args.push(_studentId);
    }
    tx.executeSql(strSql, args, function (tx, rs) {
      console.log("callback [select from Observations]");
      return processSelectObservations(rs);
    });
  }, tctTransactionErrorCallback);
  console.log("exiting qryObservations()");
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

function tctTransactionErrorCallback(error)
{
    alert('DB TRANSACTION ERROR!  Error was '+error.message+' (Code '+error.code+')');
}

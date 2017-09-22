/** Initializes the local SOTO SQL-Lite Database Tables
*
*/
function init_db() {
  var strSql;
  console.log("entered init_db()");
  // For development and testing purposes
  /*
  tctExecuteSql('DROP TABLE Student');
  tctExecuteSql('DROP TABLE Observation');
  tctExecuteSql('DROP TABLE Interval');
  */

  strSql = 'CREATE TABLE IF NOT EXISTS Student ' +
              ' (StudentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
              ' StudentName TEXT NOT NULL, ' +
              ' DateOfBirth TEXT NULL, ' +
              ' DateAdded TEXT NOT NULL DEFAULT CURRENT_DATE);'
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
              ' ObservationNotes TEXT NULL, ' +
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
           ' OffTask_6 BOOLEAN NULL,' +
           ' IntervalNotes TEXT NULL );'

  tctExecuteSql(strSql);
  console.log("exiting init_db()");
}

function insert_NewStudent (tx, student, after_InsertNewStudent) {
  console.log("entered insert_NewStudent()");
  tx.executeSql('INSERT INTO Student (StudentName, DateAdded) VALUES (?,?)',
    [student.StudentName, student.DateAdded], function(tx, rs) {
    console.log("callback [insert into student] newStudentId: " + rs.insertId);
    student.StudentId = rs.insertId;
    student.printStudent();
    console.log("  after_InsertNewStudent: " + after_InsertNewStudent);
    return after_InsertNewStudent(tx, student);
  });
}

function insert_NewObservation (tx, _observation, after_InsertNewObservation) {
  console.log("entered insert_NewObservation()");

  tx.executeSql('INSERT INTO Observation (StudentId, Location, DateObservation, \
    ActivityDescription, OtCode1, OtCode2, OtCode3) VALUES (?,?,?,?,?,?,?)',
    [_observation.Student.StudentId, _observation.Location, _observation.DateObservation,
     _observation.ActivityDescription, _observation.OtCode1, _observation.OtCode2,
     _observation.OtCode3], function(tx, rs) {
    _observation.ObservationId = rs.insertId;
    return after_InsertNewObservation(tx, _observation);
  });
}

function insert_NewInterval (tx, _interval, after_InsertNewInterval) {
    tx.executeSql('INSERT INTO Interval (ObservationId, IntervalNumber, Target, \
      OnTask, OffTask_1, OffTask_2, OffTask_3) VALUES (?,?,?,?,?,?,?)',
      [_interval.ObservationId, _interval.IntervalNumber, _interval.Target, _interval.OnTask,
        _interval.OffTask_1, _interval.OffTask_2, _interval.OffTask_3], function(tx, rs) {
        console.log("callback [insert into Interval] insertId: " + rs.insertId);
        _interval.IntervalId = rs.insertId;
        return after_InsertNewInterval(tx, _interval);
    });
}


/** Select specific or all Students
 * @param _studentId - Optional Integer when you want a specific student id.  If it is NAN then select ALL students
 * @param processSelectStudents - Your callback function to handle the return of all students resultset.
 */
function qryStudents(_studentId, processSelectStudents) {
  console.log("entered qryStudents()");
  db.transaction(function (tx) {
    console.log("executing qryStudents() --> db.transaction()");
    var strSql = "SELECT * FROM Student ";
    var args = [];
    if (Number.isInteger(_studentId)) {
      console.log("   appending _studentId WHERE criteria.");
      strSql = strSql + 'WHERE StudentId = ?';
      args.push(_studentId);
    }
    else {
      console.log("   _studentId is not a number.  Selecting all students.");
    }
    console.log("   strSql : " + strSql + ", " + args);
    tx.executeSql(strSql, args, function (tx, rs) {
      console.log("callback [select from Student]");
      return processSelectStudents(tx, rs);
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
    console.log("executing qryObservations() --> db.transaction()");
    var strSql = 'SELECT o.ObservationId, o.StudentId, o.Location, o.DateObservation, \
      o.ActivityDescription, o.OtCode1, o.OtCode2, o.OtCode3, o.OtCode4, o.OtCode5, o.OtCode6, \
      s.StudentName,s.DateOfBirth, s.DateAdded FROM Observation AS o INNER JOIN Student AS s ON o.StudentId = s.StudentId ';
    var args = [];
    if (Number.isInteger(_studentId)) {
      console.log("   appending _studentId WHERE criteria.");
      strSql = strSql + 'WHERE StudentId = ?';
      args.push(_studentId);
    }
    else {
      console.log("   _studentId is not a number.");
    }
    console.log("   strSql : " + strSql);
    tx.executeSql(strSql, args, function (tx, rs) {
      console.log("callback [select from Observations]");
      return processSelectObservations(rs);
    });
  }, tctTransactionErrorCallback);
  console.log("exiting qryObservations()");
}

function update_Student (_student) {
  console.log("executing update_Student()");
  var strSql = "UPDATE Student SET StudentName = ?, DateOfBirth = ? WHERE StudentId = ?";
  var args = [_student.StudentName, _student.DateOfBirth, _student.StudentId];
  console.log("   strSql : " + strSql + ", " + args);
//  student.printStudent();
  tctExecuteSql(strSql, args);
}



/** Helper function to execute a SQL transaction
 * @param {string} strSql - SQL statement to execute
 */
function tctExecuteSql(strSql, args){
  console.log("tctExecuteSql(): " + strSql);
  db.transaction(function (transaction) {
          transaction.executeSql(strSql, args);
  }, tctTransactionErrorCallback);
}

function tctTransactionErrorCallback(error)
{
  console.log("tctTransactionErrorCallback | error code [" + error.code + "] | error message [" + error.message + "]")
  alert('DB TRANSACTION ERROR!  Error was '+error.message+' (Code '+error.code+')');
}

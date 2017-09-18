/** Initializes the local SOTO SQL-Lite Database Tables
* @deprecated
*/
function init_db_r1() {
  console.log("entered init_db_r1()");
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
    console.log("exiting init_db_r1()");
}

function migrate_r1_to_r2() {
  console.log("entered migrate_r1_to_r2()");

  var qryStudentObservations = function (tx, rs) {
    console.log("entered qryStudentObservations()");
    tx.executeSql('SELECT * FROM studentObservations;', [], function (tx, rs) {
      rstStudentObservations = rs;
      return migrate_StudentObservations(tx, rstStudentObservations);
    });
  };
  db.transaction(qryStudentObservations, tctTransactionErrorCallback);
  console.log("exiting migrate_r1_to_r2()");
}

function migrate_StudentObservations (tx, rstStudentObservations){
  console.log("entered migrate_StudentObservations()");
  for (var o = 0; o < rstStudentObservations.rows.length; o++) {
    var r1_obsv = rstStudentObservations.rows.item(o);
    (function(r1_obsv) {
      var recStudent = new Student();
      recStudent.mapR1Student(r1_obsv);
      console.log("  processing rstStudentObservations item: " + o + " | r1_obsv.id: " + r1_obsv.id);
      insert_NewStudent (tx, recStudent, function(tx, _student){
        console.log("callback of insert_NewStudent() | StudentId: " + _student.StudentId);
        _student.printStudent();
        var recObservation = new Observation();
        recObservation.Student = _student;
        recObservation.mapR1Observation(r1_obsv);
        insert_NewObservation (tx, recObservation, function(tx, observation){
          console.log("callback of insert_NewObservation() | ObservationId: " + observation.ObservationId);
          var strSql = 'SELECT * FROM intervalData WHERE soid = ?;';
          var args = [r1_obsv.id];
          console.log('  strSql: ' + strSql + ", " + args);
          tx.executeSql(strSql, args, function (tx, rs) {
            console.log("callback [select from intervalData]");
            return migrate_IntervalData(tx, observation.ObservationId, rs);
          });
        });
      });
    })(r1_obsv);
  }
  console.log("finished migrate_StudentObservations()");
}

function process_NewStudent (tx, rstStudentObservations){
  console.log("entered migrate_StudentObservations()");
  for (var i = 0; i < rstStudentObservations.rows.length; i++) {
    var r1_obsv = rstStudentObservations.rows.item(i);
    var recStudent = new Student();
    recStudent.mapR1Student(r1_obsv);
    insert_NewStudent (tx, recStudent, insert_NewObservation, r1_obsv);
  }
  console.log("finished migrate_StudentObservations()");
}

function qryIntervalData (tx, newObservationId, r1_obsv) {
  console.log("entered qryIntervalData(" + r1_obsv.id + ")");
  tx.executeSql('SELECT * FROM intervalData WHERE soid = ?;', [r1_obsv.id], function (tx, rs) {
    console.log("callback [select from intervalData]");
    return migrate_IntervalData(tx, newObservationId, rs);
  });
}

function migrate_IntervalData (tx, newObservationId, rstIntervalData){
  console.log("entered migrate_IntervalData()");
  for (var i = 0; i < rstIntervalData.rows.length; i++) {
    var r1_interval = rstIntervalData.rows.item(i);
    (function(r1_interval) {
      console.log("inserting interval record " + i + ", Interval #: " + r1_interval.interval + ", newObservationId: " + newObservationId)
      var recInterval = new Interval();
      recInterval.ObservationId = newObservationId;
      recInterval.mapR1Interval(r1_interval);
      insert_NewInterval (tx, recInterval, function(tx, interval){
        console.log("callback of insert_NewInterval() | IntervalId: " + interval.IntervalId);
      });
    })(r1_interval);
  }
  console.log("finished migrate_IntervalData()");;
}

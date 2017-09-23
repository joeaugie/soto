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
  IS_R1_MIGRATED = true;
  localStorage.IS_R1_MIGRATED = true;
  console.log("finished migrate_IntervalData()");;
}

function InsertR1TestData(){
  tctExecuteSql("INSERT INTO studentObservations (subjectName, classLocation, observationDate, activityDescription) VALUES ('Thomas','Math','2016-09-03','Lecture');");
  tctExecuteSql("INSERT INTO studentObservations (subjectName, classLocation, observationDate, activityDescription) VALUES ('Richard','Art','2016-10-13','Hands-on drawing');");
  tctExecuteSql("INSERT INTO studentObservations (subjectName, classLocation, observationDate, activityDescription) VALUES ('Harold','Science','2016-10-27','Lecture');");
  tctExecuteSql("INSERT INTO studentObservations (subjectName, classLocation, observationDate, activityDescription) VALUES ('Jane','English','2016-12-07','Reading');");

  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,1,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,2,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,3,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,4,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,5,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,6,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,7,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,8,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,9,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,10,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,11,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,12,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,13,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,14,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,15,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,16,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,17,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,18,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,19,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (1,20,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,1,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,2,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,3,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,4,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,5,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,6,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,7,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,8,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,9,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,10,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,11,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,12,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,13,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,14,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,15,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,16,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,17,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,18,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,19,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (2,20,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,1,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,2,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,3,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,4,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,5,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,6,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,7,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,8,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,9,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,10,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,11,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,12,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,13,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,14,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,15,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,16,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,17,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,18,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,19,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (3,20,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,1,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,2,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,3,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,4,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,5,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,6,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,7,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,8,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,9,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,10,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,11,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,12,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,13,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,14,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,15,'Peer','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,16,'Subject','OFFT',1,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,17,'Subject','OFFT',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,18,'Subject','AET',0,0,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,19,'Subject','PET',1,1,0);");
  tctExecuteSql("INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (4,20,'Peer','AET',0,0,0);");

}

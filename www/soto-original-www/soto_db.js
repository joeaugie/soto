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
  strSql = 'CREATE TABLE IF NOT EXISTS Student ' +
              ' (StudentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
              ' FirstName TEXT NOT NULL, ' +
              ' LastName TEXT NOT NULL, ' +
              ' DateOfBirth DATE NOT NULL, ' +
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

function tctExecuteSql(strSql){
  console.log(strSql);
  db.transaction(function (transaction) {
          transaction.executeSql(strSql);
  });
}

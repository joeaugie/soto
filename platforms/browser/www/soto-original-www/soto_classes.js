/** Student Business Class
  * @constructor
  */
function Student (_studentId, _studentName, _dateOfBirth, _dateAdded) {
  console.log("instantiating Student");
  this.StudentId = _studentId
  this.StudentName = _studentName;
  this.DateOfBirth = _dateOfBirth;
  this.DateAdded = _dateAdded;

  this.mapR1Student = function(r1_obsv) {
    this.StudentName = r1_obsv.subjectName;
    this.DateOfBirth = null;
    var date = new Date(Date.parse(r1_obsv.observationDate));
    var minutes = date.getUTCMinutes().toString();
    if (minutes.length == 1) minutes = "0" + minutes;
    this.DateAdded = date.getMonth() + 1 + "/" + date.getDate() + "/" +
      date.getFullYear() + " at " + date.getHours() +
      ":" +  minutes;
  }

  this.mapStudent = function(rec) {
    this.StudentId = rec.StudentId;
    this.StudentName = rec.StudentName;
    this.DateOfBirth = rec.DateOfBirth;
    this.DateAdded = rec.DateAdded;
  }

  this.printStudent = function() {
    console.log("printStudent() ==> StudentId: "+ this.StudentId +" | StudentName: " + this.StudentName + " | Age: " + this.getAge() + " | Added on: " + this.DateAdded);
  }

  this.getAge = function(){
    if (!this.DateOfBirth){
      return "No DOB. Age is unknown."
    }
    else {
      var ageDifMs = Date.now() - new Date(this.DateOfBirth).getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
  }

  this.getFullName = function() {
    return this.StudentName;
  }
}

/** Observation Business Class
  * @constructor
  */
function Observation (row) {
  console.log("instantiating Observation");
  if (row){
    this.ObservationId = row.ObservationId;
    this.Student = new Student();
    this.Student.mapStudent(row);
    this.Location = row.Location;
    this.DateObservation = row.DateObservation;
    this.ActivityDescription = row.ActivityDescription;
    this.OtCode1 = row.OtCode1;
    this.OtCode2 = row.OtCode2;
    this.OtCode3 = row.OtCode3;
    this.OtCode4 = row.OtCode4;
    this.OtCode5 = row.OtCode5;
    this.OtCode6 = row.OtCode6;
  }

  this.mapR1Observation = function(r1_obsv){
    this.Location = r1_obsv.classLocation;
    this.DateObservation = r1_obsv.observationDate;
    this.ActivityDescription = r1_obsv.activityDescription;
    this.OtCode1 = 'OTM';
    this.OtCode2 = 'OTV';
    this.OtCode3 = 'OTP';
  };

  this.printObservation = function() {
    console.log("Observation recorded on: " + this.DateObservation + " at " + this.Location);
    console.log("Student: " + this.Student.StudentName);
    console.log("Age    : " + this.Student.getAge());

  }
}


/** Interval Business Class
  * @constructor
  */
function Interval (row) {
  console.log("instantiating Interval");
  if (row){
    this.IntervalId = row.IntervalId;
    this.ObservationId = row.ObservationId;
    this.IntervalNumber = row.IntervalNumber;
    this.Target = row.Target;
    this.OnTask = row.OnTask;
    this.OffTask_1 = row.OffTask_1;
    this.OffTask_2 = row.OffTask_2;
    this.OffTask_3 = row.OffTask_3;
    this.OffTask_4 = row.OffTask_4;
    this.OffTask_5 = row.OffTask_5;
    this.OffTask_6 = row.OffTask_6;
    this.IntervalNotes = row.IntervalNotes;
  }

  this.mapR1Interval = function(r1_interval){
    this.IntervalNumber = r1_interval.interval;
    this.Target = r1_interval.target;
    this.OnTask = r1_interval.onTask;
    this.OffTask_1 = r1_interval.OTM;
    this.OffTask_2 = r1_interval.OTV;
    this.OffTask_3 = r1_interval.OTP;
  };

  this.printObservation = function() {
    console.log("Observation recorded on: " + this.DateObservation + " at " + this.Location);
    console.log("Student: " + this.Student.StudentName);
    console.log("Age    : " + this.Student.getAge());

  }
}

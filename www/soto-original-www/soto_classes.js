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
  this.ObservationId = row.ObservationId;
  this.StudentId = row.StudentId;
  this.Student = new Student();
  this.Student.mapStudent(row);
  this.Location = row.Location;
  this.DateObservation = row.DateObservation;
  this.ActivityDescription;
  this.OtCode1 = row.OtCode1;
  this.OtCode2 = row.OtCode2;
  this.OtCode3 = row.OtCode3;
  this.OtCode4 = row.OtCode4;
  this.OtCode5 = row.OtCode5;
  this.OtCode6 = row.OtCode6;

  this.printObservation = function() {
    console.log("Observation recorded on: " + this.DateObservation + " at " + this.Location);
    console.log("Student: " + this.Student.StudentName);
    console.log("Age    : " + this.Student.getAge());

  }
}

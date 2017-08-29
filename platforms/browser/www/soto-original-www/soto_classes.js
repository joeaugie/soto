/** Student Business Class
  * @constructor
  */
function Student (_studentId, _firstName, _lastName, _dateOfBirth, _dateAdded) {
  console.log("constructing new Student...");
  this.StudentId = _studentId
  this.FirstName = _firstName;
  this.LastName = _lastName;
  this.DateOfBirth = _dateOfBirth;
  this.DateAdded = _dateAdded;

  this.mapR1Student = function(r1_obsv) {
    this.FirstName = r1_obsv.subjectName;
    this.LastName = r1_obsv.subjectName;
    this.DateOfBirth = null;
    var date = new Date(Date.parse(r1_obsv.observationDate));
    var minutes = date.getUTCMinutes().toString();
    if (minutes.length == 1) minutes = "0" + minutes;
    this.DateAdded = date.getMonth() + 1 + "/" + date.getDate() + "/" +
      date.getFullYear() + " at " + date.getHours() +
      ":" +  minutes;
  }

  this.mapStudent = function(rec) {
    this.FirstName = rec.FirstName;
    this.LastName = rec.LastName;
    this.DateOfBirth = rec.DateOfBirth;
    this.DateAdded = rec.DateAdded;
  }

  this.printStudent = function() {
    console.log("Student: " + this.FirstName + " " + this.LastName);
    console.log("Age    : " + this.getAge());
  }

  this.getAge = function(){
    if (!this.DateOfBirth){
      return "No DOB. Age is unknown."
    }
    else {
      var ageDifMs = Date.now() - this.DateOfBirth.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
  }

  this.getFullName = function() {
    return this.FirstName + " " + this.LastName;
  }

}

/** Observation Business Class
  * @constructor
  */
function Observation (row) {
  console.log("constructing new Observation...");
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
    console.log("Student: " + this.Student.FirstName + " " + this.Student.LastName);
    console.log("Age    : " + this.Student.getAge());

  }
}

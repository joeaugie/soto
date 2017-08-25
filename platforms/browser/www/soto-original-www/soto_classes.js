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
}

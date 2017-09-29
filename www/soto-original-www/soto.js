var db;
var IS_R1_MIGRATED = false;
var INTERVAL_LENGTH;
var PEER_INTERVAL_FACTOR;
var VIBRATE_NEW_INTERVALS;
var AUTO_SEND_EMAILS;
var yAxisDataPoint;
var emailSubject;
var emailMessage;
var staticHREF;

	// Global variables used for all recording session logic.
	// These variables should be reset after the END of every observation session.
	// See helper function "resetGlobalVariables" for maintaining these values throughout the application.
	var c; 										// Acts as the current "time" of intervals in observation recording sessions.  Represents "seconds" counting down.
	var peerInterval;							// Interval index that identifies WHEN we are recording a PEER interval.
	var t;										// Used for primary TIMER of observation recording.
	var timer_is_on = 0;						// Boolean to indicate whether a sessions is in progress or not.
	var interval = 1;							// Keeps track of the current interval being recorded
	var intervalTarget = "Subject";				// Keeps track if the interval is observing a student or a peer
	var intervalHeading = "<h4>Interval Number</h4>";
	var fT; //flashTimer used for end of interval warnings

	// The following variables prefixed with "ar" are used to hold  data of the observation session being recorded.
	// All data is held in these arrays.  When the user decides to "end" the session, these values are then persisted to the DB.
	var arIndex=0;
	var arInterval = new Array();
	var arTarget = new Array();
	var arOnTask = new Array();
	var arOTM = new Array();
	var arOTV = new Array();
	var arOTP = new Array();
	var arNotes = new Array();
	var currentInsertedRowID; // Holds the ID of a new studentObservations record in the database.

$(document).ready(function () {

  $(document).on("pagebeforeshow","#settings",loadSettings);
  $(document).on("pagebeforeshow","#viewSessionsPanel", getStudentObservations);
  $(document).on("pagebeforeshow","#manageStudents", getStudents);
  $(document).on("pagebeforeshow","#newSessionPanel", initNewSessionsPanel);

  $('#settings form').submit(saveSettings);
  $('#newSessionPanel form').submit(saveNewSession);
  $('#recordSessionPanel form').submit(beginRecordingSession);

//	if (typeOf(PhoneGap) != 'undefined') {
//				  $('body > *').css({minHeight: '460px !important'});
//	}

	if (localStorage.isR1Migrated != null) {
		IS_R1_MIGRATED = localStorage.isR1Migrated;
		console.log("IS_R1_MIGRATED = " + IS_R1_MIGRATED);
		console.log("localStorage.isR1Migrated = " + localStorage.isR1Migrated);
	}
	else {
		IS_R1_MIGRATED = false;
		localStorage.isR1Migrated = false;
	}

	if (localStorage.intervalLength != null && localStorage.intervalLength > 0) {
		INTERVAL_LENGTH = parseInt(localStorage.intervalLength);
	}
	else {
		INTERVAL_LENGTH = 15;
		localStorage.intervalLength = INTERVAL_LENGTH;
	}
	c = INTERVAL_LENGTH;

	if (localStorage.peerInterval != null && localStorage.peerInterval > 0) {
		PEER_INTERVAL_FACTOR = parseInt(localStorage.peerInterval);
	}
	else {
		PEER_INTERVAL_FACTOR = 5;
		localStorage.peerInterval = PEER_INTERVAL_FACTOR;
	}
	peerInterval = PEER_INTERVAL_FACTOR;

	if (localStorage.vibrateNewIntervals != null && localStorage.vibrateNewIntervals != "") {
		VIBRATE_NEW_INTERVALS = localStorage.vibrateNewIntervals;
	} else VIBRATE_NEW_INTERVALS = true;

	if (localStorage.autoSendEmails != null && localStorage.autoSendEmails != "") {
		AUTO_SEND_EMAILS = localStorage.autoSendEmails;
	} else AUTO_SEND_EMAILS = true;

  var shortName = 'SOA';
  var version = '1.0';
  var displayName = 'Student On-Task Observation';
  var maxSize = 65536;
  db = openDatabase(shortName, version, displayName, maxSize);
	init_db_r1();
	init_db();
	// InsertR1TestData();
});


/* ****************************************************	*/
/* Manage User Preferences and Settings					*/
/* ****************************************************	*/

function saveSettings() {
	console.log("entered saveSettings()");
	var newIntervalLength = parseInt($('#intervalLength').val());
	var newPeerInterval = parseInt($('#peerInterval').val());
	var newEmail = jQuery.trim($('#userEmail').val());
	if (isNaN(newIntervalLength)) {
		navigator.notification.alert ('Please enter a whole number for Interval Length',
									  function nothing(){},
									  'Invalid Entry',
									  'Ok');
		return false;
	}
	if (isNaN(newPeerInterval)) {
		navigator.notification.alert ('Please enter a whole number for Peer Interval Factor',
									  function nothing(){},
									  'Invalid Entry',
									  'Ok');
		return false;
	}
	if (newEmail.length != 0)
	{
		var atpos  = newEmail.indexOf("@");
		var dotpos = newEmail.lastIndexOf(".");
		if (atpos<1 || dotpos<atpos+2 || dotpos+2>=newEmail.length)
		{
			navigator.notification.alert ('Please enter a valid e-mail address',
										  function nothing(){},
										  'Invalid Email',
										  'Ok');
			return false;
		}
	}
    localStorage.intervalLength = newIntervalLength;
    localStorage.peerInterval = newPeerInterval;
		localStorage.userEmail = newEmail;

	if (document.getElementById("vibrateNewIntervals").checked == true) {
		localStorage.vibrateNewIntervals = true;
	} else {
		localStorage.vibrateNewIntervals = false;
	}

	if (document.getElementById("autoSendEmails").checked == true) {
		localStorage.autoSendEmails = true;
	} else {
		localStorage.autoSendEmails = false;
	}

	INTERVAL_LENGTH = parseInt(localStorage.intervalLength);
	PEER_INTERVAL_FACTOR = parseInt(localStorage.peerInterval);
	VIBRATE_NEW_INTERVALS = localStorage.vibrateNewIntervals;
	AUTO_SEND_EMAILS = localStorage.autoSendEmails;
	c = INTERVAL_LENGTH;
	peerInterval = PEER_INTERVAL_FACTOR;
  // jQT.goBack();
	window.history.back();
	console.log("existing saveSettings()");
  return false;
}
function loadSettings() {
  $('#intervalLength').val(localStorage.intervalLength);
  $('#peerInterval').val(localStorage.peerInterval);
  $('#userEmail').val(localStorage.userEmail);
	document.getElementById("vibrateNewIntervals").checked = (localStorage.vibrateNewIntervals == "true");
	document.getElementById("autoSendEmails").checked = (localStorage.autoSendEmails == "true");
}


function getStudents() {
	console.log("entered getStudents()");
	qryStudents(null, loadStudents);
	console.log("exiting getStudents()");
}

function loadStudents(tx, rs) {
	console.log("entered loadStudents()");

	var newEntryTemplate = $('#manageStudents ul li:eq(0)').clone();
	$('#manageStudents ul').empty();

	for (var i = 0; i < rs.rows.length; i++) {
		var rec = rs.rows.item(i);
		var recStudent = new Student();
		recStudent.mapStudent(rec);
		recStudent.printStudent();

		var newEntryRow = newEntryTemplate.clone();
		newEntryRow.data('entryId', recStudent.StudentId);
		newEntryRow.appendTo('#manageStudents ul');
		newEntryRow.children('a').text(recStudent.getFullName());
		/*
		newEntryRow.click(function () {
			//var clickedEntry = $(this).parent();
			//var clickedEntryId = clickedEntry.data('entryId');
			//getStudentDetails(clickedEntryId);
		});
		*/
		newEntryRow.click(function () {
			getStudentDetails($(this).data('entryId'));
			$.mobile.navigate("#modifyStudent");
		});

	}
	console.log("exiting loadStudents()");
}

function getStudentDetails(_studentId){
	console.log("entered getStudentDetails(_studentId: "+_studentId+")");
	qryStudents(_studentId, displayStudentDetails);
	console.log("exiting getStudentDetails(_studentId: "+_studentId+")");
}

function displayStudentDetails(tx, rs){
	console.log("entered displayStudentDetails()");
	var rec = rs.rows.item(0);
	var recStudent = new Student();
	recStudent.mapStudent(rec);
	recStudent.printStudent();
	$('#modifyStudent #modifyStudentId').val(recStudent.StudentId);
	$('#modifyStudent #modifyStudentName').val(recStudent.StudentName);
	$('#modifyStudent #modifyDateOfBirth').val(recStudent.DateOfBirth);
	$('#modifyStudent #modifyDateAdded').val(new Date(recStudent.DateAdded));
	console.log("exiting displayStudentDetails()");
}

function modifySaveStudent(){
	console.log("entered modifySaveStudent()");
	var student = new Student($('#modifyStudent #modifyStudentId').val(),
														$('#modifyStudent #modifyStudentName').val(),
														$('#modifyStudent #modifyDateOfBirth').val(),
														$('#modifyStudent #modifyDateAdded').val());

	update_Student (student);
	console.log("exiting modifySaveStudent()");
}

/* ****************************************************	*/
/* View Student Observations, Generate Reports			*/
/* ****************************************************	*/
function getStudentObservations() {
	console.log("entered getStudentObservations()");
	qryObservations(null, displayObservations);
	console.log("exiting getStudentObservations()");
}

function displayObservations(result) {
	console.log("entered displayObservations()");
	var newEntryTemplate = $('#savedSessionItem').clone();
	$('#viewSessionsPanel ul').empty();
//	$('#viewSessionsPanel ul li:gt(0)').remove();

	for (var i = 0; i < result.rows.length; i++) {
		console.log("processing item " + i);
		var observation = new Observation(result.rows.item(i));
		var newEntryRow = newEntryTemplate.clone();
		newEntryRow.removeAttr('style');
		newEntryRow.data('entryId', observation.ObservationId);
		newEntryRow.data('entityObject', observation);
		newEntryRow.appendTo('#viewSessionsPanel ul');
		newEntryRow.find('#subjectName').text(observation.Student.getFullName());
		newEntryRow.find('#classLocation').text(observation.Location);
		newEntryRow.find('#observationDate').text(moment(observation.DateObservation).format('ddd MM-DD-YYYY'));
		newEntryRow.find('#subjectName').click(function () {
			var clickedEntityObject = $(this).parents('#savedSessionItem').data('entityObject');
			console.log("  clickedEntityObject: " + clickedEntityObject.Student.getFullName());
			getObservationResults(clickedEntityObject);
		});
		newEntryRow.find('#classLocation').click(function () {
			var clickedEntityObject = $(this).parents('#savedSessionItem').data('entityObject');
			console.log("  clickedEntityObject: " + clickedEntityObject.Student.getFullName());
			getObservationResults(clickedEntityObject);
		});
		newEntryRow.find('#observationDate').click(function () {
			var clickedEntityObject = $(this).parents('#savedSessionItem').data('entityObject');
			console.log("  clickedEntityObject: " + clickedEntityObject.Student.getFullName());
			getObservationResults(clickedEntityObject);
		});
		newEntryRow.find('.delete').click(function () {
			var clickedEntryId = $(this).parents('#savedSessionItem').data('entityObject').ObservationId;
			if (confirm("Are you sure you want to DELETE this observation?") == true){
				deleteEntryById(clickedEntryId);
				$(this).parent().slideUp();
			}
		});
	} //end FOR Loop
	console.log("exiting displayObservations()");
	//return true;
}

function deleteEntryById(_observation) {
	console.group("entering deleteEntryById( " + _observation +  " )");
	delete_Observation(_observation);
	console.groupEnd();
}
function getObservationResults(_obsv){
	console.log("entered getObservationResults( " + _obsv.Student.StudentId + " )");
  // jQT.goTo('#observationResultsPanel', 'slide');
	$.mobile.navigate( "#observationResultsPanel" );
  // $('#observationResultsPanel ul li:gt(0)').remove();  	// This line doesn't make any sense.

	var name = _obsv.Student.getFullName();
	var location = _obsv.Location;
	var date = new Date(Date.parse(_obsv.DateObservation));
	var minutes = date.getUTCMinutes().toString();
	if (minutes.length == 1) minutes = "0" + minutes;
	var shortDate = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + minutes;
	var description = _obsv.ActivityDescription;
if (description.length == 0) description = "&nbsp;";
	document.getElementById('reportTitle').innerHTML = name;
	document.getElementById('omdLoc').innerHTML = location;
	document.getElementById('omdDate').innerHTML = shortDate;
	document.getElementById('omdActivity').innerHTML = description;

	qryIntervals(_obsv.ObservationId, function (result) {
		console.group("entering anonymous callback of qryIntervals call in getObservationResults()");
		var observation = _obsv;
	  var subjectIntervals = 0;
	  var subjectOnTask = 0;
	  var subjectOffTask = 0;
	  var subjectAET = 0;
	  var subjectPET = 0;
	  var subjectOTM = 0;
	  var subjectOTV = 0;
	  var subjectOTP = 0;
	  var totalPeerIntervals = 0;
	  var peerOnTask = 0;
	  var peerOffTask = 0;
	  var peerAET = 0;
	  var peerPET = 0;
	  var peerOTM = 0;
	  var peerOTV = 0;
	  var peerOTP = 0;
		var rawDataDump = "<table> \
												<tr><th>Interval Number</th><th>Target</th><th>On/Off Task</th><th>" + _obsv.OtCode1 + "</th><th>" + _obsv.OtCode2 + "</th><th>" + _obsv.OtCode3 + "</th></tr>";


	  for (var i = 0; i < result.rows.length; i++) {
	      var row = result.rows.item(i);
				rawDataDump = rawDataDump + "<tr><td>" + row.IntervalNumber + "</td><td>" + row.Target + "</td><td>" + row.OnTask +
																	  "</td><td>" + row.OffTask_1 + "</td><td>" + row.OffTask_2 + "</td><td>" + row.OffTask_3 + "</td></tr>";

	      if (row.Target == "Subject") {
	          // Track counts for Summary Data Report
	          subjectIntervals++;
	          if (row.OnTask == "AET") {
	              subjectOnTask++;
	              subjectAET++;
	          }
	          if (row.OnTask == "PET") {
	              subjectOnTask++;
	              subjectPET++;
	          }
	          if (row.OnTask == "OFFT") {
	              subjectOffTask++;
	          }
	          if (row.OffTask_1 == "true") subjectOTM++;
	          if (row.OffTask_2 == "true") subjectOTP++;
	          if (row.OffTask_3 == "true") subjectOTV++;
	      }
	      else //Add data for the PEER intervals.
	      {
	          // Track counts for Summary Data Report
	          totalPeerIntervals++;
	          if (row.OnTask == "AET") {
	              peerOnTask++;
	              peerAET++;
	          }
	          if (row.OnTask == "PET") {
	              peerOnTask++;
	              peerPET++;
	          }
	          if (row.OnTask == "OFFT") {
	              peerOffTask++;
	          }
	          if (row.OffTask_1 == "true") peerOTM++;
	          if (row.OffTask_2 == "true") peerOTP++;
	          if (row.OffTask_3 == "true") peerOTV++;
	      }

	/*
	*	Removed RAW DATA section for now.
	*				                        // Display detailed interval data as recorded.
	      var newEntryRow = $('#intervalDataItems').clone();
	      newEntryRow.removeAttr('style');
	      newEntryRow.attr('id', row.id);
	      newEntryRow.appendTo('#observationResultsPanel ul');
	      newEntryRow.find('.intervalNumber').text("Interval #: " + row.interval);
	      newEntryRow.find('.onTask').text(row.onTask);

	      var offTasks = "";
	      if (row.OTM == "true") offTasks = offTasks + "OTM ";
	      if (row.OTV == "true") offTasks = offTasks + "OTV ";
	      if (row.OTP == "true") offTasks = offTasks + "OTP";
	      newEntryRow.find('.offTasks').text(offTasks);

	      if (row.target == "Peer")
	          newEntryRow.find('.peer').text("PEER INTERVAL: ");
	*/


	  } //end FOR Loop

		rawDataDump = rawDataDump + "</table>"

	  // Summarize Observation Data
	  // Overall On Task %,  AET %,  PET %,  OFF TASK %
	  // OTM%, OTV%,  OTP%

	  var onTaskPercentSubject = ((subjectOnTask / subjectIntervals) * 100).toFixed(2);
	  var aetPercentSubject;
	  var petPercentSubject;
	  if (subjectOnTask == 0) {
	      aetPercentSubject = 0;
	      petPercentSubject = 0;
	  } else {
	      aetPercentSubject = ((subjectAET / subjectIntervals) * 100).toFixed(1);
	      petPercentSubject = ((subjectPET / subjectIntervals) * 100).toFixed(1);
	  }
	  var offTaskPercentSubject = ((subjectOffTask / subjectIntervals) * 100).toFixed(2);
	  var otmPercentSubject = ((subjectOTM / subjectIntervals) * 100).toFixed(1);
	  var otvPercentSubject = ((subjectOTV / subjectIntervals) * 100).toFixed(1);
	  var otpPercentSubject = ((subjectOTP / subjectIntervals) * 100).toFixed(1);

	document.getElementById("reportDataOnTaskSubject").innerHTML = onTaskPercentSubject  + "%";
	document.getElementById("reportDataAETSubject").innerHTML = aetPercentSubject  + "%";
	document.getElementById("reportDataPETSubject").innerHTML = petPercentSubject  + "%";
	document.getElementById("reportDataOffTaskSubject").innerHTML = offTaskPercentSubject  + "%";
	document.getElementById("reportDataOTMSubject").innerHTML = otmPercentSubject  + "%";
	document.getElementById("reportDataOTVSubject").innerHTML = otvPercentSubject  + "%";
	document.getElementById("reportDataOTPSubject").innerHTML = otpPercentSubject  + "%";



	/*				                    var subjectObservationSummary = "<br/><hr/><br/><b><u>SUBJECT SUMMARY</u></b><br/><br/>Percent ON-TASK: " + onTaskPercentSubject + "%<br/>" +
			"      ----- AET: <b>" + aetPercentSubject + "%</b><br/>" +
			"      ----- PET: <b>" + petPercentSubject + "%</b><br/>" +
			"Percent OFF-TASK: <b>" + offTaskPercentSubject + "%</b><br/>" +
			"Off Task MOTOR: <b>" + otmPercentSubject + "%</b><br/>" +
			"Off Task VERBAL: <b>" + otvPercentSubject + "%</b><br/>" +
			"Off Task PASSIVE: <b>" + otpPercentSubject + "%</b><br/>";
	*/

	var subjectObservationSummary =
	 "SUBJECT SUMMARY\n\n" +
	 "         ON-TASK: " + onTaskPercentSubject + "%\n" +
	 "          -- AET: " + aetPercentSubject + "%\n" +
	 "          -- PET: " + petPercentSubject + "%\n\n" +
	 "        OFF-TASK: " + offTaskPercentSubject + "%\n" +
	 "          -- OTM: " + otmPercentSubject + "%\n" +
	 "          -- OTV: " + otvPercentSubject + "%\n" +
	 "          -- OTP: " + otpPercentSubject + "%\n\n";

	var onTaskPercentPeer;
	  var aetPercentPeer;
	  var petPercentPeer;
	  var offTaskPercentPeer;
	  var otmPercentPeer;
	  var otvPercentPeer;
	  var otpPercentPeer;

	  if (totalPeerIntervals == 0) {
	      onTaskPercentPeer = 0;
	      aetPercentPeer = 0;
	      petPercentPeer = 0;
	      offTaskPercentPeer = 0;
	      otmPercentPeer = 0;
	      otvPercentPeer = 0;
	      otpPercentPeer = 0;
	  } else {
	      onTaskPercentPeer = ((peerOnTask / totalPeerIntervals) * 100).toFixed(2);
	      if (peerOnTask == 0) {
	          aetPercentPeer = 0;
	          petPercentPeer = 0;
	      } else {
	          aetPercentPeer = ((peerAET / totalPeerIntervals) * 100).toFixed(1);
	          petPercentPeer = ((peerPET / totalPeerIntervals) * 100).toFixed(1);
	      }
	      offTaskPercentPeer = ((peerOffTask / totalPeerIntervals) * 100).toFixed(2);
	      otmPercentPeer = ((peerOTM / totalPeerIntervals) * 100).toFixed(1);
	      otvPercentPeer = ((peerOTV / totalPeerIntervals) * 100).toFixed(1);
	      otpPercentPeer = ((peerOTP / totalPeerIntervals) * 100).toFixed(1);
	  }

	document.getElementById("reportDataOnTaskPeer").innerHTML = onTaskPercentPeer + "%";
	document.getElementById("reportDataAETPeer").innerHTML = aetPercentPeer  + "%";
	document.getElementById("reportDataPETPeer").innerHTML = petPercentPeer  + "%";
	document.getElementById("reportDataOffTaskPeer").innerHTML = offTaskPercentPeer  + "%";
	document.getElementById("reportDataOTMPeer").innerHTML = otmPercentPeer  + "%";
	document.getElementById("reportDataOTVPeer").innerHTML = otvPercentPeer  + "%";
	document.getElementById("reportDataOTPPeer").innerHTML = otpPercentPeer  + "%";
	document.getElementById("rawDataDump").innerHTML = rawDataDump;

	/*				                    var peerObservationSummary = "<br/><hr/><br/><b><u>PEER SUMMARY</u></b><br/><br/>Percent ON-TASK: " + onTaskPercentPeer + "%<br/>" +
			"      ----- AET: <b>" + aetPercentPeer + "%</b><br/>" +
			"      ----- PET: <b>" + petPercentPeer + "%</b><br/>" +
			"Percent OFF-TASK: <b>" + offTaskPercentPeer + "%</b><br/>" +
			"Off Task MOTOR: <b>" + otmPercentPeer + "%</b><br/>" +
			"Off Task VERBAL: <b>" + otvPercentPeer + "%</b><br/>" +
			"Off Task PASSIVE: <b>" + otpPercentPeer + "%</b><br/>";
	*/
	var peerObservationSummary =
	 "PEER SUMMARY\n\n" +
	 "         ON-TASK: " + onTaskPercentPeer + "%\n" +
	 "          -- AET: " + aetPercentPeer + "%\n" +
	 "          -- PET: " + petPercentPeer + "%\n\n" +
	 "        OFF-TASK: " + offTaskPercentPeer + "%\n" +
	 "          -- OTM: " + otmPercentPeer + "%\n" +
	 "          -- OTV: " + otvPercentPeer + "%\n" +
	 "          -- OTP: " + otpPercentPeer + "%\n\n";



	//document.getElementById('observationSummary').innerHTML = subjectObservationSummary + peerObservationSummary;

	  // Draw On Task / Off Task Chart Comparison
	  var compOnOffTasksLabels = ["On-Task", "Off-Task"];
	  var compOnTaskData = [onTaskPercentSubject, onTaskPercentPeer];
	  var compOffTaskData = [offTaskPercentSubject, offTaskPercentPeer];
	  var compOnOffTasksDataPairs = [compOnTaskData, compOffTaskData];
	  initCanvas("can", compOnOffTasksLabels, compOnOffTasksDataPairs);

	  // Draw OnTask AET PET Chart Comparison
	  var compAETPETLabels = ["AET", "PET"];
	  var compAETData = [aetPercentSubject, aetPercentPeer];
	  var compPETData = [petPercentSubject, petPercentPeer];
	  var compAETPETDataPairs = [compAETData, compPETData];
	  initCanvas("onTaskCanvas", compAETPETLabels, compAETPETDataPairs);

	  //Draw Off Task Chart Comparison
	  var compOffTaskLabels = [observation.OtCode1, observation.OtCode2, observation.OtCode3];
	  var compOTVData = [otvPercentSubject, otvPercentPeer];
	  var compOTMData = [otmPercentSubject, otmPercentPeer];
	  var compOTPData = [otpPercentSubject, otpPercentPeer];
	  var compOffTaskDataPairs = [compOTMData, compOTVData, compOTPData];
	  initCanvas("offTaskCanvas", compOffTaskLabels, compOffTaskDataPairs);

	staticHREF = "mailto:" + localStorage.userEmail + "?";
	emailSubject = "SOTO Report: " + name;
	/*									emailMessage = "<h1>SOA Report for " + name + "</h1>Location: <b>" + location + "</b><br/>Date: <b>" + date + "</b><br/>"  +
	 subjectObservationSummary + peerObservationSummary +
	 "<hr/><br/><br/><b>On-Task / Off-Task</b>	<br/><img src='" + document.getElementById("can").toDataURL("image/png") + "'/><br/><i>Subject: red,   Peer: blue</i>" +
	 "<hr/><br/><br/><b>AET / PET</b>				<br/><img src='" + document.getElementById("onTaskCanvas").toDataURL("image/png")	+ "'/><br/><i>Subject: red,   Peer: blue</i>" +
	 "<hr/><br/><br/><b>OTM / OTV / OTP</b>		<br/><img src='" + document.getElementById("offTaskCanvas").toDataURL("image/png")	+ "'/><br/><i>Subject: red,   Peer: blue</i>" +
	 "<hr/><br/><br/>Generated from my <b><i>Student Observation App</b></i> on iPhone.<br/>Developed by <a href='http://apps.monkeylikesit.com'>Monkey Apps</a> at <a href='http://monkeylikesit.com'>http://monkeylikesit.com</a>";
	*/
	emailMessage = "Student:\t" + name + "\n" +
	 "Location:\t" + location + "\n" +
	 "Date:\t\t\t" + shortDate + "\n" +
	 "-------------------------------------\n" +
	 subjectObservationSummary +
	 "-------------------------------------\n" +
	 peerObservationSummary +
	 "-------------------------------------\n" +
	 rawDataDump +
	 "-------------------------------------\n" +
	/*												   "OBSERVATION DETAILS\n\n" +
	 subjectIntervals + " \t Subject: # of Intervals Total\n " +
	 subjectOnTask +    " \t Subject: # of Intervals On-Task\n " +
	 subjectAET +		  " \t Subject: # of Intervals AET\n " +
	 subjectPET +		  " \t Subject: # of Intervals PET\n " +
	 subjectOffTask +   " \t Subject: # of Intervals Off-Task\n " +
	 subjectAET +		  " \t Subject: # of Intervals AET\n " +
	 subjectPET +		  " \t Subject: # of Intervals PET\n " +
	 subjectOTM +		  " \t Subject: # of Intervals OTM\n " +
	 subjectOTV +		  " \t Subject: # of Intervals OTV\n " +
	 subjectOTP +		  " \t Subject: # of Intervals OTP\n " +
	 subjectIntervals + " \t Subject: # of Intervals\n " +
	 totalPeerIntervals + " \t# of Peer Intervals\n " +
	*/
	 "Thank you for using SOTO!\n" +
	 "http://monkeylikesit.com/soto\n\n" +
	 "Questions or Feedback?  Visit http://monkeylikesit.com/support\n\n" +
	 "If you like the SOTO app, Like us on our Facebook page and leave us a review in the iTunes App Store!\n\n" +
	 "Facebook:  http://facebook.com/monkeylikesit\n\n" +
	 "App Store: http://itunes.apple.com/us/app/soto-student-on-task-observation/id428809608?mt=8&ls=1\n"
	 ;

	 //document.getElementById("sendReportLink").href= staticHREF + emailSubject + emailMessage;
	 //document.getElementById("sendReportLink").onclick = "javascript:showEmailComposer(" + emailSubject + "," + emailMessage + "," + "jjcalo@yahoo.com" + ", nil, nil, YES);";


		console.groupEnd();
	});

	console.log("exiting getObservationResults( " + _obsv.Student.StudentId + " )");
}
function initCanvas(_canvas, _arrayLabels, _arrayDataPairs) {
	var ctx;
	var maxVal;
	var minVal;
	var numSamples;
	var xScalar;

	var yScalar;

	// set these values for your data
    numSamples = _arrayLabels.length;
    maxVal = 100;
    var stepSize = 20;
    var colHead = 60;
    var rowHead = 50;
    var margin = 20;
	var dataBarWidth = .2;

    var curCan;
	curCan = document.getElementById(_canvas);
    ctx = curCan.getContext("2d");

	// Clear the canvas
	ctx.clearRect(0,0,curCan.width, curCan.height);
	var defW = curCan.width;
	var defH = curCan.height;
	curCan.width=1;
	curCan.height=1;
	curCan.width=defW;
	curCan.height=defH;

	// Build the canvas
    ctx.fillStyle = "#000000"
    yScalar = (curCan.height - colHead - margin) / (maxVal);
    xScalar = (curCan.width - rowHead - margin) / (numSamples);

	// Print legend text
	ctx.font="9pt Helvetica italic";
	ctx.textBaseline="bottom";
	ctx.fillStyle="#ff3300";
	ctx.fillText("Subject = red", rowHead*1.5, curCan.height);
	ctx.fillStyle="#0080ff";
	ctx.fillText("Peer = blue", rowHead * 3, curCan.height);


	// Print y-axis percent labels and draw horizontal grid lines
    ctx.strokeStyle="rgba(0,128,255, 0.75)"; // light blue line
    ctx.beginPath();
    ctx.font = "10pt Helvetica"
    var count =  0;
	for (scale=maxVal;scale>=0;scale = scale - stepSize) {
        yAxisDataPoint = colHead + (yScalar * count * stepSize);
        ctx.fillText(scale +"%", margin,yAxisDataPoint);
        ctx.moveTo(rowHead*1.1,yAxisDataPoint);
        ctx.lineTo(curCan.width,yAxisDataPoint);
        count++;
    }
    ctx.stroke();


    // Print Labels for pairs of data
    ctx.font = "10pt Helvetica";
	ctx.fillStyle="#000000";
    ctx.textBaseline="bottom";

	for (var i=0; i < numSamples; i++){
		var data1 = parseFloat(_arrayDataPairs[i][0]);
		var data2 = parseFloat(_arrayDataPairs[i][1]);
		if (data1 == 0 && data2 == 0) calcY(margin, curCan.height, yScalar);
		else if (data1>data2) calcY(data1, curCan.height, yScalar);
		else calcY(data2, curCan.height, yScalar);
		ctx.fillText(_arrayLabels[i], xScalar*(i+1),yAxisDataPoint - margin);
	}
    // set a color and a shadow
	var pairColors = ["#ff3300", "#0080ff"];
    // translate to bottom of graph and scale x,y to match data
	ctx.save();
    ctx.translate(0, curCan.height - margin);
	ctx.save();
    ctx.scale(xScalar,yScalar*-1);
	// draw bars

	var pairSpacing;
    for (i=0;i < _arrayLabels.length; i++) {
		pairSpacing = i;
		for (x=0; x < _arrayDataPairs[i].length; x++) {
			if (parseFloat(_arrayDataPairs[i][x]) == 0){
				ctx.restore();
				ctx.fillStyle = pairColors[x];
				ctx.font = "8pt Helvetica, bold";
				ctx.fillText("0%", xScalar*(pairSpacing+1.05), 0);
				ctx.save();
			    ctx.scale(xScalar,yScalar*-1);
			}
			else {
				ctx.fillStyle = pairColors[x];
				ctx.fillRect((pairSpacing + 1), 0, parseFloat(dataBarWidth), parseFloat(_arrayDataPairs[i][x]));
			}
			pairSpacing = pairSpacing + dataBarWidth;
		}
    }
	ctx.restore();
	ctx.restore();
}
function calcY(value, _canHeight, _yScalar) {
    yAxisDataPoint = _canHeight - value * parseFloat(_yScalar);
}
function sendReport(){

	console.log("begin sendReport()");

	var data;
	var context;

	console.log("   drawing CAN chart");
	var canvas = document.getElementById("can");
	context = canvas.getContext("2d");
	data = context.getImageData(0, 0, canvas.width, canvas.height);
	//store the current globalCompositeOperation
	var compositeOperation = context.globalCompositeOperation;
	//set to draw behind current content
	context.globalCompositeOperation = "destination-over";
	//set background color
	context.fillStyle = "#ffffff";
	//draw background / rect on entire canvas
	context.fillRect(0,0,canvas.width,canvas.height);
	var imageData = document.getElementById("can").toDataURL("image/png");
	//clear the canvas
	context.clearRect (0,0,canvas.width,canvas.height);
	//restore it with original / cached ImageData
	context.putImageData(data, 0,0);
	//reset the globalCompositeOperation to what it was
	context.globalCompositeOperation = compositeOperation;

	console.log("   drawing onTaskCanvas chart");
	var canvas = document.getElementById("onTaskCanvas");
	context = canvas.getContext("2d");
	data = context.getImageData(0, 0, canvas.width, canvas.height);
	//store the current globalCompositeOperation
	var compositeOperation = context.globalCompositeOperation;
	//set to draw behind current content
	context.globalCompositeOperation = "destination-over";
	//set background color
	context.fillStyle = "#ffffff";
	//draw background / rect on entire canvas
	context.fillRect(0,0,canvas.width,canvas.height);
	var imageData2 = document.getElementById("onTaskCanvas").toDataURL("image/png");
	//clear the canvas
	context.clearRect (0,0,canvas.width,canvas.height);
	//restore it with original / cached ImageData
	context.putImageData(data, 0,0);
	//reset the globalCompositeOperation to what it was
	context.globalCompositeOperation = compositeOperation;

	console.log("   drawing offTaskCanvas chart");
	var canvas = document.getElementById("offTaskCanvas");
	context = canvas.getContext("2d");
	data = context.getImageData(0, 0, canvas.width, canvas.height);
	//store the current globalCompositeOperation
	var compositeOperation = context.globalCompositeOperation;
	//set to draw behind current content
	context.globalCompositeOperation = "destination-over";
	//set background color
	context.fillStyle = "#ffffff";
	//draw background / rect on entire canvas
	context.fillRect(0,0,canvas.width,canvas.height);
	var imageData3 = document.getElementById("offTaskCanvas").toDataURL("image/png");
	//clear the canvas
	context.clearRect (0,0,canvas.width,canvas.height);
	//restore it with original / cached ImageData
	context.putImageData(data, 0,0);
	//reset the globalCompositeOperation to what it was
	context.globalCompositeOperation = compositeOperation;

	//console.log("   imageData: " + imageData);

	console.log("   generating email using cordova.plugins.email.open");
	cordova.plugins.email.open({
		to: 					localStorage.userEmail,
		attachments: 	[imageData.replace("data:image/png;base64,", "base64:OnOffTask.png//"), imageData2.replace("data:image/png;base64,", "base64:OnTaskBreakdown.png//"), imageData3.replace("data:image/png;base64,", "base64:OffTaskBreakdown.png//")],
		subject: 			emailSubject,
		body:	 				emailMessage,
		isHtml: 			false
	}, function(){console.log("CB from cordova.plugins.email.open after email has been sent or discarded and dismissed.")}, this);
	console.log("end SendReport()");
	return false;
}

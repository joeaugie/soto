/* *****************************************	*/
/* Start New Observation, Record New Session	*/
/* *****************************************	*/
function initNewSessionsPanel(){
	console.log("entered initNewSessionsPanel()");
	qryStudents(null, loadSelectStudentCombo);
	document.getElementById("subjectName").value="";
	document.getElementById("classLocation").value="";
	document.getElementById("activityDescription").value="";
	console.log("exiting initNewSessionsPanel()");
}

function loadSelectStudentCombo(tx, rs) {
	console.log("entered loadSelectStudentCombo()");

	var newEntryTemplate = 	$('#newSessionPanel ul li:eq(0)').clone();
	$('#newSessionPanel ul').empty();

	for (var i = 0; i < rs.rows.length; i++) {
		var rec = rs.rows.item(i);
		var recStudent = new Student();
		recStudent.mapStudent(rec);
		recStudent.printStudent();

		var newEntryRow = newEntryTemplate.clone();
		newEntryRow.data('entryid', recStudent.StudentId);
		newEntryRow.text(recStudent.getFullName());
		newEntryRow.appendTo('#newSessionPanel ul');

		newEntryRow.click(function () {
			$("#subjectName").val($(this).text());
			$("#subjectName").data('entryid', $(this).data('entryid'));
			// hide them once one is selected
			$('[data-role=listview]').children('li').addClass('ui-screen-hidden');

			// var clickedEntry = $(this).parent();
			// var clickedEntryId = clickedEntry.data('entryId');
			// getStudentDetails(clickedEntryId);
			// $.mobile.navigate("#modifyStudent");
		});
	}
	console.log("exiting loadSelectStudentCombo()");
}

function enableAllOnTaskFields() {
    document.getElementById("AET").disabled = false;
    document.getElementById("PET").disabled = false;
    document.getElementById("OTM").disabled = false;
    document.getElementById("OTV").disabled = false;
    document.getElementById("OTP").disabled = false;
}

function saveNewSession() {
	console.log("executing saveNewSession()");
	var newSessionStudentId = $("#newSessionPanel #subjectName").data('entryid');
	var newSessionStudentName = $("#newSessionPanel #subjectName").val();
	var newSessionClassLocation = $("#newSessionPanel #classLocation").val();
	var newSessionStudentActivityDescription = $("#newSessionPanel #activityDescription").val();
	console.log(newSessionStudentId + " | " + newSessionStudentName + " | " + newSessionClassLocation + " | " + newSessionStudentActivityDescription);
	if (newSessionStudentName == null || newSessionStudentName == ""){
		navigator.notification.alert ("Please select or enter a student's name",
		  function nothing(){},
		  'Required Field',
		  'Ok');
		return false;
	}

	if (newSessionClassLocation == null || newSessionClassLocation == ""){
		navigator.notification.alert ('Please enter the class or location of this session',
		  function nothing(){},
		  'Required Field',
		  'Ok');
		return false;
	}

	/*
  db.transaction(
    function (transaction) {
      transaction.executeSql(
        'INSERT INTO studentObservations (subjectName, classLocation, observationDate, activityDescription) VALUES (?, ?, ?, ?);',
        [document.getElementById("subjectName").value,
         document.getElementById("classLocation").value,
         new Date(),
         document.getElementById("activityDescription").value],
         function (transaction, result) {
	         currentInsertedRowID = result.insertId;
            // jQT.goTo('#recordSessionPanel', 'slide');
						$.mobile.navigate( "#recordSessionPanel" );
          },
          errorHandler
      );
    }
  );
	*/
  return false;
}

function beginRecordingSession() {
  if (!timer_is_on) {
    timer_is_on = 1;
    enableAllOnTaskFields();
	  document.getElementById('cancelRecordSession').style.display = "none";
    timedCount();
  }
}

function timedCount() {
	var timer = INTERVAL_LENGTH;

  t = setInterval(function () {
			document.getElementById('intervalHeaderText').innerHTML = intervalHeading + "<span class='digits'>" + interval + "</span>";
			document.getElementById('intervalHeaderSecondsLeft').innerHTML = "<span class='digits'>" + timer + "</span>";
		  c = c - 1;

			if (timer == 2){
				flashIntervalHeaderOn();
				if (VIBRATE_NEW_INTERVALS == "true") {
					try {
						navigator.vibrate(1000);
					}
					catch (e) {
					} // nothing, vibrate not available
				}
			}

			if (--timer < 0) {
				// Start the next interval
		      saveIntervalData(intervalTarget);
					intervalHeading = "<h4>Interval Number</h4>";
					interval++;
					flashIntervalHeaderOff();
					if (interval == peerInterval) {
						intervalTarget = "Peer";
						peerInterval = peerInterval + PEER_INTERVAL_FACTOR;
						intervalHeading = "<h4><strong style='color:red;'>Peer</strong> Interval Number</h4>";
					}
					else {
						intervalTarget = "Subject";
					}
		      resetAllRecordingSessionFields();
					// Reset timer to INTERVAL_LENGTH
					timer = INTERVAL_LENGTH;
      }

  }, 1000);
}

function saveIntervalData(_intervalTarget) {
    var _onTask;
    var _otm;
    var _otv;
    var _otp;

    if (document.getElementById("AET").checked == true) _onTask = "AET";
    else if (document.getElementById("PET").checked == true) _onTask = "PET";
    else _onTask = "OFFT";

    if (document.getElementById("OTM").checked == true) _otm = true; else _otm = false;
    if (document.getElementById("OTV").checked == true) _otv = true; else _otv = false;
    if (document.getElementById("OTP").checked == true) _otp = true; else _otp = false;

	arInterval[arIndex] = interval;
	arTarget[arIndex] = _intervalTarget;
	arOnTask[arIndex] = _onTask;
	arOTM[arIndex] = _otm;
	arOTV[arIndex] = _otv;
	arOTP[arIndex] = _otp;
	arIndex++;
    return true;
}
function flashIntervalHeaderOn() {
    document.getElementById('intervalHeaderSecondsLeft').style.color = "red";
    //fT = setTimeout(flashIntervalHeaderOff, 169);
}
function flashIntervalHeaderOff() {
    document.getElementById('intervalHeaderSecondsLeft').style.color = "black";
    //fT = setTimeout(flashIntervalHeaderOn, 169);
}
function toggleAET() {
    if (document.getElementById("AET").checked == true) document.getElementById("PET").checked = false;
}
function togglePET() {
    if (document.getElementById("PET").checked == true) document.getElementById("AET").checked = false;
}
function clickAET() {
    if (document.getElementById("AET").checked == true) document.getElementById("AET").checked = false;
	else document.getElementById("AET").checked = true;
	toggleAET();
}
function clickPET() {
    if (document.getElementById("PET").checked == true) document.getElementById("PET").checked = false;
	else document.getElementById("PET").checked = true;
	togglePET();
}
function clickOTM() {
    if (document.getElementById("OTM").checked == true) document.getElementById("OTM").checked = false;
	else document.getElementById("OTM").checked = true;
}
function clickOTV() {
    if (document.getElementById("OTV").checked == true) document.getElementById("OTV").checked = false;
	else document.getElementById("OTV").checked = true;
}
function clickOTP() {
    if (document.getElementById("OTP").checked == true) document.getElementById("OTP").checked = false;
	else document.getElementById("OTP").checked = true;
}

function pauseRecordingSession() {
    clearInterval(t);
    timer_is_on = 0;
}

function endRecordingSession() {
    answer = confirm("Do you want to END this session?");
	if (answer){
		clearInterval(t);
		//clearTimeout(fT);
	  timer_is_on = 0;
		document.getElementById('cancelRecordSession').style.display = "inline";
		// Persist all interval data
		db.transaction(function(transaction){
			var sqlMassInsert="";

			for (var i = 0; i < arInterval.length; i++) {
				var sqlMassValues= new Array();
				sqlMassInsert = "INSERT INTO intervalData (soid, interval, target, onTask, OTM, OTV, OTP) VALUES (?, ?, ?, ?, ?, ?, ?);";
				sqlMassValues[0] = currentInsertedRowID;
				sqlMassValues[1] = arInterval[i];
				sqlMassValues[2] = arTarget[i];
				sqlMassValues[3] = arOnTask[i];
				sqlMassValues[4] = arOTM[i];
				sqlMassValues[5] = arOTV[i];
				sqlMassValues[6] = arOTP[i];
				transaction.executeSql(sqlMassInsert,sqlMassValues,
					function(){
					   arIndex=0;
					   arInterval = new Array();
					   arTarget = new Array();
					   arOnTask = new Array();
					   arOTM = new Array();
					   arOTV = new Array();
					   arOTP = new Array();
					}, errorHandler);
			}
		});
		resetAllRecordingSessionFields();
		resetGlobalVariables();
	  document.getElementById('intervalHeaderText').innerHTML = "<h4>Interval Number</h4><span class='digits waitingToStart'>0</span>";
		document.getElementById('intervalHeaderSecondsLeft').innerHTML = "<span class='digits waitingToStart'>0</span>";
		// jQT.goTo("#home");
		$.mobile.navigate( "#home" );
	}
}
function resetAllRecordingSessionFields() {
    enableAllOnTaskFields();
    document.getElementById("AET").checked = false;
    document.getElementById("PET").checked = false;
    document.getElementById("OTM").checked = false;
    document.getElementById("OTV").checked = false;
    document.getElementById("OTP").checked = false;
}
function resetGlobalVariables(){
	// Global variables used for all recording session logic.
	// These variables should be reset after the END of every observation session.
	c = INTERVAL_LENGTH;
	t;
	timer_is_on = 0;
	interval = 1;
	intervalTarget = "Subject";
	peerInterval = PEER_INTERVAL_FACTOR;
	intervalHeading = "<h4>Interval Number</h4>";
}

function errorHandler(transaction, error) {
    alert('Oops. Error was '+error.message+' (Code '+error.code+')');
    return true;
}

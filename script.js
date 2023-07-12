var jpdbBaseURL = 'http://api.login2explore.com:5577';
var jpdbIRL = '/api/irl';
var jpbdIML = '/api/iml';
var ProjectDatabaseName = 'COLLEGE-DB';
var ProjectRelationName = 'PROJECT-TABLE';
var connectionToken = '90933002|-31949325400051794|90949707';

$('#pid').focus();


function alertHandlerHTML(status, message) {
    
    
    if (status === 1) {
        return `<div class="alert  alert-primary d-flex align-items-center alert-dismissible " role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
                <div>
                  <strong>Success!</strong> ${message}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
    } else {
        return `<div class="alert  alert-warning d-flex align-items-center alert-dismissible" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>
        <div>
          <strong>Warning!</strong> ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    }

}

function alertHandler(status, message) {
    var alterHTML = alertHandlerHTML(status, message);
    let alertDiv = document.createElement('div');
    alertDiv.innerHTML = alterHTML;
    $('#disposalAlertContainer').append(alertDiv);
}


function saveRecNoToLocalStorage(jsonObject) {
    var lvData = JSON.parse(jsonObject.data);
    localStorage.setItem('recordNo', lvData.rec_no);
}


function disableAllFeildExceptRollno() {
    $('#projname').prop('disabled', true);
    $('#assign').prop('disabled', true);
    $('#assigndate').prop('disabled', true);
    $('#deadline').prop('disabled', true);
    $('#reset').prop('disabled', true);
    $('#save').prop('disabled', true);
    $('#update').prop('disabled', true);
}



function resetForm() {
    $('#pid').val("");
    $('#projname').val("");
    $('#assign').val("");
    $('#assigndate').val("");
    $('#deadline').val("");
    $('#pid').prop('disabled', false);
    disableAllFeildExceptRollno();
    $('#pid').focus();
}

function fillData(jsonObject) {
    if (jsonObject === "") {
        $('#projname').val("");
        $('#assign').val("");
        $('#assigndate').val("");
        $('#deadline').val("");
    } else {
       
        saveRecNoToLocalStorage(jsonObject);
        
      
        var data = JSON.parse(jsonObject.data).record;
        
        $('#projname').val(data.projectname);
        $('#assign').val(data.assignedto);
        $('#assigndate').val(data.assignmentdate);
        $('#deadline').val(data.deadline);
    }
}



function validateDate() {
    var inputassignDate = $('#assigndate').val();
    var inputdeadline = $('#deadline').val();
    inputassignDate = new Date(inputassignDate);
    inputdeadline = new Date(inputdeadline);
    

    return inputassignDate.getTime() < inputdeadline.getTime();

}

function validateFormData() {
    var pid, projname, assign, assigndate, deadline;
    pid = $('#pid').val();
    projname = $('#projname').val();
    assign = $('#assign').val();
    assigndate = $('#assigndate').val();
    deadline = $('#deadline').val();

    if (pid === '') {
        alertHandler(0, 'Project ID Missing');
        $('#pid').focus();
        return "";
    }

    if (pid <= 0) {
        alertHandler(0, 'Invalid PROJECT ID');
        $('#pid').focus();
        return "";
    }

    if (projname === '') {
        alertHandler(0, 'Project Name is Missing');
        $('#projname').focus();
        return "";
    }
    if (assign === '') {
        alertHandler(0, 'Assigned to is Missing');
        $('#assign').focus();
        return "";
    }
    if (assigndate === '') {
        alertHandler(0, 'Assignment Date is Missing');
        $('#assigndate').focus();
        return "";
    }
    if (deadline === '') {
        alertHandler(0, 'Deadline Date is Missing');
        $('#deadline').focus();
        return "";
    }

    if (!validateDate()) {
        alertHandler(0, 'Invalid Deadline Date(Deadline Date should be greater than Assignment Date)');
        $('#deadline').focus();
        return "";
    }

    
    var jsonStrObj = {
        id: pid,
        projname: projname,
        assignedto: assign,
        assigndate: assigndate,
        deadline: deadline
    };
    
   
    return JSON.stringify(jsonStrObj);
}



function getprojectIDAsJsonObj() {
    var pid = $('#pid').val();
    var jsonStr = {
        id: pid
    };
    return JSON.stringify(jsonStr);
}



function getprojData() {

     
    if ($('#pid').val() === "") { 
        disableAllFeildExceptpid();
    } else if ($('#pid').val() < 1) { 
        disableAllFeildExceptpid();
        alertHandler(0, 'Invalid Project ID');
        $('#pid').focus();
    } else { 
        var ProjectIDJsonObj = getprojectIDAsJsonObj(); 
        
       
        var getRequest = createGET_BY_KEYRequest(connectionToken, ProjectDatabaseName, ProjectRelationName, ProjectIDJsonObj);
        
        jQuery.ajaxSetup({async: false});
       
        var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
        jQuery.ajaxSetup({async: true});
        
        
        $('#pid').prop('disabled', false);
        $('#projname').prop('disabled', false);
        $('#assign').prop('disabled', false);
        $('#assigndate').prop('disabled', false);
        $('#deadline').prop('disabled', false);
        
        if (resJsonObj.status === 400) {
            $('#reset').prop('disabled', false);
            $('#save').prop('disabled', false);
            $('#update').prop('disabled', true);
            fillData("");
            $('#projname').focus();
        } else if (resJsonObj.status === 200) {
            $('#pid').prop('disabled', true);
            fillData(resJsonObj);
            $('#reset').prop('disabled', false);
            $('#update').prop('disabled', false);
            $('#save').prop('disabled', true);
            $('#projname').focus();
        }
    }



}


function saveData() {
    var jsonStrObj = validateFormData();
    

    if (jsonStrObj === '')
        return '';


    var putRequest = createPUTRequest(connectionToken, jsonStrObj, ProjectDatabaseName, ProjectRelationName);
    jQuery.ajaxSetup({async: false});
    
    
    var resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});
    
    if (resJsonObj.status === 400) {
        alertHandler(0, 'Data Is Not Saved ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {
        alertHandler(1, 'Data has been Saved successfully');
    }
 
    resetForm();
    
    $('#empid').focus();
}




function changeData() {
    $('#changeBtn').prop('disabled', true);
    var jsonChg = validateFormData();
    
    var updateRequest = createUPDATERecordRequest(connectionToken, jsonChg, ProjectDatabaseName, ProjectRelationName, localStorage.getItem("recordNo"));
    jQuery.ajaxSetup({async: false});
    
   
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});
    
    if (resJsonObj.status === 400) {
        alertHandler(0, 'Data is Not Update ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {
        alertHandler(1, 'Data has been Updated successfully');
    }
    
   
    resetForm();
    $('#empid').focus();
}


const databaseID = "16JLU76FNGYsw-y7_qcAC6-uzv_XRP6jmUAxeQWKojj0"
const logsID = "1wnXj0bdnuNDhtLH_pB74NLcYhG9E6c0R9lur3yzwnVI"
const scriptLogsID = "1OnjXzeHcTFVX1b1B6dETYJQxhEKiuJ3S"
const logSheetID = "1wnXj0bdnuNDhtLH_pB74NLcYhG9E6c0R9lur3yzwnVI"
// https://script.google.com/a/macros/gsa.gov/s/AKfycbxNaim6LCj5RNy_whupNR7U_o6wLvhh184EN2kW_Ew/dev

function doGet(e) {
  const user = Session.getActiveUser().getEmail();
  console.log(user)
  let html =  HtmlService.createTemplateFromFile('index');
  html.params =  e.queryString; 
  try{
        return html
        .evaluate()
        .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
        .setTitle('COR/ACOR Change Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .setFaviconUrl('https://www.gsa.gov/sites/gsa.gov/themes/custom/gsa/logo.png');

  }
  catch(e){
      Logger.log(e.message)
      Logger.log("invalid or no parameters passed")
      return ContentService.createTextOutput("Invalid Link");
  };
}
function getData(type){
  Logger.log("inside getData")
  switch(type){
    case "inputData":
      let inputData = getJsonArrayFromData(SpreadsheetApp.openById(databaseID).getSheetByName("Database").getRange(1,1).getDataRegion().getDisplayValues());
      Logger.log(inputData)
      return inputData;
    break;
    case "inputFields":
      let inputFields = JSON.parse(DriveApp.getFileById("1G1Vltl84Wq2GxV8aLg4kCSJGWht5SXO4").getBlob().getDataAsString())
      Logger.log(inputFields)
      return inputFields;
    break;
    case "logs":
      let logs = getJsonArrayFromData(SpreadsheetApp.openById(logsID).getSheetByName("Logs").getRange(1,1).getDataRegion().getDisplayValues());
      Logger.log(logs)
      return logs;
    break;
    case "surveyData":
      let surveyData = getJsonArrayFromData(SpreadsheetApp.openById(databaseID).getSheetByName("Semi-Annual Updates").getRange(1,1).getDataRegion().getDisplayValues());
      Logger.log(surveyData)
      return surveyData;
    break;
    case "formData":
      let formData = JSON.parse(DriveApp.getFileById("1cOqQFA1EfqrJIyKJbcIhv060KyE5kpcs").getBlob().getDataAsString())
      Logger.log(formData)
      return formData;
    break;
    case "username":
      return Session.getActiveUser().getEmail();
    break;


  }
}

function getUserEmail() {
  let email = "";
  try {
    email = Session.getActiveUser().getEmail();
    Logger.log(email)
    return email;
  } catch(err) {
    Logger.log("Error fetching the user email: " + err.message);
    return email;
  }
}

function getAdminList(){
  return SpreadsheetApp.openById(databaseID).getSheetByName("Admin List").getDataRange().getDisplayValues().flat();

}

function submitUpdates(values,action){
  try {
    // values = {"Status":"Active","Group":"FRPC ESC","Agency":"GSA","GoogleCalendar":"FRPC Executive Steering Committee","FirstName":"Chantelle","Title":"Developer","ShortName":"FRPCE","Info":"","EmailAddress":"chantelle.lim@gsa.gov","Role":"Member","Submitter":"","Updates":"No Response","PhoneNumber":"585-200-9095","ListServ":"frpc-esc@listserv.gsa.gov","ID":"000280","LastName":"Lim","search":"Active FRPC ESC GSA FRPC Executive Steering Committee Chantelle  FRPCE  chantelle.lim@gsa.gov Member  No Response 585-200-9095 frpc-esc@listserv.gsa.gov 000280 Lim","submitterEmail":"chantelle.lim@gsa.gov"}
    // action = "update"
    var logFileName = `Dashboard [${action}]: ` + values.submitterEmail.replace("@gsa.gov","")+"_"+Utilities.formatDate(new Date(),"America/New_York","MM/dd/yyyy HH:mm:ss") + ".txt"
    var LogFile = DriveApp.getFolderById(scriptLogsID).createFile(logFileName,"Logger..."); 
    Logger.log = (text)=>{
      let lag = LogFile.getBlob().getDataAsString(); 
      LogFile.setContent(lag+"\n"+text)
    }
    // get lock
    var lock = lockScript();
    Logger.log(`email: ${values.EmailAddress} | id: ${values.ID} | Action: ${action} | Submitter: ${values.submitterEmail}`)
    Logger.log(values)
    let id = values.ID
    let submitter = values.submitterEmail
    let ss = SpreadsheetApp.openById(databaseID);
    let database = getJsonArrayFromData(ss.getSheetByName("Database").getRange(1,1).getDataRegion().getDisplayValues())
    let configDict = {};
    let tempArr3 = ss.getSheetByName("Config").getRange("A:B").getValues();
    tempArr3.forEach(row =>{
        configDict[row[0]] = row[1]
    })
    let listservDict = {};
    let tempArr4 = ss.getSheetByName("ListServ Dict").getRange("A:B").getValues();
    tempArr4.forEach(row =>{
      listservDict[row[0]] = row[1]
    })
    let resource ={
      valueInputOption: "RAW",
      data:[]
    }
    let logArr = []

    switch (action) {
      case "update":
        // filter for id
        var member = database.filter(row => row["EmailAddress"]==values["EmailAddress"])
        member.forEach(entry =>{
          let rowNum = parseInt(entry["ID"])+1;
          Logger.log(`rowNum: ${rowNum}`)
          // FirstName,LastName,PhoneNumber,Title,Role
          let arr = ["FirstName","LastName","PhoneNumber","Title","Role"]
          let col = ["D","E","K","J","I"]
          arr.forEach((el,idx) =>{
            // only update role for the ID that matches
            if (el == "Role" && values["ID"]==entry["ID"]){
              if (values[el.replace(" ","")]!=entry[el]){
                resource.data.push({
                  range: "Database!"+col[idx]+rowNum, 
                  values: [[values[el.replace(" ","")]]]
                })
                logArr.push([new Date().toLocaleString('en-US', {hour12: true}).toString(),values["submitterEmail"],"Update " + el + ". Old: " + entry[el] + ". New: " + values[el.replace(" ","")],entry["ID"]])
                // update listserv related to role
                if (listservDict[entry["ShortName"]+entry[el]]){ // remove old listserv
                  listservActions(values["EmailAddress"],entry["ID"],listservDict[entry["ShortName"]+entry[el]],"remove",entry["FirstName"] + " " + entry["LastName"],configDict)
                }
                if (listservDict[entry["ShortName"]+values[el.replace(" ","")]]){ // add new listserv
                  listservActions(values["EmailAddress"],entry["ID"],listservDict[entry["ShortName"]+values[el.replace(" ","")]],"add",entry["FirstName"] + " " + entry["LastName"],configDict)
                  // update database
                  resource.data.push({
                  range: "Database!"+"G"+rowNum, 
                  values: [[listservDict[entry["ShortName"]+values[el.replace(" ","")]]]]
                })
                }
              }
            }
            else if (el!="Role"){
              if (values[el.replace(" ","")]!=entry[el]){
                resource.data.push({
                  range: "Database!"+col[idx]+rowNum, 
                  values: [[values[el.replace(" ","")]]]
                })
                logArr.push([new Date().toLocaleString('en-US', {hour12: true}).toString(),values["submitterEmail"],"Update " + el + ". Old: " + entry[el] + ". New: " + values[el.replace(" ","")],entry["ID"]])
              }
            }
          })
        })
        addLogEvent(logArr)
        
      break;
      case "resolve":
        // filter for id
        var member = database.filter(row => row["ID"]==id)[0]
        var rowNum = parseInt(id)+1;
        Logger.log(`rowNum: ${rowNum}`)
        // write to logs
        addLogEvent([[new Date().toLocaleString('en-US', {hour12: true}).toString(),submitter,"Resolve Semi-Annual Updates",id]]);
        // update database
        resource.data.push({
          range: "Database!O"+rowNum, 
          values: [["Resolved"]]
        })
      break;
      default:
        // filter for id
        var member = database.filter(row => row["ID"]==id)[0]
        var rowNum = parseInt(id)+1;
        Logger.log(`rowNum: ${rowNum}`)
        // write to logs
        addLogEvent([[new Date().toLocaleString('en-US', {hour12: true}).toString(),submitter,(action=="add" ? "Reinstate" : "Remove") +" Member",id]]);
        // listserv
        if(member["ListServ"]!=""){
          listservActions(member["EmailAddress"],id,member["ListServ"],action,member["FirstName"] + member["LastName"],configDict)
        }
        // meeting
        if(member["GoogleCalendar"]!=""){
          calendarActions(member["EmailAddress"],id,member["GoogleCalendar"],action,configDict)
        }
        // update status
        resource.data.push({
          range: "Database!M"+rowNum, 
          values: [[(action=="add" ? "Active" : "Removed")]]
        })
    }
    Sheets.Spreadsheets.Values.batchUpdate(resource,databaseID)
    return {
      "code":"200 - success","msg":{"action":"new record added"}

    }
  } 
  catch (e) {
    Logger.log(e.message)
    // send email
    GmailApp.sendEmail("chantelle.lim@gsa.gov,rpaoffice@gsa.gov", "FRPC Dashboard Error", "Error: " + e.message + " Logs: " + logFileName)
    lock.releaseLock();
    return {

    }
    
  }
}
// *******************************************************************************************

// MEMBERSHIP FUNCTIONS

// *******************************************************************************************

// action = ADD / DELETE
function listservActions(email,id,listserv,action,name,configDict){
  Logger.log("listservActions: Start")
  Logger.log("Action: " + action + "Email: " + email + ". Name: " + name + ". Listserv: " + listserv)
  try {
    switch(action){
      case "add":
        var emailSubject = "Add ListServ"
        var nameList = email + " " + name;
        var body = 
          'QUIET ADD ' + listserv + ' DD=ddname'+'<br />'+
            '//ddname DD *'+'<br />'+
              nameList+
                '<br />/*'  
      break;
      case "remove":
        var emailSubject = "Remove ListServ"
        var body = 
          'QUIET DELETE ' + listserv + ' DD=ddname'+'<br />'+
            '//ddname DD *'+'<br />'+
              email+
                '<br />/*' 
      break;
    }
    
    var options = {};
    options.htmlBody = body;
    options.from = configDict["botEmail"]
    options.name = configDict["botName"]
    GmailApp.sendEmail(configDict["listservEmail"], emailSubject, body, options)
    Logger.log("Sent email to listserv")
    addLogEvent([[new Date().toLocaleString('en-US', {hour12: true}).toString(),configDict["botEmail"],emailSubject + ": " + listserv,id]]);
  }
  catch (e) {
    var error = e.message;
    Logger.log("Error: " + error)
    var logs = Logger.getLog();
    // send email
    var options={};
    options.htmlBody = "ListServ error.<br><br>Action: " + action + "<br>Email: " + email + "<br>Name: " + name + "<br>ListServ: " + listserv + "<br>Error: " + error + "<br>Logs: " + logs
    GmailApp.sendEmail([configDict["developerEmail"],configDict["rpaOfficeEmail"]], "FRPC RosterBot - ListServ Error","",options)
  }
  Logger.log("listservActions: End")
}

// Function: adds user to the google calendar event
function calendarActions(email,id,eventName,action,configDict){
    // GOOGLE CALENDAR 
      var calendar = CalendarApp.getCalendarById(configDict["GCalendarIDprod"]);
    var now = new Date();
    // 365 days ahead
    var monthFromNow = new Date(now.getTime() + (24*365 * 60 * 60 * 1000));
    var events = calendar.getEvents(now, monthFromNow);

    const maxTries = 3;
    Logger.log("calendarActions: Start")
    Logger.log("Email: " + email + ". Event: " + eventName)
    try {
      var entryFound = "false"
      // event loop
      events.forEach(event => {
        // if event name matches, get eventID and event object
        if (event.getTitle().trim() == eventName){
          entryFound = "true"
          Logger.log("Inside event: " + event.getTitle() + " " + event.getStartTime())
          var eventID = event.getId().split("@google.com")[0];
          var event = Calendar.Events.get(configDict["GCalendarIDprod"], eventID);
          var attendeeArr = event.attendees;
          switch(action){
            case "add":
              // if the event has attendees, look for the user's email in the attendee array
              if(event.attendees) {
                var foundEmail = event.attendees.filter(attendee => attendee.email.toLowerCase()==email.toLowerCase());
                event.attendees.push({
                  email: email
                });
                // if user's email does not exist in attendee array, add user to event. Code will try 3 times to add user to event, with a 10 second pause between each failure
                if (foundEmail.length<1){
                  Logger.log("Adding to event")
                  var currentTry = 0; 
                  while (currentTry<=maxTries) {
                    try {
                      Logger.log("current try: " + currentTry.toString())
                      event = Calendar.Events.patch(event, configDict["GCalendarIDprod"], eventID, {
                        sendUpdates: "all"
                      });
                      Logger.log("Sent calendar invite")
                      GmailApp.sendEmail(configDict["developerEmail"], "FRPC RosterBot - add2Calendar",  "Added " + email + " to event: " + eventName)
                      break;
                    }
                    catch(e){
                      Logger.log("inside catch")
                      currentTry = currentTry +1
                      Utilities.sleep(10000)
                      if(currentTry==maxTries){
                        throw new Error( e.message);
                      }
                    }
                  }
                }
              } 
              // if the event does not have any attendees, create attendee object, add user to event
              else {
                event.attendees = new Array({email: email});
                Logger.log("Adding to event")
                var currentTry = 0; 
                while (currentTry<=maxTries) {
                  try {
                    Logger.log("current try: " + currentTry.toString())
                    event = Calendar.Events.patch(event, configDict["GCalendarIDprod"], eventID, {
                      sendUpdates: "all"
                    });
                    Logger.log("Sent calendar invite")
                    GmailApp.sendEmail(configDict["developerEmail"], "FRPC RosterBot - add2Calendar",  "Added " + email + " to event: " + eventName)
                    break;
                  }
                  catch(e){
                    Logger.log("inside catch")
                    currentTry = currentTry +1
                    Utilities.sleep(10000)
                    if(currentTry==maxTries){
                      throw new Error( e.message);
                    }
                  }
                }
              }
            break;
            case "remove":
              // if the event has attendees, look for the user's email in the attendee array
              if(event.attendees) {
                event.attendees = attendeeArr.filter(attendee => attendee.email.toLowerCase()!=email.toLowerCase());
                var foundEmail = attendeeArr.filter(attendee => attendee.email.toLowerCase()==email.toLowerCase());
                // if user's email exists in attendee array, remove user from event. Code will try 3 times to add user to event, with a 10 second pause between each failure
                if (foundEmail.length>0){
                  var currentTry = 0; 
                  while (currentTry<=maxTries) {
                    try {
                      Logger.log("current try: " + currentTry.toString())
                      event = Calendar.Events.patch(event, configDict["GCalendarIDprod"], eventID, {
                        sendUpdates: "all"
                      });
                      Logger.log("Removed from event")
                      GmailApp.sendEmail(configDict["developerEmail"], "FRPC RosterBot - removeFromCalendar",  "Removed " + email + " from event: " + eventName + ".")
                      break;
                    }
                    catch(e){
                      Logger.log("inside catch")
                      currentTry = currentTry +1
                      Utilities.sleep(10000)
                      if(currentTry==maxTries){
                        throw new Error( e.message);
                      }
                    }
                  }
                }
              }
            break;
          }

        }
      })
      addLogEvent([[new Date().toLocaleString('en-US', {hour12: true}).toString(),configDict["botEmail"],action + " Google Calendar: " + eventName,id]]);
      SpreadsheetApp.flush();
    }
    catch(e){
    var error = e.message;
    Logger.log("Error: " + error)
    var logs = Logger.getLog();
    // send email
    var options={};
    options.htmlBody = "Google Calendar error.<br><br>Action: " + action + "<br>Email: " + email + "<br>Event: " + eventName + "<br>Error: " + error + "<br>Logs: " + logs
    GmailApp.sendEmail([configDict["developerEmail"],configDict["rpaOfficeEmail"]], "FRPC RosterBot - Google Calendar Error","",options)
    }
    
  Logger.log("calendarActions: end")
}


// *******************************************************************************************

// HELPER FUNCTIONS

// *******************************************************************************************

function addLogEvent(arr){
  SpreadsheetApp.openById(logSheetID).getSheetByName("Logs").insertRowsBefore(2,arr.length).getRange(2,1,arr.length,arr[0].length).setValues(arr);
  SpreadsheetApp.flush();
}

function queryData(queryString,spreadsheetID,sheetName,queryColumnLetterStart,queryColumnLetterEnd){
  if (queryColumnLetterStart){
    var qvizURL = 'https://docs.google.com/spreadsheets/d/' + spreadsheetID + '/gviz/tq?tqx=out:json&headers=1&sheet=' + sheetName + '&range=' + queryColumnLetterStart + ":" + queryColumnLetterEnd + '&tq=' + encodeURIComponent(queryString);
  }
  else {
    var qvizURL = 'https://docs.google.com/spreadsheets/d/' + spreadsheetID + '/gviz/tq?tqx=out:json&headers=1&sheet=' + sheetName + '&tq=' + encodeURIComponent(queryString);
  }
  // fetch the data
  var ret = UrlFetchApp.fetch(qvizURL, {headers: {Authorization: 'Bearer ' + ScriptApp.getOAuthToken()}}).getContentText();
  // remove some crap from the return string
  return JSON.parse(ret.replace("/*O_o*/", "").replace("google.visualization.Query.setResponse(", "").slice(0, -2));
}

function formatQueryResult(data){
  let myTableArray=[];
  let filteredHeaders = []
  for(let c =0;c<data.table.cols.length;c++){
    filteredHeaders.push(data.table.cols[c].label)
  }
  myTableArray.push(filteredHeaders)
  for(let r =0;r<data.table.rows.length;r++){
    var row = []
    let tmpRow = data.table.rows[r];
    for(let c = 0;c<tmpRow["c"].length;c++){
      if(tmpRow["c"][c]==null||tmpRow["c"][c]["v"]==null){row.push("");continue;}
      if(c == myTableArray[0].indexOf("Date") || c== myTableArray[0].indexOf("Database ID")){
        row.push(tmpRow["c"][c]["f"])
      }else{
        row.push(tmpRow["c"][c]["v"])
      }
      
    }
    myTableArray.push(row)
  }
  let colHeaders = myTableArray[0]
  myTableArray = getJsonArrayFromDataQuery(myTableArray,colHeaders)  
  return  myTableArray
}

function getJsonArrayFromDataQuery(data,headers){
  var obj = {};
  var result = [];
  var cols = headers.length;
  var row = [];
  for (var i = 1; i < data.length; i++)
  {
    // get a row to fill the object
    row = data[i];
    // clear object
    obj = {};
    for (var col = 0; col < cols; col++) 
    {
      // fill object with new values
      obj[headers[col]] = row[col];    
    }
    // add object in a final result
    result.push(obj);  
  }
  return result;  
}

function getJsonArrayFromData(data)
/**
 * input: 2D array w/ field names in first row
 * output: Array of JSON Objects
 */
{
  var obj = {};
  var result = [];
  var headers = data[0];
  var cols = headers.length;
  var row = [];
  for (var i = 1, l = data.length; i < l; i++)
  {
    // get a row to fill the object
    row = data[i];
    // clear object
    obj = {};
    for (var col = 0; col < cols; col++) 
    {
      // fill object with new values
      obj[headers[col]] = row[col];    
    }
    // add object in a final result
    result.push(obj);  
  }
  return result;  
}

function lockScript(){
  var lock = LockService.getScriptLock();
      var success = lock.tryLock(30000);
      if (!success) {
        Logger.log('Could not obtain lock after 30 seconds.');
      }
  return lock
}
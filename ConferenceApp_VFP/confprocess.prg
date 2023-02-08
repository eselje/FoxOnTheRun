************************************************************************
*PROCEDURE ConfProcess
****************************
***  Function: Processes incoming Web Requests for ConfProcess
***            requests. This function is called from the wwServer 
***            process.
***      Pass: loServer -   wwServer object reference
*************************************************************************
LPARAMETER loServer
LOCAL loProcess
PRIVATE Request, Response, Server, Session, Process
STORE NULL TO Request, Response, Server, Session, Process

#INCLUDE WCONNECT.H

loProcess = CREATEOBJECT("ConfProcess", loServer)
loProcess.lShowRequestData = loServer.lShowRequestData

IF VARTYPE(loProcess)#"O"
   *** All we can do is return...
   WAIT WINDOW NOWAIT "Unable to create Process object..."
   RETURN .F.
ENDIF

*** Call the Process Method that handles the request
loProcess.Process()

*** Explicitly force process class to release
loProcess.Dispose()

RETURN

*************************************************************
DEFINE CLASS ConfProcess AS WWC_PROCESS
*************************************************************

*** Response class used - override as needed
cResponseClass = [WWC_PAGERESPONSE]

*** Scriptmode used for any non-method hits
*** 1 - Classic Page Modes (Templates/Scripts) 
*** 2 - Web Control Framework Pages
nPageScriptMode = 1

*********************************************************************
* Function ConfProcess :: OnProcessInit
************************************
*** If you need to hook up generic functionality that occurs on
*** every hit against this process class , implement this method.
*********************************************************************
*!*	FUNCTION OnProcessInit

*!*	THIS.InitSession("wwDemo")

*!*	IF !THIS.Login("any")
*!*	   RETURN .F.
*!*	ENDIF

*!*	RETURN .T.
*!*	ENDFUNC


*********************************************************************
FUNCTION TestPage()
************************

THIS.StandardPage("Hello World from the ConfProcess process",;
                  "If you got here, everything should be working fine.<p>" + ;
                  "Time: <b>" + TIME()+ "</b>")
                  
ENDFUNC
* EOF ConfProcess::TestPage


*** Recommend you override the following methods:

*** ErrorMsg
*** StandardPage
*** Error


FUNCTION GetList(cTable)

* Our convention was the biz object name was 'cst'+ the table name
cTable = EVL(cTable, Request.cQueryString)

LOCAL oBizObj
oBizObj = CREATEOBJECT("cst"+cTable)
cJSONData = oBizObj.getList()
* THIS.StandardPage("Here is the list of " + cTable + " that you requested:",;
                  cJsonData)
Response.Write(cJSONData)


ENDDEFINE
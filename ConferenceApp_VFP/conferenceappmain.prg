************************************************************************
*FUNCTION ConferenceappMain
******************************
***   Created: 09/03/11
***  Function: Web Connection Mainline program. Responsible for setting
***            up the Web Connection Server and get it ready to
***            receive requests in file messaging mode.
************************************************************************

*** This is the file based start up code that gets
*** the server form up and running
#INCLUDE WCONNECT.H

*** PUBLIC flag allows server to never quit
*** - unless EXIT button code is executed
RELEASE goWCServer

SET TALK OFF
SET NOTIFY OFF

   *** Load the Web Connection class libraries
   DO WCONNECT

   *** Load the server - wc3DemoServer class below
   goWCServer = CREATE("ConferenceappServer")

   IF !goWCServer.lDebugMode   
     SET DEBUG OFF
     SET STATUS BAR OFF
     SET DEVELOP OFF
     SET SYSMENU OFF
   ENDIF

   IF TYPE("goWCServer")#"O"
      =MessageBox("Unable to load Web Connection Server",48,;
                  "Web Connection Error")
      RETURN
   ENDIF

   *** Make the server live - Show puts the server online and in polling mode
   READ EVENTS

ON ERROR
RELEASE goWCServer

SET SYSMENU ON
SET DEBUG ON
SET DEVELOP ON
SET STATUS BAR ON
SET TALK ON

RELEASE ALL
CLOSE DATA

*** USE THIS FOR DEBUGGING OBJECT HANGING - fires all outstanding DESTROY()
*** and you should see which objects are hanging
*SET STEP ON 
CLEAR ALL
*** END

IF Application.StartMode < 2
   ACTIVATE WINDOW COMMAND
ENDIF

RETURN


**************************************************************
****          YOUR SERVER CLASS DEFINITION                 ***
**************************************************************
DEFINE CLASS ConferenceappServer AS WWC_SERVER OLEPUBLIC
*************************************************************
***  Function: This is a subclass of the wwServer class
***            that is application specific. Each Web Connection
***            server you create *MUST* create a subclass of the
***            class and at least implement the Process and
***            SetServerEnvironment methods to  receive requests!
*************************************************************

*** Add any custom properties here
*** These can act as 'global' vars


************************************************************************
* ConferenceappServer :: OnInit
******************************************
***  Function: This method fires at the beginning of the server's
***            initialization sequence. It's fired from the Init
***            method and you can return .F. here to cause the
***            server to not load.
***
***            Use this method to setup any server configuration that
***            the server would need to configure itself, such as
***            pointing at the configuration file and configuring
***            the configuration object to use
***
***            THIS.cAppStartPath returns your application's startup
***            path as stored in the registry. If you need to override
***            this path in code you should do so here. This value
***            is used to SET DEFAULT TO in the Init(). You can
***            set this value on the WC Status form's Startup Path.
***
***    Assume: VIRTUAL METHOD - must ALWAYS be implemented!!!
************************************************************************
PROTECTED FUNCTION OnInit

*** Location of the startup INI file
THIS.cAppIniFile = addbs(THIS.cAppStartPath) + "Conferenceapp.ini"
THIS.cAppName = "Conferenceapp"

*** Custom Server Configuration object - created at bottom
*** wwServer::ReadConfiguration will read settings from INI
THIS.oConfig = CREATEOBJECT("ConferenceappConfig")
THIS.oConfig.cFileName = THIS.cAppIniFile

*** If you need to override your application's startup path
*** to something other than the current directory do it here:
*** THIS.cAppStartPath = <your custom path>

ENDFUNC
* OnInit


************************************************************************
* ConferenceappServer :: OnLoad
****************************************
***  Function: This Method should be used to set any server properties
***            and any relative paths. At this time the server has
***            changed directories to its startup path, so it's safe
***            to set relative paths from here.
***
***            This code runs just prior to showing the server window.
************************************************************************
PROTECTED FUNCTION OnLoad

*** This URL is executed when clicking on the Automation Server
*** Form's Exit button. It forces operation through a browser!
THIS.cCOMReleaseUrl=THIS.oConfig.cComReleaseUrl

*** Any settings you want to make to the server
IF THIS.lShowServerForm
  THIS.oServerForm.Caption =This.cServerId + " - Web Connection " + WWVERSION
ENDIF

*** Add persistent SQL Server Connection
#IF WWC_USE_SQL_SYSTEMFILES
    THIS.AddProperty("oSQL", CREATE("wwSQL"))
    IF !THIS.oSQL.Connect(THIS.oConfig.cSQLConnectString)
	   MESSAGEBOX("Couldn't connect to SQL Service. Check your SQL Connect string in the INI file.",48,"Web Connection")
	   CANCEL
    ENDIF
#ENDIF

*** Add any data paths - SET DEFAULT has already occurred so this is safe!
* DO PATH WITH THIS.cAppStartPath + "TOOLS\"

*** Add any SET CLASSLIB or SET PROCEDURE code here
SET CLASSLIB TO ConferenceBizObjects ADDITIVE

ENDFUNC
* OnLoad


************************************************************************
* ConferenceappServer :: Process
******************************
***  Function: This procedure's main purpose is to route incoming
***            requests to individual project PRGs/APPs.
***
***            Routings should be set up for both parameterized
***            urls (wc.dll?Process~Method~Parm1) and scriptmaps
***            (Method.map?Parm1=Value)
************************************************************************
PROTECTED FUNCTION Process
LOCAL lcParameter, lcExtension, lcPhysicalPath

*** Retrieve first parameter
lcParameter=UPPER(THIS.oRequest.Querystring(1))

*** Set up project types and call external processing programs:
DO CASE

     CASE lcParameter == "CONFPROCESS"
         DO ConfProcess with THIS

      *** SUB APPLETS ADDED ABOVE - DO NOT MOVE THIS LINE ***

     CASE lcParameter == "WWMAINT"
        DO wwMaint with  THIS
OTHERWISE
     *** Check for Script Mapped files for: .WC, .WCS, .FXP
     lcExtension = Upper( JustExt(THIS.oRequest.GetPhysicalPath() ) )

     DO CASE
    CASE lcExtension == "SWFOX"
         DO ConfProcess with THIS

     *** ADD SCRIPTMAP EXTENSIONS ABOVE - DO NOT MOVE THIS LINE ***

     *** Default Web Connection script handling
     CASE lcExtension == "WC" OR lcExtension == "WCS" OR lcExtension == "FXP"
        DO wwScriptMaps with THIS

     *** Web Connection Page Framework Handler
     CASE lcExtension == "WCSX" OR lcExtension == "ASPX"
        DO wwWebPageHandler WITH THIS

     *** Web Connection SOAP/Web Service Handler
     CASE lcExtension == "WWSOAP"
        DO wwDefaultWebService with THIS
       

     OTHERWISE
         *** Error - No handler available. Create custom
	     Response=CREATE([WWC_RESPONSESTRING])
	     Response.StandardPage("Unhandled Request",;
	                       "The server is not setup to handle this type of Request: "+ FixHtmlForDisplay(lcParameter))

	     IF THIS.oConfig.lAdminSendErrorEmail
	       LOCAL loIP
           loIP = CREATE("wwIPStuff")
		   loIP.cMailServer = THIS.oConfig.cAdminMailServer
		   loIP.cSenderEmail = THIS.oConfig.cAdminEmail
		   loIP.cRecipient = THIS.oConfig.cAdminEmail
		   loIP.cSubject = "Web Connection Error Message - Unhandled request"
		   loIP.cMessage = CRLF + ;
	           "The request Query String is: " +THIS.oRequest.QueryString() + CRLF +;
	           "              DLL or Script: " +THIS.oRequest.ServerVariables("Executable Path") + CRLF+;
	           "                Server Name: " + THIS.oRequest.GetServerName() + CRLF + ;
	           "                 IP Address: " + THIS.oRequest.GetIPAddress()

           *** Send and immediately return
           loIP.SendMailAsync()
         ENDIF

	     IF THIS.lCOMObject
	         *** Simply assign to output property
	         THIS.cOutput=Response.GetOutput()
	     ELSE
	         *** FileBased - must output to file
	         File2Var(THIS.oRequest.GetOutputFile(),Response.GetOutput())
	     ENDIF
	 ENDCASE

ENDCASE

RETURN

ENDDEFINE
* EOC Conferenceapp


***************************************************************
DEFINE CLASS ConferenceappConfig AS wwServerConfig
***************************************************************
*: Author: Rick Strahl
*:         (c) West Wind Technologies, 1999
*:Contact: http://www.west-wind.com
*******&&******************************************************
#IF .F.
*:Help Documentation
*:Topic:
Class Conferenceapp

*:Description:
This class is used as a global configuration object to
contain application global data that persists for the
lifetime of the server.

Optionally you can have sub-application objects for each
Process class implementation.
*:ENDHELP
#ENDIF
****************************************************************

oConfProcess = .NULL.

*** ADD CONFIG OBJECT TO CLASS ABOVE - DO NOT MOVE THIS LINE ***
owwMaint = .NULL.
owwWebPageHandler = .NULL.

FUNCTION Init

THIS.oConfProcess = CREATEOBJECT("ConfProcessConfig")

*** ADD CONFIG INIT CODE ABOVE - DO NOT MOVE THIS LINE ***

THIS.owwMaint = CREATEOBJECT("wwMaintConfig")
THIS.owwWebPageHandler = CREATEOBJECT("wwWebPageHandlerConfig")
ENDFUNC

ENDDEFINE
*EOC ConferenceappConfig


DEFINE CLASS wwMaintConfig as RELATION

cHTMLPagePath = "C:\inetpub\wwwroot\ConferenceApp\"
cDATAPath = ".\"
cVirtualPath = "/ConferenceApp/"

ENDDEFINE

DEFINE CLASS wwWebPageHandlerConfig as RELATION

cHTMLPagePath = "C:\inetpub\wwwroot\ConferenceApp\"
cDATAPath = ".\"
cVirtualPath = "/ConferenceApp/"

ENDDEFINE



*** Configuration class for the ConfProcess Process class
DEFINE CLASS ConfProcessConfig as wwConfig

cHTMLPagePath = "C:\inetpub\wwwroot\ConferenceApp\"
cDATAPath = ""
cVirtualPath = "/ConferenceApp/"

ENDDEFINE

*** ADD PROCESS CONFIG CLASSES ABOVE - DO NOT MOVE THIS LINE ***





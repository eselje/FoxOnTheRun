<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML//EN">
<%@  language="VBScript" %>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="westwind.css">
    <title>Web Connection Adminstration</title>
</head>
<%
  lcPhysical = Request.ServerVariables("PATH_TRANSLATED")
  lnLastSlash = 0
  lnSlash = 1
  lnStart = 1
  do while lnSlash > 0
    lnSlash =  Instr(lnLastSlash+1,lcPhysical,"\")
    if lnSlash > 0 Then
       lnLastSlash = lnSlash
    end if
  LOOP
  lcPhysical = LEFT(lcPhysical,lnLastSlash -1)
%>
<body bgcolor="#FFFFFF">
    <table border="0" cellpadding="5" class="body">
        <tr>
            <td align="center" colspan="2">
                <small><a href="default.htm">Web Connection Demo Page</a></small></td>
        </tr>
        <tr>
            <td align="center" colspan="2" class="gridbanner">
                Web Connection ServerMaintenance</td>
        </tr>
        <tr>
            <td valign="top" width="50%">
                <div class="containercontent">
                <h2>
                    Web Connection Server Maintenance</h2>
                <ul>
                    <li><b><a href="wc.wc?wwmaint~showlog">Show Web Connection Server Hit Log</a></b>
                        <ul type="square">
                            <li><b><a href="wc.wc?wwmaint~showlog~Error">Show Server Error Log</a></b></li>
                            <li><b><a href="wc.wc?wwMaint~ClearLog~NoBackup">Clear the Log to today's
                                date</a></b></li>
                            <li><b><a href="wc.wc?wwMaint~wcDLLErrorLog">Show ISAPI Error Log</a></b><br>
                                </li>
                       </ul>
                </ul>
                <ul>
                    <li><b><a href="wc.wc?wwMaint~ServerStatus">Edit Web Connection Server Settings</a></b>
                        <font size="1">(IE)</font><ul type="square">
                            <li><b><a href="wc.wc?wwmaint~ShowStatus">Quick View of settings</a></b></li>
                            <li><b><a href="wc.wc?wwMaint~EditConfig">Edit Configuration Files</a></b><br>
                                </li>
                        </ul>
                    </li>
                </ul>
                <ul>
                    <li><b><a href="wc.wc?wwMaint~ReindexSystemFiles">Reindex Web Connection System
                        Files</a></b></li>
                    <li><b><a href="wc.wc?wwDemo~Reindex">Reindex Web Connection Demo Files</a></b><br />
                        </li>
                    <li><b><a href="wc.wc?wwmaint~UpdateWebResources">Update Web Resources to Latest 
            Version</a></b><br />
            <small>Note: Requires that the scripts and templates folders below the Web Connection 
            install folder are up to date of the latest version. Will copy the latest versions of 
            images, scripts and dlls to the web folder.</small><br/>
                        </li>
                </ul>
                <ul>
                    <li>
                        <form method="POST" action="wc.wc?wwmaint~CompileWCS">
                            <p>
                                <b>Change Script Mode:</b><a href="wc.wc?wwMaint~ScriptMode~Interpreted">
                                    Interpreted</a>&nbsp; <a href="wc.wc?wwMaint~ScriptMode~PreCompiled">PreCompiled</a><br>
                                <b>Compile WCS script pages</b><br>
                                Requires the VFP development version installed on the server<br>
                                <input type="text" name="txtFileName" value="<%= lcPhysical%>\*.wcs" size="30">
                                <input type="submit" value="Compile" name="btnSubmit"></p>
                        </form>
                </ul>
                </div>                
            </td>
            <td valign="top" width="50%">
                <div class="containercontent">
                <h2>
                    General DLL Methods</h2>
                <ul>
                    <li><b><a href="wc.wc?_maintain~ShowStatus">Show and Manage ISAPI Settings</a></b><br>
                        <small>Shows the status of the DLL flags, lets you switch from File to COM operation, shows
                        all instances of the server loaded under Com and the current state of the HoldRequests
                        flag.</small><br>
                        &nbsp;</li>
                    <li><b><a href="wc.wc?_maintain~UpdateExe">Update Code online</a></b><br>
                        <small>Update the EXE file online with an uploaded file as specified by the <i>ExeFile</i>
                        and <i>UpdateFile</i> keys in wc.ini.Make sure you've uploaded the file first. You
                        can FTP or copy the file directly or use the link below.</small><br>
                        &nbsp;<form action="wc.wc?wwMaint~FileUpload" method="POST" enctype="multipart/form-data">
                            <b>Upload file: </b>
                            <input type="FILE" name="File" size="20">
                            <input type="submit" value="Upload" />
                            <br>
                            <small>Note: the uploaded file goes into the Temp directory on the server. Use the <i>UpdateFile</i>
                            key in wc.ini to configure the location and name of the uploaded file.</small><p>
                            </p>
                        </form>
                        <br />
                    </li>
                    <li><b><a href="wc.wc?wwMaint~RebootMachine">Reboot Machine</a> | <a href="wc.wc?wwMaint~RebootMachine~&RestartOnly=yes">
                        Restart IIS</a></b><br>
                        <i><small>Note: Requires IIS5 or later.</font></i> <i><font size="1">For reboot
                            make sure your server can fully restart without manual interaction or logons.</small></i>
                    </li>
                </ul>
                </div>
            </td>
        </tr>
    </table>
    <br />
    <hr />    
    <a href="http://www.west-wind.com/" target>
    <img src="images/wcpower.gif" align="left" hspace="5" border="0" width="120" height="35"></a>
</body>
</html>

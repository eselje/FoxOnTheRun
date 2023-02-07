// wwScriptLibrary.js
// Version 2.4
// © West Wind Technologies, 2004-2008
function wwHoverPanel(Control,Url)
{
	var _I = this;
	this.element = Control;
	if (typeof(Control) == "string")
		this.element=$w(Control);
	this.isNull = true;
	if (this.element != null) { 
		this.controlId = this.element.id;
		this.isNull = false;
	}
	var _Obj = $ww(this.element);
	this.htmlTargetClientId = this.controlId;	
	this.serverUrl = Url;
	this.queryString = "";	
	this.eventHandlerMode = "ShowHtmlAtMousePosition";
	this.postbackMode = "Get";
	this.callbackHandler = null;
	this.callbackErrorHandler = null;
	this.hoverOffsetRight = 0;
	this.hoverOffsetBottom = 0;
	this.panelOpacity = 1;
	this.shadowOffset = 0; 
	this.shadowOpacity = 0.25;
	this.adjustWindowPosition = true;
	this.navigateDelay = 0;
	this.lastMouseTop = 0;
	this.lastMouseLeft = 0;
	this.busy = -1;
	this.Http = null;

	this.startCallback = function(e,queryString,postData,errorHandler)
	{
		try {
			var key = new Date().getTime();
			_I.busy = key;

			var Url= this.serverUrl;
			if (e)
			{
				_I.lastMouseTop = e.clientY;
				_I.lastMouseLeft = e.clientX;
			}
			else
			{ _I.lastMouseTop = 0;}

			if (queryString == null) {
				queryString = "";
				_I.queryString = "";				
			}
			else
				_I.queryString = queryString;

			if (errorHandler)
				  _I.callbackErrorHandler = errorHandler;

			if (queryString)
				queryString += "&";
			else
				queryString = "";
			queryString += "__WWEVENTCALLBACK=" + _I.controlId;

			_I.Http = new wwHttp();
    		_I.Http.appendHeader("RequestKey",key);

			if (postData)
				postData += "&";

			if (_I.postbackMode == "Post")
				postData += _wwUtils.encodeFormVars(_I.formName);
			else if(this.postbackMode == "PostNoViewstate")
				postData += _wwUtils.encodeFormVars(_I.formName,true);
            else if (this.postbackMode == "Get" && postData)
				queryString += postData;

			if (queryString != "")
			{
				if (Url.indexOf("?") > -1)
					Url = Url + "&" + queryString
				else
					Url =	Url + "?" + queryString;
			}

			if (_I.eventHandlerMode == 'ShowIFrameAtMousePosition' ||
				_I.eventHandlerMode == 'ShowIFrameInPanel')
			 {			      
				  setTimeout(function() { if (_I.busy) _I.showIFrame.call(_I,Url); },_I.navigateDelay);
				  return;
			 }
            
			if (_I.navigateDelay > 0)			    
				setTimeout(function() {if (_I.busy == key) _I.Http.send.call(_I,Url,postData,_I.onHttpCallback,_I.onHttpCallback);},_I.navigateDelay);
            else
				_I.Http.send(Url,postData,_I.onHttpCallback,_I.onHttpCallback);
		}
		catch(e)
		{
			_I.onHttpCallback(new CallbackException(e.message));
		}
	}

	this.onHttpCallback = function(Result)
	{
		_I.busy = -1;
		
		if (_I.Http && _I.Http.status && _I.Http.status != 200)
			Result = new CallbackException(Http.statusText);
		if (Result == null)
			Result = new CallbackException("No output was returned.");

		if (Result.isCallbackError)
		{
			if (_I.callbackErrorHandler)
			{
				_I.callbackErrorHandler(Result);
				return;
			}
			return;
		}
		_I.displayResult(Result);
	} 

	this.displayResult = function(Result)
	{
		if (_I.callbackHandler && _I.callbackHandler(Result,_I) == false)
			return;			
		if (_I.eventHandlerMode == "ShowHtmlAtMousePosition")
		{		
			_I.assignContent(Result);			
			_I.movePanelToPosition(_I.lastMouseLeft + _I.hoverOffsetRight,_I.lastMouseTop + _I.hoverOffsetBottom);			
			_I.show();
		}
		else if (_I.eventHandlerMode == "ShowHtmlInPanel" )
		{			
			_I.assignContent(Result); 			
			_I.show(); 
		}
	}
	this.movePanelToPosition = function(x,y)
	{
		try
		{
			var Panel = _I.element;
			Panel.style.position = 'absolute';

			if (typeof(x)=="object")
			{
				_I.lastMouseTop = x.clientY;
				_I.lastMouseLeft = x.clientX;
			}
			else if (typeof(x)=="number")
			{
				_I.lastMouseTop = y;
				_I.lastMouseLeft = x;
			}
			
			var Left = _I.lastMouseLeft + 3;
			var Top = _I.lastMouseTop + 3;
			_Obj.setLocation(Left,Top,true);

			if (_I.adjustWindowPosition && document.body)
			{
				var mainHeight = 0;
				if( typeof( window.innerWidth ) == 'number' )
					mainHeight = window.innerHeight;
				else if( document.documentElement && document.documentElement.clientHeight )
					mainHeight = document.documentElement.clientHeight;
				else if( document.body && document.body.clientHeight )
					mainHeight = document.body.clientHeight;

				if ( mainHeight < Panel.clientHeight )
					Top = 0;
				else
				{
					if ( mainHeight < _I.lastMouseTop + Panel.clientHeight )
						Top = mainHeight - Panel.clientHeight - 10;
				}

				var mainWidth = 0;
				if( typeof( window.innerWidth ) == 'number' )
					mainWidth = window.innerWidth;
				else if( document.documentElement && document.documentElement.clientWidth )
					mainWidth = document.documentElement.clientWidth;
				else if( document.body && document.body.clientWidth )
					mainWidth = document.body.clientWidth;

				if ( mainWidth < Panel.clientWidth )
					Left = 0;
				else
				{
					if ( mainWidth < _I.lastMouseLeft + Panel.clientWidth )
						Left = mainWidth - Panel.clientWidth - 25 ;
				}
				_Obj.setLocation(Left,Top,true);
			}
			if (_I.shadowOffset != 0)
				_Obj.showShadow(_I.shadowOpacity,_I.shadowOffset,true);
		}
		catch( e )
		{ window.status ='Moving off window failed: '+ e.message;}
	}
	this.showIFrame = function(Url)
	{
		_I.busy = false;
		Url = Url ? Url : _I.serverUrl;
		$w(_I.controlId + '_IFrame').src= Url;
		if (_I.eventHandlerMode == "ShowIFrameAtMousePosition")
		{
			 _I.show();
			 _I.movePanelToPosition(_I.lastMouseLeft + _I.hoverOffsetRight,_I.lastMouseTop + _I.hoverOffsetBottom);
		}
		else
			 _I.show();
	}
	this.hide = function()
	{
		_I.busy = -1;
		if (_I.shadowOffset > 0)
			_Obj.hideShadow();
		else
			_Obj.hide();
	}
	this.abort = function(){_I.busy=-1; }
	this.show = function()
	{			
		_Obj.setOpacity(_I.panelOpacity);
		_Obj.show();
		if (_I.shadowOffset > 0)
			_Obj.showShadow(_I.shadowOpacity,_I.shadowOffset);
	}
	this.fadeout = function(Step)
	{		
	    if (_I.shadowOffset > 0)
	        _Obj.shadowOffset = _I.shadowOffset;	        
		_Obj.fadeout(_I.panelOpacity,Step,true);
	}
	this.fadein = function(Step)
	{		
		_Obj.fadein(Step,.05,_I.panelOpacity);
	}
	this.assignContent = function(Result)
	{
		var Panel = $ww(_I.htmlTargetClientId);
		Panel.setHtml(Result);		
	}
}

function wwCallbackMethod(ControlId,Url) {
	var _I = this;

	this.method = "";
	this.arguments = [];
	this.targetControlId = "Page";
	this.controlId = ControlId;
	this.postbackMode = "PostMethodParametersOnly";
	this.serverUrl = Url;
	this.formName = null;

	this.callbackFunction = null;
	this.errorCallbackFunction = null;

	this.Http = null;

	this.callMethod = function(MethodName,Parameters,Callback,ErrorCallback)
	{
		_I.callbackFunction = Callback;
		_I.errorCallbackFunction = ErrorCallback;

		_I.Http = new wwHttp();
		var Data = "CallbackMethod=" + MethodName + "&";

		var ParmCount = 0;
		if (Parameters.length)
		{
			ParmCount = Parameters.length;
			for (var x = 0; x < ParmCount; x++)
			{Data +="Parm" + (x+1).toString() + "=" + _wwUtils.encodeValue(JSON.serialize(Parameters[x]).toString()) + '&';}
		}
		Data += "CallbackParmCount=" + ParmCount.toString() + "&__WWEVENTCALLBACK=" + this.controlId +
                "&__WWEVENTTARGET=" + this.targetControlId + "&";

		if (_I.postbackMode == "Post")
			Data += _wwUtils.encodeFormVars(_I.formName);
		else if(_I.postbackMode == "PostNoViewstate")
			Data += _wwUtils.encodeFormVars(_I.formName,true);
		else if(this.postbackMode == "Get")
		{
            Url = this.serverUrl;
            if (Url.indexOf('?') > -1)
                Url += Data;
            else
                Url += "?" + Data;

            return this.Http.send(Url,null,_I.onHttpCallback,_I.onHttpCallback);
		}

		return this.Http.send(this.serverUrl,Data,_I.onHttpCallback,_I.onHttpCallback);
	}

	this.onHttpCallback = function(Result)
	{			
		if (Result.isCallbackError) 
		{			
			if (_I.errorCallbackFunction)
				_I.errorCallbackFunction(Result,_I);
			return;
		}
		var FinalResult = null;
		try 
		{
			FinalResult = JSON.parse(Result);
		}
		catch(e)
		{
			FinalResult = new CallbackException(e);
		}
		if (FinalResult && FinalResult.isCallbackError)
		{
			if (_I.errorCallbackFunction)
				_I.errorCallbackFunction(FinalResult,_I);
			return;
		}
		if (_I.callbackFunction != null)
			_I.callbackFunction(FinalResult,_I);
			
	}
}

// *** Class wwHttp
function wwHttp() {
	var _I = this;
	var _InCall = false;

	this.Http = null;
	this.callbackFunction = null;
	this.errorCallbackFunction = null;
	this.errorMessage = "";
	this.async = true;
	this.evalResult = false;
	this.contentType = "application/x-www-form-urlencoded";
	this.method = null;
	this.headers = {};

	this.appendHeader = function(Header,Value)
	{
		_I.headers[Header] = Value;
	}
	this.send = function(Url,PostData,CallbackFunction,ErrorCallbackFunction)
	{
		if (CallbackFunction)
			_I.callbackFunction = CallbackFunction;
		if (ErrorCallbackFunction)
			_I.errorCallbackFunction = ErrorCallbackFunction;
		try
		{
			_I.Http = _I._getXmlHttp();
			if (_I.Http == null) {
				_I.errorMessage = "Couldn't create XmlHttp Object";
				return false;
			}
			if (CallbackFunction)
				_I.Http.onreadystatechange = _I._onReadyStateChange; 

			if (PostData)
			{
				_I.Http.open("POST",Url,_I.async);
				_I.appendHeader("Pragma","no-cache");
				_I.appendHeader("Content-type",_I.contentType);
				_I.appendHeader("Content-length",PostData.length.toString() );
			}
			else
			{				
			    // Allow for empty POST data - for some service that require POST for all requests
			    if (_I.method) 
			    {
			        _I.Http.open(_I.method,Url,_I.async);
			        if (_I.contentType)
			            _I.appendHeader("Content-type",_I.contentType);
			    }
			    else
                    _I.Http.open( "GET",Url,_I.async);
				
				_I.appendHeader("Pragma","no-cache");
			}
			for(var Header in _I.headers)
				_I.Http.setRequestHeader(Header,_I.headers[Header]);
				
			_I.Http.send(PostData);
			_I.Headers = {};
		}
		catch( e )
		{
			if (typeof(e) == "string")
				_I.errorMessage = "XmlHttp Error: " + e;
			else
				_I.errorMessage = "XmlHttp Error: " + e.message;

			_I.returnError(_I.errorMessage);
			return false;
		}
		return true;
	}
	this._onReadyStateChange = function()
	{
		if (_I.Http == null || _I.Http.readyState != 4)
			return;

		var ErrorException = null;
		var Result = _I.Http.responseText;			
		
		if (_I.Http.status != 200) {		
			if (Result && Result.charAt(0)=='{')
			    ErrorException = JSON.parse(Result); 
			 else
			    ErrorException = new CallbackException(_I.Http.statusText); 
        }
       
		if (_I.evalResult){
    		try{
    		    Result = JSON.parse(Result); 
    		    if ( Result.d && Result.d.__type)    
    		        Result = Result.d;    		
    		    if ( Result.isCallbackError)
    		        ErrorException = Result;  // 'force an error'    
    		}
    		catch(e) { ErrorException = new CallbackException(e); }		
        }

		if (ErrorException)
		{
				 if (_I.errorCallbackFunction)
						 _I.errorCallbackFunction(ErrorException,_I);
				 return;
		}		
		
		if (_I.callbackFunction)
			_I.callbackFunction(Result,_I);
			
		_I.Http = null;
	}
	this._getXmlHttp = function()
	{
		var Http = null;
		if (typeof(XMLHttpRequest) != _ud)
			Http = new XMLHttpRequest();
		else
		{
			try
			{ Http = new ActiveXObject("Msxml2.XMLHTTP");}
			catch (e)
			{
				try
				{ Http = new ActiveXObject("Microsoft.XMLHTTP"); }
				catch (e) {}
			}
		}
		return Http;
	}

	this.returnError = function(Message)
	{
		 var ErrorException = new CallbackException(Message);
		 if (_I.errorCallbackFunction)
		 _I.errorCallbackFunction(ErrorException,_I);
	}
}
function ajaxRequest(url,post,callback,errorCallback)
{    
    if (post && post.toLowerCase() == "formdata")
       post = _wwUtils.encodeFormVars(null,true);     
    new wwHttp().send(url,post,callback,errorCallback);
}
function ajaxLoadHtml(url,post,domElement,errorCallback)
{
    if (post && post.toLowerCase() == "formdata")
       post = _wwUtils.encodeFormVars(null,true);
    new wwHttp().send(url,post,function(result) { $ww(domElement).setHtml(result) },errorCallback);
}
function ajaxJson(url,parm,callback,errorCallback, options)
{
    var Http = new wwHttp();
    Http.evalResult = true;    
    var ser = parm;        
    options = options || {method: "POST",contentType:"application/json",noPostEncoding:false};
    Http.method = options.method || "POST";
    Http.contentType = options.contentType || "application/json";
    
    if (!options.noPostEncoding && options.method=="POST")
         ser = JSON.serialize(parm);
    
    Http.send(url,ser,callback,errorCallback);
}
function jsonp(url,callback,query)
{                
    if (url.indexOf("?") > -1)
        url += "&jsonp=" 
    else
        url += "?jsonp=" 
    url += callback["name"] + "&";
    if (query)
        url += encodeURIComponent(query) + "&";   
    url += new Date().getTime().toString();         
    
    var script = document.createElement("script");        
    script.setAttribute("src",url);
    script.setAttribute("type","application/x-javascript");                
    document.body.appendChild(script);
}

// *** shortcut for document.getElementById
function $w(ControlId)
{
    if (typeof(ControlId) == "object")
	    return ControlId;

    var Ctl = document.getElementById(ControlId);
    if (Ctl == null)
	    return null;

    return Ctl;
}
// *** Also map $()
if (typeof($) != "function")
{ window.$ = function(ControlId) { return $w(ControlId); } }
function wwControl(Control) {
	var _Ctl = Control;
	var _I = this;

	if (typeof(Control) == "string")
		_Ctl=$w(Control);

	this.isNull = true;
	if (_Ctl != null)
	{
		this.id = _Ctl.id;
		this.element = _Ctl;
		this.control = _Ctl;
		this.isNull = false;
	}
	this.shadowOffset = 5;
	this.stopAni = true;
	
	this.getLocation = function(ReturnClient)
	{
		var el = _I.element;	    
		var x = el.offsetLeft; 
		var y = el.offsetTop;
		if (!ReturnClient)
			return { x: x, y: y };	    

		var scroll = _wwUtils.getScrollPosition();
		return { x: x - scroll.scrollLeft, y: y - scroll.scrollTop };	    
	}	
	this.setLocation = function(x,y,AddScroll) {
		var Ctl = _Ctl;
		if (typeof(x) == "object") {
			y = x.y; x = x.x;
		}
		
		if (AddScroll==true) {
			var scroll = _wwUtils.getScrollPosition();
			x = x + scroll.scrollLeft;
			y = y + scroll.scrollTop;
		}
		
		Ctl.style.display="";
		Ctl.style.position="absolute";
		Ctl.style.left = x + "px";
		Ctl.style.top = y + "px";
		
		var Shadow = $w(Ctl.id + 'Shadow');
		if (Shadow)
		   _I.showShadow();
	}
	this.getBounds = function(ReturnClient) {
		var element = _Ctl;        
		var offset = _I.getLocation(ReturnClient);
		var width = element.offsetWidth;
		var height = element.offsetHeight;
		return { x: offset.x, y: offset.y, width: width, height: height };
	}
	this.setBounds = function(x,y,width,height) {
		if (typeof(x)=="object") {
			width = x.width;
			height = x.height;
		}
	    _I.setLocation(x,y);
	    if (width > -1)
		    _Ctl.style.width = width + "px";
	    if (height > -1)
		    _Ctl.style.height = height + "px";
	}
    this.centerInClient = function() {
        var Box = _I.element;
        var Scroll = _wwUtils.getScrollPosition();
        
        var Doc = document.documentElement;
        var width = window.innerWidth?window.innerWidth : Doc.offsetWidth;
        var height = window.innerHeight?window.innerHeight : Doc.offsetHeight;
        var x = width /2 - Box.clientWidth / 2;
        var y = height / 2.2 - Box.clientHeight / 2;
        
        _I.setLocation(x + Scroll.scrollLeft,y +Scroll.scrollTop);
    }
	this.setText = function(Text) {
		if (_Ctl.value != null)
			_Ctl.value = Text;
		else
			if (_Ctl.innerText != null)
				_Ctl.innerText = Text;
			else if(_Ctl.textContent != null);
				_Ctl.textContent = Text;
	}
	this.setHtml = function(Html) {
		if (_Ctl.innerHTML != null)
			_Ctl.innerHTML = Html;
	}
	this.getText = function() {
		if (_Ctl.value)
			return _Ctl.value; 
		else
			if (_Ctl.innerText != null)
				return _Ctl.innerText;
			else if(_Ctl.textContent != null);
				return _Ctl.textContent;
	}    	
		this.getOpacity = function()
	{	
        if (_Ctl.filters)  {
            var f = _Ctl.style.filter;
            var matches = f.match(/opacity=[\"\']\d{1,3}[\"\']/);
            if (matches) {
                var t = matches[0].replace('opacity=','');
                return t.substring(1,t.length-1) / 100.0;
            }
        }        
        else if (_Ctl.style.opacity) { 
            var Op=_Ctl.style.opacity;
            if (Op)
                return parseFloat(_Ctl.style.opacity);
        }
        return 1;	     
	}
    this.setOpacity = function(Percent) {		
	    if(_Ctl.filters)
		    _Ctl.style.filter = "alpha(opacity='" + (Percent * 100).toFixed() + "')";
	    else 
		    _Ctl.style.opacity = Percent;        
    }
	this.show = function(Opacity) {
		_I.stopAni = true;		
		var Shadow = $w(_Ctl.id + 'Shadow');
	    if (Shadow) 
	        _I.showShadow();			

		_Ctl.style.display = '';
		_Ctl.style.visibility = 'visible';
		if (Opacity != null) { 
		    Opacity = (typeof(Opacity)!="number")?1:Opacity;
			_I.setOpacity(Opacity);
		}
	}
	this.hide = function(KeepPlaceholder) {
	    _I.stopAni = true;
		var Shadow = $w(_Ctl.id + 'Shadow');
		if (Shadow) {
		   _I.hideShadow();
		   return;
		}
	   
		if (KeepPlaceholder)
			_Ctl.style.visibility = 'hidden';
		else
			_Ctl.style.display = 'none';		
	}
	this.fadeout = function(HideOnZero,Step,Percent,UseVisibility) {
	    _I.stopAni = false;
	    var Shadow = $ww(_Ctl.id + 'Shadow');
	    if (!Shadow.isNull) 
	        Shadow.hideShadow();
	    _I._fadeout(HideOnZero,Step,Percent,UseVisibility);
	}
	this._fadeout = function(HideOnZero,Step,Percent,UseVisibility) {
		if (_I.stopAni) return;
		if (HideOnZero == null)
			HideOnZero = false;
		if (Step == null)
			Step = 6;
		if (Percent == null)
			Percent = 1;
	
		if (Percent <= 0.00 && HideOnZero == true)
		{
			if (UseVisibility)
				_Ctl.style.visibility = 'hidden';
			else
		    _Ctl.style.display='none';
			_I.setOpacity(1);
		    return;
	    }
	    _Ctl.style.display='';
	    _Ctl.style.visibility='visible';

	    _I.setOpacity(Percent);

	    if (Percent <= 0.00)
	    {
		    _I.setOpacity(0);
		    return;
	     }
	    Percent = Percent	- (Step / 100);
	    setTimeout(function() { _I._fadeout.apply(_I,[ HideOnZero,Step,Percent, UseVisibility]) },30);
	}
	this.fadein = function(Step,Percent,FinalPercent) {
	    _I.stopAni = false;
	    _I._fadein(Step,Percent,FinalPercent);
	}
	this._fadein = function(Step,Percent,FinalPercent) {
	    if (_I.stopAni) return;	    
        if (Step == null)
		    Step = 4;
	    if (Percent == null)
		    Percent = .01;
	    if (FinalPercent == null)
		    FinalPercent = 1;

	    _Ctl.style.visibility = 'visible';
	    _Ctl.style.display='';
		 _I.setOpacity(Percent );
		     
	    if (Percent >= FinalPercent)
		     return;

	    Percent = Percent + (Step/100);
	    setTimeout( function() { _I._fadein.apply(_I,[Step,Percent,FinalPercent]); }, 30 );
	}
	this.showShadow = function(Opacity,Offset,DelayShadow) {
		if (Opacity == null)
            Opacity = ".25";
		if (Offset == null)
            Offset = _I.shadowOffset; 
       
   		_I.shadowOffset = Offset;
		if (DelayShadow)
		{
            window.setTimeout(function() { _I.showShadow.apply(this,[Opacity,Offset,null]); },100);
            return;
		}

		_Ctl.style.position = 'absolute';
		var Bounds = _I.getBounds();

		var Shadow = $w(_Ctl.id + 'Shadow');
		if (Shadow == null) {
            Shadow = document.createElement('div');
            Shadow.id = _Ctl.id + 'Shadow';
            _Ctl.parentNode.appendChild(Shadow);
            Shadow.style.position='absolute';
            Shadow.style.background = 'black';

            ShadowCtl = $ww(Shadow);
            ShadowCtl.setOpacity(Opacity);
            if (!_Ctl.style.zIndex)
                _Ctl.style.zIndex = 99;
            Shadow.style.zIndex = _Ctl.style.zIndex-1; 
		}		
		if (Shadow.style.filter) {
		    Shadow.style.filter = 'progid:DXImageTransform.Microsoft.Blur(makeShadow=1, shadowOpacity=' + Opacity.toString()  + ', pixelRadius=3)';
		    Offset = Offset-3;
		}		
		Shadow.style.display = '';
		Shadow.style.top = Bounds.y + Offset + "px";
		Shadow.style.left = Bounds.x + Offset + "px";
		Shadow.style.width = Bounds.width + "px";
		Shadow.style.height = Bounds.height + "px";
	}
	this.hideShadow = function(HideShadowOnly) {
		var Ctl = _Ctl;
		if (!HideShadowOnly)
		{
			if (Ctl == null)
				return;
			Ctl.style.display = 'none';
		}
	
		Ctl = $w(_Ctl.id + "Shadow");
		if (Ctl == null)
			return;
		Ctl.style.display = 'none';
	}
	this.css = function(style,value){
	    if (arguments.length < 2)
	        return _I.element.style[style];
	    _I.element.style[style] = value;
	}
	this.attr = function(attr, value){
	    
	}
}
function $ww(element) {
    return new wwControl(element);
}

function wwList(ControlId)
{
	wwControl.apply(this,[ControlId]);
	var _I = this;
	var _Ctl = this.element;

	this.dataTextField = "";
	this.dataValueField = "";

	this.addItem = function(Text,Value)
	{
		var option = document.createElement("option");
		option.text = Text;
		if (Value != null)
			option.value = Value;
        try 
        {_Ctl.add(option,null);} 
        catch(e) 
        {_Ctl.add(option);}
	}
	this.selectItem = function(value)
	{
	    var List = _I.element;	 
	    for (x=List.options.length-1; x > -1; x--)
    	{
		    if (List.options[x].value == value) {		    
		       List.options[x].selected = true;
		       return;
            }
	    }
	}
	this.setData = function(Items,NoClear)
	{
		if (Items == null)
			return;
		
		if (NoClear == null)
		 this.clear();

		if (Items.Rows)
			Items = Items.Rows;
	    
	    var IsValueList = false;
	    if (!_I.dataTextField && !_I.dataValueField)
	        IsValueList = true;	   

		for (x=0; x < Items.length; x++ )
		{
			var Row = Items[x];
			if (IsValueList)
			    _I.addItem(Row,Row);
			else
			    _I.addItem(Row[_I.dataTextField],Row[_I.dataValueField]);
		}
	}
	this.clear = function()
	{
	var List = _I.element;
	for (x=List.options.length-1; x > -1; x--)
	{
		 List.remove(0);
	}
	}
}
wwList.prototype = new wwControl();
wwList.prototype.constructor = wwList;

function wwToolTip(Control) {
	var _I = this;
	var _Ctl = Control;
	if (typeof(Control) == "string")
		_Ctl = $w(Control);

	if (_Ctl == null)
		return null;

	this.show = function(Message,Timeout,Position)
	{
		var Ctl = _Ctl;
		if (Ctl == null)
			return; 
		
		var ControlId = Ctl.id;

		var ToolTip = $w(ControlId + "_ToolTip");
		if ( ToolTip != null)
		{
			 Ctl.parentNode.removeChild(ToolTip);
			 Ctl.parentNode.removeChild( $w(ControlId + "_ToolTipShadow"));
			 ToolTip = null;
		}

		ToolTip = document.createElement('div');
		Ctl.parentNode.appendChild(ToolTip);
		if ( Position == null)
			 Position = "BottomLeft";

		var Style=ToolTip.style;
		Style.display = '';

		ToolTip.id = ControlId + "_ToolTip";
		Style.background = "cornsilk";
		Style.color = "black";
		Style.borderWidth="1px";
		Style.borderStyle="solid";
		Style.borderColor="gray";
		Style.padding="2px";
		Style.fontSize = "8pt";
		Style.fontWeight = "normal";

		var OldPosition = Ctl.style.position;

		ToolTip.innerHTML = Message;
		Style.position = "absolute";
		Ctl.style.position = "absolute";

		var wwCtl = $ww(Ctl);
		var CtlBounds = wwCtl.getBounds();

		var Left = CtlBounds.x + 10;
		var Top = CtlBounds.y + CtlBounds.height - 5;
		if( Position == "BottomRight")
		{
			 Left = CtlBounds.x + CtlBounds.width - 10;
			 Top = CtlBounds.y + CtlBounds.height - 5;
		}
		else if (Position == "TopLeft")
		{
			 Left = CtlBounds.x + 2;
			 Top = CtlBounds.y + 2;
		}
		else if( Position == "Mouse")
		{
			 if (window.event)
			 {
			Left = window.event.clientX;
			Top = window.event.clientY;
			 }
		}

		var Width = ToolTip.clientWidth;  
		if (Width > 400)
			 Width=400;

		Style.left = Left + "px";
		Style.top = Top + "px";
		Style.width= Width + "px";	 

		wwCtl = $ww(ToolTip);
		wwCtl.showShadow(.30,2);

		Ctl.style.position = OldPosition;
		if (Timeout && Timeout > 0)
			 window.setTimeout(function() { _I.hide.apply(_I); },Timeout);
	}
	this.hide = function()
	{
		var Ctl = _Ctl;
		if (Ctl == null)
			return;

		var c = $ww(Ctl.id + "_ToolTip");
		c.fadeout(true,2);

		c = $ww(Ctl.id + "_ToolTipShadow");
		c.fadeout(true,2,.35);
	}
}
function wwModalDialog(DialogId,okButtonId,cancelButtonId,contentId,headerId)
{
    var _I = this;
    this.overlayId = "_ModalOverlay";
    this.dialogId = DialogId;
    this.okButtonId = okButtonId;
    this.cancelButtonId = cancelButtonId;
    this.contentId = contentId; 
    this.headerId = headerId;
    this.backgroundOpacity = .75;
    this.fadeinBackground = false;
    this.zIndex = 10000;    
    this.boxObj = $ww(DialogId);
    this.ovElement = null;        
    this.ovObj = null;
    this.dialogHandler = null;

    this.showDialog = function(MessageText, HeaderText) {
        if (_I.boxObj == null)
            return;         
        _I.ovElement = $w(this.overlayId);
        if (!_I.ovElement)
            _I.ovElement = _wwUtils.showOpaqueOverlay(_I.backgroundOpacity,_I.zIndex);         
        _I.ovObj = $ww(_I.ovElement);
 
        var Content = $ww(_I.contentId);
        if (!Content.isNull && MessageText)
                Content.setHtml(MessageText);
        var Header = $ww(_I.headerId);
        if (!Header.isNull && HeaderText)
                Header.setHtml(HeaderText);
                        
        var Box = _I.boxObj.element;
        Box.style.position = 'absolute';
        Box.style.zIndex= _I.zIndex +2;     
        
        _I.boxObj.show();
        _I.centerDialog(true);

        if (_I.okButtonId)
            wwEvent.addEventListener($w(_I.okButtonId),"click",_I._callback,false);
        if (_I.cancelButtonId)
            wwEvent.addEventListener($w(_I.cancelButtonId),"click",_I._callback,false);                                
        wwEvent.addEventListener(window,"resize",_I.centerDialog,false);
        wwEvent.addEventListener(window,"scroll",_I.centerDialog,false);                                       
    }    
    this.hideDialog = function() {
        _wwUtils.hideOpaqueOverlay(_I.ovElement);
        if (_I.ovObj)
            _I.ovObj.hide();
        if (_I.boxObj)
           _I.boxObj.hide();
        if (_I.okButtonId)
            wwEvent.removeEventListener($w(_I.okButtonId),"click",_I._callback,false);        
        if (_I.cancelButtonId)
            wwEvent.removeEventListener($w(_I.cancelButtonId),"click",_I._callback,false);                   
        
        wwEvent.removeEventListener(window,"resize",_I.centerDialog,false);
        wwEvent.removeEventListener(window,"scroll",_I.centerDialog,false);        
    }       
    this.centerDialog = function(fadein) {
         _wwUtils.showOpaqueOverlay(_I.backgroundOpacity,_I.zIndex,_I.ovElement);         
         if (fadein==true && _I.fadeinBackground) 
            _I.ovObj.fadein(3,.10,_I.backgroundOpacity);                        
         _I.boxObj.centerInClient();
    }
    this._callback = function(event) {                
        if (_I.dialogHandler) {
            var evt = new wwEvent(event);        
            if (_I.dialogHandler((evt.source==$w(_I.okButtonId))?1:0,evt.source)==false)
               return;
        }
        setTimeout( function() { _I.hideDialog(); },1);
    }
}
wwModalDialog.createDialog = function(Id,Width,OkCaption,CancelCaption,dialogHandler)
{
    var Outer = document.createElement('div');
    Outer.id = Id;
    var S = Outer.style;
    S.background = "white";
    S.border = "solid 2px darkblue";
    S.display = "none";        
    S.width = Width?Width+"px":"400px";
    document.body.appendChild(Outer);
    
    var Header = document.createElement('div');
    Header.id = Id + "_Header";    
    S = Header.style;
    S.padding = "4px";
    S.fontWeight = "bold";
    S.color = "cornsilk";
    S.background = "darkblue";
    Outer.appendChild(Header);
    
    var Content = document.createElement('div');
    Content.id = Id + "_Content";
    Content.style.padding = "10px";
    Outer.appendChild(Content);
    
    var Ok = document.createElement('button');
    Ok.id = Id + "_Ok";
    S = Ok.style;
    S.margin = "5px";
    if (dialogHandler)
        Ok.click = dialogHandler;    
    Outer.appendChild(Ok);    
    $ww(Ok.id).setText(OkCaption?OkCaption:'   OK   ');
    
    if (CancelCaption) {
        var C = document.createElement('button');
        C.id = Id + "_Cancel";
        S = C.style;
        S.margin = "5px";
        if (dialogHandler)
            C.click = dialogHandler;    
        Outer.appendChild(C);    
        $ww(C.id).setText(CancelCaption?CancelCaption:' Cancel ');
    } 
    new wwDragBehavior(Outer.id,Header.id);
    
    var md = new wwModalDialog(Outer.id,Ok.id,C?C.id:null,Content.id,Header.id);
    md.boxObj.showShadow(.35,8);
    if (dialogHandler) md.dialogHandler = dialogHandler;
    return md;
}
wwModalDialog.messageBox = function(Message,Title,OkCaption,CancelCaption,MBoxCallback)
{
    var Mbox = wwModalDialog.createDialog("__Mbox",500,OkCaption,CancelCaption,MBoxCallback);
    Mbox.showDialog(Message,Title);
    return Mbox; 
}
var _dragIndexer = 0;
function wwDragBehavior(WindowId,DragHandleId,DragOpacity)
{
	var _I = this;
	
	this.dragHandle = $w(DragHandleId);
	this.window = $w(WindowId);
	this.dragOpacity = DragOpacity || 0.75;
	this.dragCompleteHandler = null;
	this.dragStartHandler = null;

	this.windowObj = $ww(this.window);    
	this.isMouseDown = false;          
	this.deltaX = 0;
	this.deltaY = 0;  
	this.savedOpacity = 1;
	this.savedzIndex = 0;
	
	this.mouseDown = function(e)
	{    
		if (_I.isMouseDown)
		  return;
		
		var evt = new wwEvent(e);
		if (evt.source != _I.dragHandle)
			return;
			
        _I.windowObj.element.style.position = "absolute";				

		_I.deltaX = evt.offsetX;
		_I.deltaY = evt.offsetY;		
		          
		_I.dragActivate(e);
		evt.consume();
	}
	this.mouseUp = function(e) {    
		_I.dragDeactivate(e);
	}
	this.mouseMove = function(e) {
		if (_I.isMouseDown)
			_I.moveToMouse(e);
	}
	this.moveToMouse = function(e) {   
		var evt = new wwEvent(e);            		
		_I.windowObj.setLocation(evt.clientX-_I.deltaX,evt.clientY-_I.deltaY);
	}
	this.dragActivate = function(e) {
		_I.moveToMouse(e);
		_I.isMouseDown = true;
    	_I.savedzIndex = _I.window.style.zIndex;
		_I.window.style.zIndex = 50000;
		_I.savedOpacity = _I.windowObj.getOpacity();		
		_I.windowObj.setOpacity(_I.dragOpacity); 
		     
		_I.dragHandle.style.cursor = "move";
		wwEvent.addEventListener(document,"mousemove",_I.mouseMove,false);
		wwEvent.addEventListener(document,"mouseup",_I.mouseUp,false);
		wwEvent.addEventListener(document.body,"selectstart",NullFunction,false);
		wwEvent.addEventListener(document.body,"dragstart",NullFunction,false);		
		wwEvent.addEventListener(_I.dragHandle,"selectstart",NullFunction,false);		
		if (_I.dragStartHandler)
		   _I.dragStartHandler(e,_I);		
	}
	this.dragDeactivate = function(e) {		
		_I.moveToMouse(e);				
		wwEvent.removeEventListener( document,"mousemove",_I.mouseMove,false);
		wwEvent.removeEventListener( document,"mouseup",_I.mouseUp,false);
		wwEvent.removeEventListener(document.body,"selectstart",NullFunction,false);
		wwEvent.removeEventListener(document.body,"dragstart",NullFunction,false);
		wwEvent.removeEventListener(_I.dragHandle,"selectstart",NullFunction,false);		
		_I.isMouseDown = false;
		_I.windowObj.setOpacity(_I.savedOpacity);    	
		_dragIndexer++; 
		_I.window.style.zIndex = 10000 + _dragIndexer;

		_I.dragHandle.style.cursor = "auto";
		if (_I.dragCompleteHandler)
		   _I.dragCompleteHandler(e,_I);
	}
	this.hide = function() {
		_I.windowObj.hide();
	}
	this.show = function() {
		_I.windowObj.show();        
	}
	this.stop = function() {
		wwEvent.removeEventListener( document,"mousedown",_I.mouseDown,false );
	}
	wwEvent.addEventListener( document,"mousedown",_I.mouseDown,false);
}
function wwUtils()
{       
	var _I = this;
	
	this.getScrollPosition = function()
	{
	    var ST=document.body.scrollTop;
	    if (ST==0)
	    {
	    if (window.pageYOffset)  
		    ST=window.pageYOffset;
	    else 
		    ST=document.body.parentElement ? document.body.parentElement.scrollTop : 0;
	    }
	    var SL=document.body.scrollLeft;
	    if (SL==0)
	    {
		    if (window.pageXOffset)
			    SL=window.pageXOffset;
		    else
			    SL=(document.body.parentElement) ? document.body.parentElement.scrollLeft : 0;
	    }
		return { scrollTop: ST, scrollLeft: SL }	    
	}
    this.showOpaqueOverlay = function(Opacity,zIndex,ControlId)
    {
        var sh = null;
        if (ControlId) {
            sh = $w(ControlId);
            sh.style.display = '';
        }
        else {   
            sh=document.createElement("div");
            sh.id="wwShadowOverlay";
            sh.style.background="black";
            document.body.appendChild(sh);
            ControlId = "wwShadowOverlay";
        }                  
        if (!sh.opaqueOverlay){
            _wwUtils.op_id=ControlId;_wwUtils.op_zIndex=zIndex;_wwUtils.op_opacity=Opacity;
            wwEvent.addEventListener(window,"resize",_I._opaqueResize,false);
            wwEvent.addEventListener(window,"scroll",_I._opaqueResize,false);                                         
        }
        sh.opaqueOverlay = true;
          
        sh.style.top="0px";
        sh.style.left="0px";
        sh.style.position = "absolute";
        sh.style.zIndex = zIndex ? zIndex : 10000;
        var shCtl = $ww(sh);
        shCtl.setOpacity(Opacity);
        
        var Scroll = _wwUtils.getScrollPosition();   
        var Doc = document.documentElement;      
        var x = window.innerWidth?window.innerWidth:Doc.offsetWidth;
        var y = window.innerHeight?window.innerHeight:Doc.offsetWidth;
        x=x+Scroll.scrollLeft;
        y=y+ Scroll.scrollTop;
        sh.style.width = x+"px";
        sh.style.height = y+"px";
        
        return sh;
    }
    this._opaqueResize = function(e)
    {
        _wwUtils.showOpaqueOverlay(_I.op_opacity,_I.op_zIndex,_I.op_id);
    }
    this.hideOpaqueOverlay = function(ControlId)
    {        
        var sh = $w(ControlId);
        if (sh == null)
           sh = $w("wwShadowOverlay");    
        if (sh == null)
           return;
        if (sh.opaqueOverlay) {        
            wwEvent.removeEventListener(window,"resize",_I._opaqueResize,false);
            wwEvent.removeEventListener(window,"scroll",_I._opaqueResize,false);   
            sh.opaqueOverlay=false;                                                                       
        }
        if (ControlId) {
            sh.style.display = 'none';
            return;
        }
        document.body.removeChild(sh);
    }
    this.getIEVersion = function()
    {
        var Matches = navigator.userAgent.match(/MSIE\s\d/);
        if (!Matches || Matches.length < 1)
            return -1;
        var ver = Matches[0].substring(Matches[0].length-1);            
        return parseInt(ver);
    }
    var _IELB = null;var _aIELB = null;
    this.hideIEListboxes = function()  {
        var v = _wwUtils.getIEVersion();
        if (v > 6||v < 1)
            return;
        
        _IELB = document.getElementsByTagName("select");
        if (!_IELB) return;
        
        _aIELB = new Array();
        for( var x=0; x<_IELB.length;x++) {
            var o = { el:_IELB[x],disp:_IELB[x].style.display };
            _IELB[x].style.display = "none";
            _aIELB.push(o);
        } 
    }
    this.showIEListboxes = function() {
        if (!_IELB) return;
        for(var x=0;x<_aIELB.length;x++) {
            _aIELB[x].el.style.display = _aIELB[x].disp;
        }
        _aIELB = null;_IELB = null;
    }
	this.encodeFormVars = function(FormName,NoViewState)
	{
		var PostData = "";
		var Form = null;

		if (FormName)
			Form = document.forms[FormName];
		else
			Form = document.forms[0];
		if (Form == null)
			return "";

		var count = Form.length;
		var element;

		for (var i = 0; i < count; i++)
		{
			element = Form.elements[i];
			var tagName = element.tagName.toLowerCase();
			if (tagName == 'input')
			{
				var type = element.type;

				if (NoViewState)
				{
					// *** Don't send ASP.NET gunk
					if (element.name == '__VIEWSTATE' || element.name == '__EVENTTARGET' ||
						element.name == '__EVENTARGUMENT' || element.name == '__EVENTVALIDATION')
						continue;
				}
				if (type == 'text' || type == 'hidden' || type == 'password' ||
				   ((type == 'checkbox' || type == 'radio') && element.checked	))
					PostData += element.name + '=' + _I.encodeValue(element.value) + '&';
			}
			else if (tagName == 'select')
			{
				if (element.options == null)
					continue;
				var selectCount = element.options.length;
				for (var j = 0; j < selectCount; j++)
				{
					var selectChild = element.options[j];
					if (selectChild.selected)
						PostData += element.name + '=' + _I.encodeValue(selectChild.value) + '&';
				}
			}
			else if (tagName == 'textarea')
				PostData += element.name + '=' + _I.encodeValue(element.value) + '&';
		}
		return PostData;
	}
	this.encodeValue = function(parameter) {
		if (encodeURIComponent)
			return encodeURIComponent(parameter);
		return escape(parameter);
	}
  	this.getNumberFormat = function(cur) {	   
	    var t = 1000.1.toLocaleString();
	    var r = {};
        r.d = t.substr(5,1);
        r.c = t.substr(1,1);        
        r.s = cur || "$";
	    return r;
	}	
} 
_wwUtils = new wwUtils();

function CallbackException(Message)
{
	this.isCallbackError = true;
	if (typeof(Message) == "object" && Message.message)
	this.message = Message.message;
	else
	this.message = Message;    
}

function wwEvent(evt) {
	this.evt = evt ? evt:window.event; 

	if (this.evt) {
		this.source = evt.target ? evt.target : evt.srcElement;
		this.target = evt.relatedTarget ? evt.relatedTarget : evt.toElement;
		this.x = evt.clientX!=null ? evt.clientX : evt.pageX;
		this.y = evt.clientY!=null ? evt.clientY : evt.pageY;
		this.offsetX = evt.offsetX!=null ? evt.offsetX : evt.layerX;
		this.offsetY = evt.offsetY!=null ? evt.offsetY : evt.layerY;
		var ScrollTop = document.body.scrollTop;
	
		if (ScrollTop ==0)
		{
			if (window.pageYOffset)  
				ScrollTop = window.pageYOffset;
			else 
				ScrollTop = document.body.parentElement ? document.body.parentElement.scrollTop : 0;
		}
		this.clientY = this.y + ScrollTop;
		this.scrollTop = ScrollTop;
		var ScrollLeft = document.body.scrollLeft;
		if (ScrollLeft == 0)
		{
			if (window.pageXOffset)
				ScrollLeft = window.pageXOffset;
			else
				ScrollLeft = (document.body.parentElement) ? document.body.parentElement.scrollLeft : 0;
		}
		this.clientX = this.x + ScrollLeft;
		this.scrollLeft = ScrollLeft;
	} else {
		this.source=null; this.x=0;this.y=0;this.offsetX=0;this.offsetY=0;clientX=0;clientY=0;
	}	
}
wwEvent.prototype.consume = function () {
	if (this.evt.stopPropagation) {
		this.evt.stopPropagation();
		this.evt.preventDefault();
	} else if (this.evt.cancelBubble) {
		this.evt.cancelBubble = true;
		this.evt.returnValue  = false;
	}
};
wwEvent.addEventListener = function (target,type,func,bubbles) {
	if (document.addEventListener) {
		target.addEventListener(type,func,bubbles);
	} else if (document.attachEvent) {
		target.attachEvent("on"+type,func,bubbles);
	} else {
		target["on"+type] = func;
	}
};
wwEvent.removeEventListener = function (target,type,func,bubbles) {
	if (document.removeEventListener) {
		target.removeEventListener(type,func,bubbles);
	} else if (document.detachEvent) {
		target.detachEvent("on"+type,func,bubbles);
	} else {
		target["on"+type] = null;
	}
};
wwEvent.load = function(target,func)
{    
    wwEvent.addEventListener(target,"load",func,false);
}

String.prototype.htmlEncode = function() {
     var div = document.createElement('div');
     if (typeof(div.textContent)=='string')
        div.textContent = this.toString();
     else
        div.innerText = this.toString();
    return div.innerHTML;
}
String.prototype.trimEnd = function(c) {
     return this.replace(/\s+$/,'');
}
String.prototype.trimStart = function(c) {
    return this.replace(/^\s+/,'');
}
String.repeat = function(chr,count)
{    
    var str = ""; 
    for(var x=0;x<count;x++) {str += chr}; 
    return str;
}
String.prototype.padL = function(width,pad)
{
    if (!width ||width<1)
        return this;   
            
    if (!pad) pad=" ";        
    var length = width - this.length
    if (length < 1) return this.substr(0,width);
     
    return (String.repeat(pad,length) + this).substr(0,width);     
}    
String.prototype.padR = function(width,pad)
{
     if (!width || width<1)
        return this;        

    if (!pad) pad=" ";
    var length = width - this.length
    if (length < 1) this.substr(0,width);
     
    return (this + String.repeat(pad,length)).substr(0,width);
}      
String.format = function(frmt,args)
{   
    for(var x=0; x<arguments.length; x++)
    {
        frmt = frmt.replace("{" + x + "}",arguments[x+1]);
    }
    return frmt;
}
var _monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
Date.prototype.formatDate = function(format)
{
    var date = this;
    if (!format)
      format="MM/dd/yyyy";               
    
    var month = date.getMonth();   
    var year = date.getFullYear();    
    
    if (format.indexOf("yyyy") > -1)
        format = format.replace("yyyy",year.toString());
    else if (format.indexOf("yy") > -1)
        format = format.replace("yy",year.toString().substr(2,2));
                
    format = format.replace("dd",date.getDate().toString().padL(2,"0"));

    var hours = date.getHours();       
    if (format.indexOf("t") > -1)
    {
       if (hours > 11)
         format = format.replace("t","pm")
       else
         format = format.replace("t","am")
    }      
    if (format.indexOf("HH") > -1)
        format = format.replace("HH",hours.toString().padL(2,"0"));
    if (format.indexOf("hh") > -1) {
        if (hours > 12) hours -= 12;
        if (hours == 0) hours = 12;
        format = format.replace("hh",hours.toString().padL(2,"0"));         
    }
    if (format.indexOf("mm") > -1)
       format = format.replace("mm",date.getMinutes().toString().padL(2,"0"));
    if (format.indexOf("ss") > -1)
       format = format.replace("ss",date.getSeconds().toString().padL(2,"0"));

    if (format.indexOf("MMMM") > -1)        
        format = format.replace("MMMM",_monthNames[month]);
    else if (format.indexOf("MMM") > -1)        
        format = format.replace("MMM",_monthNames[month].substr(0,3));
    else
        format = format.replace("MM",month.toString().padL(2,"0"));        
    
    return format;
}
Number.prototype.formatNumber = function (format,option){
    var num=this;
    var fmt = _wwUtils.getNumberFormat();
    if (format == "c") {    
        num = Math.round(num*100)/100;
        if (!option) option="$"            
        num = num.toLocaleString();
        var s = num.split(".");
        var p = s.length > 1 ? s[1] :'';        
        return option + s[0] + fmt.d + p.padR(2,'0'); 
    }
    if (format.substr(0,1) == "n") {
        if (format.length == 1)
            return num.toLocaleString()
        var dec = format.substr(1);
        dec = parseInt(dec);
        if (typeof(dec) != "number")
           return num.toLocaleString();
        num = num.toFixed(dec);                            	
    	var x = num.split(fmt.d);	    
	    var x1 = x[0];	   
	    var x2 = x.length > 1 ? fmt.d + x[1] : '';
	    var rgx = /(\d+)(\d{3})/;
	    while (rgx.test(x1)) 
		    x1 = x1.replace(rgx, '$1' + fmt.c + '$2');
	    return x1 + x2	    
    }
    if (format.substr(0,1) == "f") {
        if (format.length == 1)
          return num.toString();
        var dec = format.substr(1);
        dec = parseFloat(dec);
        if (typeof(dec) != "number")
           return num.toString();               
        return num.toFixed(dec);                                                  
    }    
    return num.toString();
}
function wwDebug(OutputControl) {
	var _I = this;
	var _OutputBuffer = "";
	var _OutputControl = null;
	if (OutputControl)
	   _OutputControl = OutputControl;

	this.output = function(output) {
		_OutputBuffer = output;
		if (_OutputControl)
			_OutputControl.innerHTML = _OutputBuffer;
	}
	this.write = function(Output) {
		_OutputBuffer = _OutputBuffer + Output;
		_I.output(_OutputBuffer);
	}
	this.writeLn = function(Output) {
		_I.write(Output + "<br/>"); 
	}
	this.clear = function() {
		_I.output("")
	}
	this.toString = function() {
	return _OutputBuffer;
	}	
	this.setOutput = function(ControlId) {
		if (ControlId != null)
			_OutputControl = $w(ControlId);
		else
			_OutputControl = null;
	}
}
var _debug = new wwDebug();

//Copyright (c) 2005 JSON.org
//Modifications by Rick Strahl
//Added dates in object parser,} and ] encoding
var JSON = {
	copyright: '(c)2005 JSON.org',
	license: 'http://www.crockford.com/JSON/license.html',
	serialize: function (v) {
	var a = [];
//	Emit a string.
	function e(s) {
		 a[a.length] = s;
	}

// Convert a value.
	function g(x) {
		 var b, c, i, l, v;

		 switch (typeof x) {
		 case 'string':
		 
		e('"');
		if (/["\\\x00-\x1f\x7d\x5d]/.test(x)) {
			 l = x.length;
			 for (i = 0; i < l; i += 1) {
	        	c = x.charAt(i);
			if (c >= ' ' && c != '}' && c != ']') {
                if (c == '\\' || c == '"') 
				    e('\\');				   
                e(c);
			} else {
				   switch (c) {
				   case '\b':
				e('\\b');
				break;
				   case '\f':
				e('\\f');
				break;
				   case '\n':
				e('\\n');
				break;
				   case '\r':
				e('\\r');
				break;
				   case '\t':
				e('\\t');
				break;
				   case '}':
				e('\\u007D');
				break;
				   case ']':
				e('\\u005D');
				break;
				   default:
				c = c.charCodeAt();
				e('\\u00' +
					Math.floor(c / 16).toString(16) +
					(c % 16).toString(16));
				   }
			}
				 }
		} else {
				 e(x);
		}
		e('"');
		return;
		 case 'number':
		e(isFinite(x) ? x : 'null');
		return;
		 case 'object':
		if (x) {
		 // RAS: Added Date Parsing
		 if (x.toUTCString)
			 return e('\"\\/Date(' + x.getTime() + ')\\/\"' ); // MS Ajax style
			 //return e('new Date(' + x.getTime() + ')' );
			 
		 if (x instanceof Array) {
			e('[');
			l = a.length;
			for (i = 0; i < x.length; i += 1) {
				   v = x[i];
				   if (typeof v != _ud &&
					typeof v != 'function') {
				if (b) {
					e(',');
				}
				g(v);
				b = true;
				   }
			}
			e(']');
			return;
				 } else if (typeof x.valueOf == 'function') {
			e('{');
			l = a.length;
			for (i in x) {
				   v = x[i];
				   if (typeof v != _ud &&
					typeof v != 'function' &&
					(!v || typeof v != 'object' ||
					typeof v.valueOf == 'function')) {
				if (b) {
					e(',');
				}
				g(i);
				e(':');
				g(v);
				b = true;
				   }
			}
			return e('}');
				 }
		}
		e('null');
		return;
		 case 'boolean':
		e(x);
		return;
		 default:
		e('null');
		return;
		 }
	}
	g(v);
	return a.join('');
	},
	// *** RAS Update: RegEx handler for dates ISO and MS AJAX style
    regExDate: function(str,p1, p2,offset,s) 
	{	
        str = str.substring(1).replace('"','');
        var date = str;
        var regEx=/\/Date(.*)\//;        //MS Ajax date: /Date(19834141)/
        if (regEx.test(str)) {        
            str = str.match(/Date\((.*?)\)/)[1];                        
            date = "new Date(" +  parseInt(str) + ")";
        }
        else { // ISO Date 2007-12-31T23:59:59Z                                     
            var matches = str.split( /[-,:,T,Z]/);        
            matches[1] = (parseInt(matches[1],0)-1).toString();                     
            date = "new Date(Date.UTC(" + matches.join(",") + "))";         
       }                  
        return date;
    },
	parse: function(text,noCheck) {
	
        if (!noCheck && !(!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
		     text.replace(/"(\\.|[^"\\])*"/g, '')))  ))
		     throw new Error("Invalid characters in JSON parse string.");				 

        // *** RAS Update:  Fix up Dates: ISO and MS AJAX format support
        var regEx = /(\"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*?\")|(\"\\*\/Date\(.*?\)\\*\/")/g;
        text = text.replace(regEx,this.regExDate);      

        return eval('(' + text + ')');	
    },
    parseSafe: function(text) {
        try {return this.parse(text);} catch(e) {return null;}
    }
}
var _ud = "undefined";
function NullFunction() { return false; }
var IsMSIE = navigator.userAgent.indexOf('MSIE') > -1 ? true : false;
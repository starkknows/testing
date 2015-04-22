/** 
 * xpather - Build xpath expressions 
 *  
 *  The HTML element that you bind this to is the one that should be dropping the XML text into, so it should
 *  be a TEXTAREA.  The 'display' option is for a DIV control that will show the parsed XML as spans that you
 *  can click on (hover, etc) to get the xpath(s) for a selected. 
 *  
 *  @param options - 
 *       display:  selector to the div that will hold the xml view in which you click to pick xpaths. 
 *          mode:  hover, click/lclick, rclick, dclick/dblclick(default)   - sets when the xpath is evaluated
 *         error:  a selector of an optional control to show the error message in (s/b div or span)
 *      onChoose:  call back that gets called and passed the xpath expression of a selected element 
 *  
 *  @author: John Maher
 */
(function($j) {
	if (typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, ''); 
		};
	}

	var XML_DATA_TYPE = "xml";
	var INDENTURE = '&nbsp;&nbsp;';
    var indent = "";
    var xmlDoc = null;
    var defaultValue = '-- put sample payload here --';
    
    $j.fn.xpather = function(options) {
        var modes = { 
        		'click': 'click', 'lclick':'click', 
        		'rclick':'rclick', 
        		'dclick':'dblclick', 'dblclick': 'dblclick', 
        		'move':'hover', 'hover':'hover' 
        };
    	
        // OPTIONS
        //
        var opts = {						
        		display    : "#xml-view",				 
                mode       : "click",					
                error      : '', 				
                namespace  : false, 				
                dataType   : XML_DATA_TYPE,		// not option yet but could be json/xml, etc.
                onChoose   : function(xpaths) { 
                	alert('xpaths = ' + xpaths.join('\n'));
                }
        };
        
        var evt = typeof modes[options.mode] == 'undefined' ? 'dblclick' : modes[options.mode];
       
        
        // Methods
        
        $j.extend(opts, options);

    	
        // Internals
        //
        
        function calcXPaths(elm) {
        	var xPaths = [];
        	addXPath(xPaths, calcXPath(elm));
        	if (elm && elm.attributes.length > 0) {
        		$j.each(elm.attributes, function() {
     		   		if (this.specified) {
        					addXPath(xPaths, calcXPath(elm, this));
        				}
       		 	});
        	}
        	return xPaths;
        }
    	
        function calcXPath(elm, attribute) { 
            for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) { 
            	
                if (attribute && $j(elm).attr(attribute.name)) { 
                	segs.unshift(lc(getNodeName(elm)) + '[@' + getNodeName(attribute) + '="' + attribute.value + '"]');
                	continue;
                } 

                var hasSib = false;
                for (var s = 1, sib = elm.nextSibling; sib; sib = sib.nextSibling)
                	if (getNodeName(sib) == getNodeName(elm))
                		hasSib = true;
                
                for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                    if (getNodeName(sib) == getNodeName(elm)) {
                		hasSib = true;
                    	i++;
            		}
                }
                
                segs.unshift(lc(getNodeName(elm)) + ( hasSib ? '[' + i + ']' : ''));
            }
            
            return segs.length ? '/' + segs.join('/') : null; 
        }

        function lc(txt) {
        	return txt;		// return txt.toLowerCase()  if this is desired. 
        }
        
        function getNodeName(e) {
           if (opts.namespace)
               return e.nodeName;
           if (isMSIE8)
               return e.nodeName.replace(/^[\w-]*:/, '');
           return e.localName;
        }
        
        function showPath(ev) {
		    opts.onChoose( $j(this).data('xp') );
		    ev.stopPropagation();
        }
        
    	function addXPath(a, x) {
    		if ((x != null) && ($j.inArray(x, a) <= -1)) {
    			a.push(x);
    		}
    	}
        
        function toHtml(node) {

        	//var nodeXpaths = [];
        	//addXPath(nodeXpaths, calcXPath(node[0], 1));
        	//addXPath(nodeXpaths, calcXPath(node[0], 2));
        	
        	var nodeXpaths = calcXPaths(node[0]);
        	
        	var html = makeElement(node);
        	
        	makeSelectable(html.find('span'));
        	
        	var indented = false;
        	
        	$j(node).children().each(function(idx, elm) {
        		if (!indented) {
                	indent += INDENTURE;
                	indented = true;
        		}
        			
        		html.append( toHtml($j(elm)) );
        	});

        	if (indented)
        		indent = indent.substring(0, indent.length-INDENTURE.length);

        	html.append( makeEndElement(node) );

        	return html;
        	
            function makeElement(e) {
            	return $j("<div/>").append( makeStartElement(e) );
            }

            function makeStartElement(e) {
                var span = $j( "<span></span>" );
                span.data("xp", nodeXpaths); // this sets the xpath array to the element span
                var attrs = attributes(e);
                span.append(indent).append("&lt;").append(e[0].tagName);
                $j.each(attrs, function() {
                	span.append("&nbsp;").append(this);
                });
                span.append("&gt;").append(text(e));
                return span;
            }
            
            function attributes(e) {
            	if (!e || e.length == 0)
            		return "";
            	
            	var attrs = [];
            	
            	$j.each( e[0].attributes, function() {

            		if (this.specified) {
            			var attrXpathSnippet = '/@' + getNodeName(this);
            			//var attrXpathSnippet = "[@" + this.name + "=\"" + this.value + "\"]";
            			var attrXpath = [];
            			for (var i = 0; i < nodeXpaths.length; i++) {
            				var thisPath = nodeXpaths[i];
            				var attrValPattern = '\\[@' + getNodeName(this) + '=".*"\\]';
            				if (!thisPath.match(new RegExp(attrValPattern)))
            					attrXpath.push(nodeXpaths[i] + attrXpathSnippet);
            			}
            			var attrib = $j("<span>" + getNodeName(this) + "='" + this.value + "'</span>");
            			attrib.data("xp", attrXpath);
            		    attrs.push(attrib);
            		}
            	});
            	
            	return attrs;
            }
            
            function makeSelectable(e) {
            	e.addClass("selectable").on(evt, showPath);
            }
            
            function makeEndElement(e) {
            	
            	
                var span = $j( "<span></span>" );
                span.data("xp", nodeXpaths); // this sets the xpath array to the element span
                if (indented)
                	span.append(indent);
                span.append("&lt;/")
                	.append(e[0].tagName)
                	.append("&gt;");
                makeSelectable(span);
                return span;
            	
                //return $j((indented ? indent : '') + "<span>&lt;/" + e[0].tagName + "&gt;</span>");
            }
        	
        }
        
        
        function text(e) {
        	return  e.clone()    // clone the element
            		.children()  // select all the children
            		.remove()    // remove all the children
            		.end() 		 // again go back to selected element
            		.text();
        }

        
        function lookupElementByXPath(path) { 
            var evaluator = new XPathEvaluator(); 
            var result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
            return  result.singleNodeValue; 
        }
        
        
        function parse() {
	    	  try {
  	    		var xmlData = opts.source.val();
  	    		if (xmlData.trim() == opts.defaultText)
  	    			return;
		        	var xml = $j.parseXML( xmlData );
		        	if (opts.hidden)
		        		$j(opts.hidden).val(xmlData);
		        	
		        	if (xmlData.trim() == "") {
		        		$j(opts.display).val("").hide();
		        		opts.source.show();
		        		return;
		        	}
		        	var mode = typeof modes[opts.mode] == 'undefined' ? 'dclick' : modes[opts.mode];
		
	            	xmlDoc = $j(xml);
	            	var html = toHtml( $j(xmlDoc.find(":first-child")[0]) );	
	            	
	            	// hide the text area and show the xml.
	        	    opts.source.hide();
	        	    $j(opts.display)
	        	        .fadeIn()
	        	        .html(html);
	            	return true;
  	    	  } catch(e) {
  	    	      var errorMessage = "Invalid XML, unable to parse";
  	    	      if (typeof opts.error == 'function')
  	    	          opts.error(errorMessage);
  	    	      else
  	    	          alert(errorMessage);
  	    	  }
        }
        
        this.each( function() {

        	if (XML_DATA_TYPE.toLowerCase() !== opts.dataType.toLowerCase())
				return;

			var source = $j(this);
        	opts.source = source;
        	
        	source
        	      .text(opts.defaultText)
        	      .on("focus", function() {
        	    	  if ($j(this).val().trim() == opts.defaultText) {
        	    		  $j(this).off("focus").val("");
        	    	  }
        	      })
        	      .unbind("change")
        	      .change(function() {
        	    		var xmlData = opts.source.val();
        	    		try {
        	    		    var xml = $j.parseXML( xmlData );
        	    		} catch (e) {
        	    		    return;
        	    		}
    		        	if (opts.hidden)
    		        		$j(opts.hidden).val(xmlData);
    		        	
    		        	if (xmlData.trim() == "") {
    		        		$j(opts.display).val("").hide();
    		        		opts.source.show();
    		        	}
    		      })
    		      .unbind("parse")
        	      .bind("parse", function() {
        	    	  return parse();
        	      });
        });
        
        this.parse = parse;
        return this;
    };
    
    
})(jQuery);



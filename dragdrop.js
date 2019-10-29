// Function to get elements by class name for DOM fragment and tag name
//javascript capturing list elements using keyboard or javascript keyboard up and down choice list
function getElementsByClassName(objElement, strTagName, strClassName)
{
	var objCollection = objElement.getElementsByTagName(strTagName);
	var arReturn = [];
	var strClass, arClass, iClass, iCounter;

	for(iCounter=0; iCounter<objCollection.length; iCounter++)
	{
		strClass = objCollection[iCounter].className;
		if (strClass)
		{
			arClass = strClass.split(' ');
			for (iClass=0; iClass<arClass.length; iClass++)
			{
				if (arClass[iClass] == strClassName)
				{
					arReturn.push(objCollection[iCounter]);
					break;
				}
			}
		}
	}

	objCollection = null;
	return (arReturn);
}

function getDropzonesIDs()
{
	var iCounterDrop;
	var arDropIDs = [];
	var arDropzones = document.getElementsByName("dropzone"); //gets all the dropzones
	
	for (iCounterDrop=0; iCounterDrop<arDropzones.length; iCounterDrop++)
	{
		arDropIDs.push(arDropzones[iCounterDrop].id);
	}
	return (arDropIDs);
}

var drag = {
	objCurrent : null,
	
	strAnswer : null,
	
	arTargets : [],
	
	initialise : function(objNode)
	{
		this.arTargets = getDropzonesIDs(); //Sets the array with the ID list of all the available dropzones
		
		// Add event handlers
		objNode.onmousedown = drag.start; //Starts the drag and drop
		objNode.onclick = function() {this.focus();}; //Sets the focus in the drag
		objNode.onkeydown = drag.keyboardDragDrop; //Starts the accessible keyboard controlled activity
		document.body.onclick = drag.removePopup; //Allow the user to click outside to stop the keyboard popup
	},

	keyboardDragDrop : function(objEvent)
	{
		objEvent = objEvent || window.event;
		drag.objCurrent = this; //sets the variable objCurrent as "the drag"
		drag.strAnswer = this.getAttribute("data-answer"); //sets the variable strAnswer as the expected dropzone (right answer)
		console.log("strAnswer in keyboardDragDrop = " + drag.strAnswer);
		
		var arChoices = getDropzonesIDs(); //Sets the array with the ID list of all the available dropzones
		
		var iKey = objEvent.keyCode;
		var objItem = drag.objCurrent;

			var strExisting = objItem.parentNode.getAttribute('id');
			var objMenu, objChoice, iCounter;

			if (iKey == 32)
			{
				document.onkeydown = function(){return objEvent.keyCode==38 || objEvent.keyCode==40 ? false : true;};
				// Set ARIA properties
				drag.objCurrent.setAttribute('aria-grabbed', 'true');
				drag.objCurrent.setAttribute('aria-owns', 'popup');
				// Build context menu
				objMenu = document.createElement('ul');
				objMenu.setAttribute('id', 'popup');
				objMenu.setAttribute('role', 'menu');
				for (iCounter=0; iCounter<arChoices.length; iCounter++)
				{
					if (drag.arTargets[iCounter] != strExisting)
					{
						objChoice = document.createElement('li');
						objChoice.appendChild(document.createTextNode(arChoices[iCounter]));
						objChoice.tabIndex = -1;
						objChoice.setAttribute('role', 'menuitem');
						//changed the next line from 0,3 to 0,10
						//objChoice.onmousedown = function() {drag.dropObject(this.firstChild.data.substr(0, 10));};
						objChoice.onmousedown = function() {drag.dropObject(this.firstChild.data);};
						objChoice.onkeydown = drag.handleContext;
						objChoice.onmouseover = function() {if (this.className.indexOf('hover') < 0) {this.className += ' hover';} };
						objChoice.onmouseout = function() {this.className = this.className.replace(/\s*hover/, ''); };
						objMenu.appendChild(objChoice);
					}
				}
				objItem.appendChild(objMenu);
				objMenu.firstChild.focus();
				objMenu.firstChild.className = 'focus';
				drag.identifyTargets(true);
			}
	},

	removePopup : function()
	{
		document.onkeydown = null;

		var objContext = document.getElementById('popup');

		if (objContext)
		{
			objContext.parentNode.removeChild(objContext);
		}
	},

	handleContext : function(objEvent)
	{
		objEvent = objEvent || window.event;
		var objItem = objEvent.target || objEvent.srcElement;
		var iKey = objEvent.keyCode;
		var objFocus, objList, strTarget, iCounter;

		// Cancel default behaviour
		if (objEvent.stopPropagation)
		{
			objEvent.stopPropagation();
		}
		else if (objEvent.cancelBubble)
		{
			objEvent.cancelBubble = true;
		}
		if (objEvent.preventDefault)
		{
			objEvent.preventDefault();
		}
		else if (objEvent.returnValue)
		{
			objEvent.returnValue = false;
		}

		switch (iKey)
		{
			case 40 : // Down arrow
				objFocus = objItem.nextElementSibling;
				if (!objFocus)
				{
					objFocus = objItem.previousElementSibling;
				}
		
				objItem.className = '';
				objFocus.focus();
				objFocus.className = 'focus';
				
				break;
			case 38 : // Up arrow
				objFocus = objItem.previousElementSibling;
				if (!objFocus)
				{
					objFocus = objItem.nextElementSibling;
				}
				objItem.className = '';
				objFocus.focus();
				objFocus.className = 'focus';
				break;
			case 13 : // Enter
				//changed the next line from 0,3 to 0,10 (total of drags + drops)
				//strTarget = objItem.firstChild.data.substr(0, 3);
				strTarget = objItem.firstChild.data;
				drag.dropObject(strTarget);
				break;
			case 27 : // Escape
			case 9  : // Tab
				drag.objCurrent.removeAttribute('aria-owns');
				drag.objCurrent.removeChild(objItem.parentNode);
				drag.objCurrent.focus();
				for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
				{
					objList = document.getElementById(drag.arTargets[iCounter]);
					drag.objCurrent.setAttribute('aria-grabbed', 'false');
					objList.removeAttribute('aria-dropeffect');
					objList.className = '';
				}
				break;
		}
	},

	start : function(objEvent)
	{
		objEvent = objEvent || window.event;
		drag.removePopup();
		
		// Initialise properties
		drag.objCurrent = this; //sets the variable objCurrent as "the drag"
		drag.strAnswer = this.getAttribute("data-answer"); //sets the variable strAnswer as the expected dropzone (right answer)
		console.log("strAnswer in start = " + drag.strAnswer);

		drag.objCurrent.lastX = objEvent.clientX;
		drag.objCurrent.lastY = objEvent.clientY;
		drag.objCurrent.style.zIndex = '2';
		drag.objCurrent.setAttribute('aria-grabbed', 'true');

		document.onmousemove = drag.drag;
		document.onmouseup = drag.end;
		drag.identifyTargets(true);

		return false;
	},

	drag : function(objEvent)
	{
		objEvent = objEvent || window.event;

		// Calculate new position
		var iCurrentY = objEvent.clientY;
		var iCurrentX = objEvent.clientX;
		var iYPos = parseInt(drag.objCurrent.style.top, 10);
		var iXPos = parseInt(drag.objCurrent.style.left, 10);
		var iNewX, iNewY;

		iNewX = iXPos + iCurrentX - drag.objCurrent.lastX;
		iNewY = iYPos + iCurrentY - drag.objCurrent.lastY;

		drag.objCurrent.style.left = iNewX + 'px';
		drag.objCurrent.style.top = iNewY + 'px';
		drag.objCurrent.lastX = iCurrentX;
		drag.objCurrent.lastY = iCurrentY;

		return false;
	},

	calculatePosition : function (objElement, strOffset)
	{
		var iOffset = 0;
		
		// Get offset position in relation to parent nodes
		if (objElement.offsetParent)
		{
			do 
			{
				iOffset += objElement[strOffset];
				objElement = objElement.offsetParent;
			} while (objElement);
		}

		return iOffset;
	},

	identifyTargets : function (bHighlight)
	{
		var strExisting = drag.objCurrent.parentNode.getAttribute('id');
		console.log("bHighlight in identifyTargets = " + bHighlight);
		console.log("strExisting in identifyTargets = " + strExisting);
		var objList, iCounter;

		// Highlight the targets for the current drag item
		for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
		{
			objList = document.getElementById(drag.arTargets[iCounter]);
			
			if (bHighlight && drag.arTargets[iCounter] != strExisting)
			{
				objList.className = 'highlight';
				objList.setAttribute('aria-dropeffect', 'move');
			}
			else
			{
				objList.className = '';
				objList.removeAttribute('aria-dropeffect');
			}
		}
	},
	
	getTarget : function()
	{
		var strExisting = drag.objCurrent.parentNode.getAttribute('id');
		var iCurrentLeft = drag.calculatePosition(drag.objCurrent, 'offsetLeft');
		var iCurrentTop = drag.calculatePosition(drag.objCurrent, 'offsetTop');
		var iTolerance = 40;
		var objList, iLeft, iRight, iTop, iBottom, iCounter;

		for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
		{
			if (drag.arTargets[iCounter] != strExisting)
			{
				// Get position of the list
				objList = document.getElementById(drag.arTargets[iCounter]);
				iLeft = drag.calculatePosition(objList, 'offsetLeft') - iTolerance;
				iRight = iLeft + objList.offsetWidth + iTolerance;
				iTop = drag.calculatePosition(objList, 'offsetTop') - iTolerance;
				iBottom = iTop + objList.offsetHeight + iTolerance;

				// Determine if current object is over the target
				if (iCurrentLeft > iLeft && iCurrentLeft < iRight && iCurrentTop > iTop && iCurrentTop < iBottom)
				{
					return drag.arTargets[iCounter];
				}
			}
		}

		// Current object is not over a target
		return '';
	},

	dropObject : function(strTarget)
	{
		
		var objClone, objOriginal, objTarget, objEmpty, objBands, objItem, strAnswer, dragTxt;

		drag.removePopup();
		
		console.log("strAnswer in dropObject = " + drag.strAnswer); //Shows in console the ID of the dropzone where it should go
		console.log("strTarget in dropObject = " + strTarget); //Shows in console the ID of the dropzone
		
		if (strTarget.length > 0 && strTarget == drag.strAnswer) //Added "&& strTarget == drag.strAnswer" for validation of the right answer. The drag object will only drop in the right dropzone.
		{
			// Copy node to new target
			objOriginal = drag.objCurrent.parentNode;
			objClone = drag.objCurrent.cloneNode(true);

			// Remove previous attributes
			objClone.removeAttribute('style');
			objClone.className = objClone.className.replace(/\s*focused/, '');
			objClone.className = objClone.className.replace(/\s*hover/, '');

			// Add focus indicators
			objClone.onfocus = function() {this.className += ' focused'; };
			objClone.onblur = function() {this.className = this.className.replace(/\s*focused/, '');};
			objClone.onmouseover = function() {if (this.className.indexOf('hover') < 0) {this.className += ' hover';} };
			objClone.onmouseout = function() {this.className = this.className.replace(/\s*hover/, ''); };
			
			objTarget = document.getElementById(strTarget);
			console.log("objTarget in dropObject = " + objTarget);
			objOriginal.removeChild(drag.objCurrent);
			objTarget.appendChild(objClone);
			drag.objCurrent = objClone;
			drag.initialise(objClone);

			// Remove empty node if there are dragables in list
			objEmpty = getElementsByClassName(objTarget, 'li', 'empty');
			if (objEmpty[0])
			{
				objTarget.removeChild(objEmpty[0]);
			}

			// Add an empty node if there are no dragables in list
			objBands = objOriginal.getElementsByTagName('li');
			if (objBands.length === 0)
			{
				dragTxt = drag.objCurrent.innerHTML;//Gets the text of the dragbox
				objItem = document.createElement('li');
				objItem.appendChild(document.createTextNode(dragTxt));//Puts the dragbox text into the empty box for reference
				objItem.className = 'empty';
				objOriginal.appendChild(objItem);
			}
			objTarget.setAttribute("data-answered", "true");
			drag.objCurrent.setAttribute("data-moved", "true");
			console.log("data-answered in dropObject = " + objTarget.getAttribute('data-answered'));
			console.log("data-moved in dropObject = " + drag.objCurrent.getAttribute('data-moved'));
		}
		// Reset properties : Brings back the drag to its original position
		drag.objCurrent.style.left = '0px';
		drag.objCurrent.style.top = '0px';

		drag.objCurrent.style.zIndex = 'auto';
		drag.objCurrent.setAttribute('aria-grabbed', 'false');
		drag.objCurrent.removeAttribute('aria-owns');

		drag.identifyTargets(false);
		
		drag.checkAnswers();
	},

	end : function()
	{
		var strTarget = drag.getTarget(); //Gets the ID of the dropzone
		
		drag.dropObject(strTarget); //Manages the "DROP" of the drag in the dropzone and does all the necessaries actions

		document.onmousemove = null;
		document.onmouseup   = null;
		drag.objCurrent = null;
	},
	
	//@Author: Flavio Vasquez
	checkAnswers : function() //NEW function : Checks the total of answers and triggers the feedback
	{
		var arrDropzones = document.getElementsByName("dropzone"); //gets all the dropzones
		var arrDragzones = document.getElementsByName("dragzone"); //gets all the dragzones
		console.log("arrDropzones length = " + arrDropzones.length);
		console.log("arrDRAGzones length = " + arrDragzones.length);
		
		var sumDrops = 0;
		var sumDrags = 0;
		var iCounterDrop = 0;
		var iCounterDrag = 0;
		
		for (iCounterDrop=0; iCounterDrop<arrDropzones.length; iCounterDrop++)
		{
			if (arrDropzones[iCounterDrop].getAttribute("data-answered") == "true") //checks how many dropzones are filled
			{
				sumDrops++;
				console.log("sumDrops ++ (true) = " + sumDrops);
			}
		}
		
		for (iCounterDrag=0; iCounterDrag<arrDragzones.length; iCounterDrag++)
		{
			if (arrDragzones[iCounterDrag].getAttribute("data-moved") == "true") //checks how many dragzones are moved
			{
				sumDrags++;
				console.log("sumDrags ++ (true) = " + sumDrags);
			}
		}
		
		if (sumDrops === arrDropzones.length && sumDrags === arrDragzones.length) //if the total of filled dropzones is the same as the total of dropzones
		{
			console.log("sumDrops & sumDrags ARE filled");
			document.getElementById("feedback-container").style.display = "block"; //triggers the feedback
		}
		else
		{
			console.log("sumDrops & sumDrags ARE NOT filled");
		}
		
	}
};

function init ()
{
	var objItems = getElementsByClassName(document, 'li', 'draggable');
	console.log("objItems in init = " + objItems);
	var objItem, iCounter;

	for (iCounter=0; iCounter<objItems.length; iCounter++)
	{
		// Set initial values so can be moved
		objItems[iCounter].style.top = '0px';
		objItems[iCounter].style.left = '0px';

		// Put the list items into the keyboard tab order
		objItems[iCounter].tabIndex = 0;

		// Set ARIA attributes for draggables
		objItems[iCounter].setAttribute('aria-grabbed', 'false');
		objItems[iCounter].setAttribute('aria-haspopup', 'true');
		objItems[iCounter].setAttribute('role', 'listitem');

		// Provide a focus indicator
		objItems[iCounter].onfocus = function() {this.className += ' focused'; };
		objItems[iCounter].onblur = function() {this.className = this.className.replace(/\s*focused/, '');};
		objItems[iCounter].onmouseover = function() {if (this.className.indexOf('hover') < 0) {this.className += ' hover';} };
		objItems[iCounter].onmouseout = function() {this.className = this.className.replace(/\s*hover/, ''); };

		drag.initialise(objItems[iCounter]);
	}
	
	console.log("arTargets.length in init = " + drag.arTargets.length);
	
	// Set ARIA properties on the drag and drop list, and set role of this region to application
	for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
	{
		console.log("arTargets[iCounter] in init = " + drag.arTargets[iCounter]);
		
		objItem = document.getElementById(drag.arTargets[iCounter]);
		//objItem.setAttribute('aria-labelledby', drag.arTargets[iCounter] + 'h');
		objItem.setAttribute('role', 'list');
	}

	objItem = document.getElementById('dragdrop');
	objItem.setAttribute('role', 'application');
	
	objItems = null;
}

window.onload = init;
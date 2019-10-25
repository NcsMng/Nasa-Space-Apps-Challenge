function MouseEventsListener(domElement, hitboxes) {  
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var eventCallback = [];
	
	function addMouseEvent(eventName) {
		domElement.addEventListener(eventName.toLowerCase(), function(event) {
			var objectName = getSelectedObject(event);
			if (objectName != null)
				eventCallback[objectName][eventName](mouse, raycaster);
		}, false);
	}
	function getSelectedObject(mouseEvent) {
		updateRaycaster(mouseEvent);
		var intersects = raycaster.intersectObjects(hitboxes, false);
		var objectName;
		for (var i = 0; i < intersects.length; i++)
			if ((objectName = intersects[i].object.name) != "")
				return objectName;
		return null;
	}
	function updateRaycaster(mouseEvent) {
		var bounds = domElement.getBoundingClientRect();
		mouse.x = ((mouseEvent.clientX - bounds.left) / domElement.clientWidth) * 2 - 1;
		mouse.y = - ((mouseEvent.clientY - bounds.top) / domElement.clientHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
	}
	function getDefaultCallbacks() {
		var ev = { events: {} };
		var mouseIsHover = false;
		var mouseMoved = false;
		ev.click = function() {
			if (ev.events.click != null)
				ev.events.click();
		};
		ev.dblClick = function() {
			if (ev.events.dblClick != null)
				ev.events.dblClick();
		};
		ev.mouseEnter = function() {
			if (ev.events.mouseEnter != null)
				ev.events.mouseEnter();
		};
		ev.mouseLeave = function() {
			if (ev.events.mouseLeave != null)
				ev.events.mouseLeave();
		};
		ev.mouseMove = function() {
			mouseMoved = true;
			if (!mouseIsHover) {
				mouseIsHover = true;
				ev.mouseEnter();
			}
			if (ev.events.mouseMove != null)
				ev.events.mouseMove();
		};
		domElement.addEventListener("mousemove", function() {
			if (mouseIsHover && !mouseMoved) {
				mouseIsHover = false;
				ev.mouseLeave();
			}
			mouseMoved = false;
		});
		return ev;
	}
	
	this.setCallbacks = function(id) {
		eventCallback[id] = getDefaultCallbacks();
	};
	this.getCallbacks = function(id) {
		return eventCallback[id];
	};
	
	
	addMouseEvent("click");
	addMouseEvent("dblClick");
	addMouseEvent("mouseMove");
}
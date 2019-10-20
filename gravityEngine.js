var unlockCamera;
function initGravity() {
	var perMmotiviDiDebug = 10;
	var objects = [];
	var timePerStep = 0.005;
	var G = 1;
	var isComputing = false;
	var lastObjectInFocus;
	function createObject(texture, radius, mass, x, y, z, speedX, speedY, speedZ, lightSourceColor, onClick) {
		var object = graphicFunctions.addObject(texture, radius, x, y, z, lightSourceColor);
		object.mass = mass;
		object.speed = {x: speedX, y: speedY, z: speedZ};
		object.events.onClick = function() {
			if (!object.cameraFollow) {
				if (onClick != null)
					onClick(object);
				turnOffGravity();
				graphicFunctions.lockCameraControls();
				if (lastObjectInFocus != null)
					lastObjectInFocus.catchEvents();
				object.ignoreEvents();
				lastObjectInFocus = object;
				graphicFunctions.setCameraCenter(object.x, object.y, object.z, object.cameraDistance, function() {
					object.follow();
					object.lockCamera();
					turnOnGravity();
					unlockCamera = object.unlockCamera;
				});
			}
		};
		return object;
	}
	function addObject(texture, radius, mass, x, y, z, speedX, speedY, speedZ, lightSourceColor, onClick) {
		var object = createObject(texture, radius, mass, x, y, z, speedX, speedY, speedZ, lightSourceColor, onClick);
		objects.push(object);
		return object;
	}
	var gravityInterval = null;
	function toggleGravity() {
		if (gravityInterval == null)
			turnOnGravity();
		else
			turnOffGravity();
	}
	function turnOnGravity() {
		if (gravityInterval != null)
			return;
		gravityInterval = setInterval(applyForce, perMmotiviDiDebug);
	}
	function turnOffGravity() {
		if (gravityInterval == null)
			return;
		clearInterval(gravityInterval);
		gravityInterval = null;
	}
	function applyForce() {
		if (isComputing)
			return;
		isComputing = true;
		var objLen = objects.length;
		var collisions = new Array(objLen);
		for (var i = 0; i < objLen; i++)
			if(objects[i] != null) {
				var x = 0, y = 0, z = 0;
				var thisObj = objects[i];
				collisions[i] = null;
				for (var j = 0; j < objLen; j++)
					if (j != i && objects[j] != null) {
						var xDiff = thisObj.x - objects[j].x;
						var yDiff = thisObj.y - objects[j].y;
						var zDiff = thisObj.z - objects[j].z;
						var d2 = xDiff * xDiff + yDiff * yDiff + zDiff * zDiff;
						var d = Math.sqrt(d2);
						
						if (d > thisObj.radius + objects[j].radius) {
							var acceleration = objects[j].mass * G / d2;
							var angle1 = zDiff / d;
							var angle2 = yDiff / Math.sqrt(d2 - zDiff * zDiff);
							var Fh = acceleration * Math.sqrt(1 - angle1 * angle1);
							z += acceleration * angle1;
							if (!isNaN(angle2)) {
								if (angle2 > 1)
									angle2 = 1;
								else if (angle2 < -1)
									angle2 = -1;
								y += Fh * angle2;
								if (xDiff > 0)
									x += Fh * Math.sqrt(1 - angle2 * angle2);
								else
									x -= Fh * Math.sqrt(1 - angle2 * angle2);
							}
							collisions[j] = null;
						} else {
							if (thisObj.mass > objects[j].mass)
								collisions[j] = {
									object1: thisObj,
									object2: objects[j],
									index1: i,
									index2: j
								};
							else
								collisions[j] = {
									object1: objects[j],
									object2: thisObj,
									index1: j,
									index2: i
								};
							collisions[i] = collisions[j];
							objects[j] = null;
							objects[i] = null;
						}
					}
				thisObj.speed.x -= timePerStep * x;
				thisObj.speed.y -= timePerStep * y;
				thisObj.speed.z -= timePerStep * z;
			}
		var newObjectArray = [];
		for (var i = 0; i < objLen; i++)
			if (collisions[i] == null) {
				objects[i].moveBy(objects[i].speed.x * timePerStep, objects[i].speed.y * timePerStep, objects[i].speed.z * timePerStep);
				newObjectArray.push(objects[i]);
			} else if (collisions[i].index1 == i){
				collisions[i].object1.remove();
				collisions[i].object2.remove();
				//TODO: compute radius
				newObjectArray.push(createObject(collisions[i].object1.texture, collisions[i].object1.radius, collisions[i].object1.mass + collisions[i].object2.mass, collisions[i].object1.x, collisions[i].object1.y, collisions[i].object1.z, collisions[i].object1.speed.x, collisions[i].object1.speed.y, collisions[i].object1.speed.z, collisions[i].object1.lightSourceColor));
			}
		objects = newObjectArray;
		isComputing = false;
	}
	return {createObject, addObject, toggleGravity, turnOnGravity, turnOffGravity};
}

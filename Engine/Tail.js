function Tail(x, y, z, scene, tailLastPointMaxDistance, minTailPoints, maxTailPoints) {
	if (x == null || y == null || z == null || scene == null || tailLastPointMaxDistance == null || minTailPoints == null || maxTailPoints == null)
		return null;
	var nlpmd = -tailLastPointMaxDistance;
	var pointArray = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, y, z)];
	var geometry = new THREE.BufferGeometry().setFromPoints(pointArray);
	var tail = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0x666666, transparent: true, opacity: 1, linewidth: 1}));
	tail.renderOrder = 1;
	scene.add(tail);
	
	this.addPoint = function(x, y, z) {
		var firstPoint = pointArray[0];
		var xDist = firstPoint.x - x, yDist = firstPoint.y - y, zDist = firstPoint.z - z;
		var totPoints = pointArray.length;
		if ((totPoints > minTailPoints)&&(totPoints > maxTailPoints || xDist < tailLastPointMaxDistance && xDist > nlpmd && yDist < tailLastPointMaxDistance && yDist > nlpmd && zDist < tailLastPointMaxDistance && zDist > nlpmd))
			pointArray.shift();
		pointArray.push(new THREE.Vector3(x, y, z));
		geometry = new THREE.BufferGeometry().setFromPoints(pointArray);
		tail.geometry.dispose();
		tail.geometry = geometry;
	};
	this.remove = function() {
		scene.remove(tail);
	}
}
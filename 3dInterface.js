var textureNames = ["earth", "sun", "moon", "venus", "mercury", "mars", "jupiter", "saturn"];
var textures = {};
var graphicFunctions;
function startRendering(args) {
	var settings;
	var tailPoints, _3DObjectsEvents = {};
	var scene, camera, renderer, controls, sceneCenterSphere;
	
	function main() {
		settings = getArgsOrDefault({
			showTail: true,
			tailPoints: 100,
			showCenterSphere: true,
			showAxes: false,
			interactionMode: 0
		});
		startRendering();
		manageObjectEvents();
		
		if (settings.interactionMode == 0)
			startNavigationMode();
		else if (settings.interactionMode == 1)
			startEditingMode();
		if (settings.showAxes)
			addAxes();
		if (settings.showCenterSphere)
			addSceneCenterSphere();
	}
	
	function getArgsOrDefault(defaultSettings) {
		if (args == null)
			args = {};
		var keys = Object.keys(defaultSettings);
		var settings = {};
		for (var i = 0; i < keys.length; i++)
			settings[keys[i]] = args[keys[i]] == null ? defaultSettings[keys[i]] : args[keys[i]];
		return settings;
	}
	
	function manageObjectEvents() {
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		var domElement = renderer.domElement;
		domElement.addEventListener('click', function(event){
			var bounds = domElement.getBoundingClientRect();
			mouse.x = ((event.clientX - bounds.left) / domElement.clientWidth) * 2 - 1;
			mouse.y = - ((event.clientY - bounds.top) / domElement.clientHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
			var intersects = raycaster.intersectObjects(scene.children, false);
			var minName = null;
			var tmpDist = null;
			for (var i = 0; i < intersects.length; i++)
				if (intersects[i].object.name != "")
					if (tmpDist == null) {
						tmpDist = intersects[i].distance;
						minName = intersects[i].object.name
					} else if (tmpDist > intersects[i].distance) {
						tmpDist = intersects[i].distance;
						minName = intersects[i].object.name
					}
			if (minName != null)
				if (_3DObjectsEvents[minName].onClick != null)
					_3DObjectsEvents[minName].onClick();
		}, false);
	}
	
	function startRendering() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth /  window.innerHeight, 0.1, 1000);
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		renderer.setSize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', onWindowResize, false);
		function onWindowResize(){
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
		document.body.appendChild(renderer.domElement);
		camera.position.z = 175;
		camera.position.x = 0;
		camera.position.y = 0;
		var light = new THREE.AmbientLight(0xffffff);
		light.intensity = 1.5;
		scene.add(light);
	}
	
	function animate() {
		requestAnimationFrame(animate);
		controls.update();
		sceneCenterSphere.position.set(controls.target.x, controls.target.y, controls.target.z);
		var rateo = controls.target.distanceTo(controls.object.position) / 5;
		sceneCenterSphere.scale.set(rateo, rateo, rateo);
		renderer.render(scene, camera);
	}
	
	function startNavigationMode() {
		if (controls != null)
			controls.dispose();
		controls = new THREE.TrackballControls(camera);
		controls.rotateSpeed = 5;
		controls.zoomSpeed = 5;
		controls.panSpeed = 2;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 1;
	}
	
	function startEditingMode() {
		if (controls != null)
			controls.dispose();
		
	}
	
	function addAxes() {
		scene.add(new THREE.AxesHelper(100));
	}
	
	function addSceneCenterSphere() {
		sceneCenterSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({color: 0xff0000}));
		scene.add(sceneCenterSphere);
	}
	
	function getGraphicFunctions() {
		var textureLoader = new THREE.TextureLoader();
		var objectId = 1;
		function addObject(texture, radius, x, y, z) {
			if (x == null)
				x = 0;
			if (y == null)
				y = 0;
			if (z == null)
				z = 0;
			var model = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), texture);
			model.position.set(x, y, z);
			scene.add(model);
			var id = objectId++;
			model.name = id;
			_3DObjectsEvents[id] = {};
			var tailFunctions;
			if (settings.showTail)
				tailFunctions = createTail(x, y, z);
			else
				tailFunctions = {addPoint: function(x, y, z) {}};
			var object = {id, texture, radius, x, y, z, events: _3DObjectsEvents[id],
					setPosition: function(x, y, z) {
						model.position.set(x, y, z);
					},
					setScale: function(scale) {
						model.scale.set(scale, scale, scale);
					},
					remove: function() {
						scene.remove(model);
					},
					moveBy: function(x, y, z) {
						object.x += x;
						object.y += y;
						object.z += z;
						tailFunctions.addPoint(object.x, object.y, object.z);
						model.position.set(object.x, object.y, object.z);
					}
				};
			return object;
		}
		function loadTexture(textureName, onComplete) {
			textureLoader.load("textures/" + textureName, function(texture) {
				textures[textureName] = new THREE.MeshLambertMaterial({map: texture});
				if (onComplete != null)
					onComplete();
			});
		}
		function loadTextures(textureName, onComplete) {
			var n = textureName.length;
			for(var i = 0; i < textureName.length; i++)
				graphicFunctions.loadTexture(textureName[i], function() {
					if (onComplete != null && --n == 0)
						onComplete();
				});
		}
		function setMode() {
			
		}
		function createTail(x, y, z) {
			var tailPoints = settings.tailPoints;
			var pointArray = new Array(tailPoints);
			for (var i = 0; i < tailPoints; i++)
				pointArray[i] = new THREE.Vector3(x, y, z);
			var curve = new THREE.CatmullRomCurve3(pointArray);
			var points = curve.getPoints(50);
			var geometry = new THREE.BufferGeometry().setFromPoints(pointArray);
			var material = new THREE.LineBasicMaterial({color: 0x1e90ff});
			var tail = new THREE.Line(geometry, material);
			scene.add(tail);
			
			return {
				addPoint: function(x, y, z) {
					curve.points.shift();
					curve.points.push(new THREE.Vector3(x, y, z));
					geometry = new THREE.BufferGeometry().setFromPoints(pointArray);
					tail.geometry.dispose();
					tail.geometry = geometry;
				}
			};
		}
		return {addObject, loadTexture, loadTextures, setMode};
	}
	
	main();
	animate();
	
	return getGraphicFunctions();
}
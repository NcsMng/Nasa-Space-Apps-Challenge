var textureNames = ["earth", "sun", "moon", "venus", "mercury", "mars", "jupiter", "saturn", "smokeparticle"];
var textures = {};
var graphicFunctions;
<<<<<<< Updated upstream
function startRendering(args) {
	var settings;
	var tailPoints, _3DObjectsEvents = {};
	var scene, camera, renderer, controls, sceneCenterSphere;
=======

function startRendering(element, args) {
	var settings;
	var tailPoints, _3DObjectsEvents = {};
	var scene, camera, renderer, controls, sceneCenterSphere, models = [], objects = [], controlMode, skyBox;
>>>>>>> Stashed changes
	
	function main() {
		settings = getArgsOrDefault({
			showTail: true,
			tailPoints: 100,
			showCenterSphere: true,
			showAxes: false,
			interactionMode: 0
		});
		startRendering();
		loadTexture("skyBox", createSkyBox);
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
	//Prendere 7 punti sulla circonferenza di intersezione
	//Aggiungere 7 oggetti che hanno velocità da noi definita a priori
	//Aggiungere effetto fumo
	//Fondere gli oggetti
	function getArgsOrDefault(defaultSettings) {
		if (args == null)
			args = {};
		var keys = Object.keys(defaultSettings);
		var settings = {};
		for (var i = 0; i < keys.length; i++)
			settings[keys[i]] = args[keys[i]] == null ? defaultSettings[keys[i]] : args[keys[i]];
		console.log(keys);
		console.log(settings);
		console.log(defaultSettings);
		console.log(args);
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
		camera = new THREE.PerspectiveCamera(75, window.innerWidth /  window.innerHeight, 0.1, 10000000);
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
<<<<<<< Updated upstream
		controls.update();
		sceneCenterSphere.position.set(controls.target.x, controls.target.y, controls.target.z);
		var rateo = controls.target.distanceTo(controls.object.position) / 5;
		sceneCenterSphere.scale.set(rateo, rateo, rateo);
=======
		if (controlMode == 0) {
			var dist = controls.target.distanceTo(controls.object.position);
			if (sceneCenterSphere != null) {
				var rateo = dist / 5;
				sceneCenterSphere.position.set(controls.target.x, controls.target.y, controls.target.z);
				sceneCenterSphere.scale.set(rateo, rateo, rateo);
			}
			/*if (skyBox != null) {
				var skyBoxRateo = dist;
				skyBox.position.set(controls.target.x, controls.target.y, controls.target.z);
				skyBox.scale.set(skyBoxRateo, skyBoxRateo, skyBoxRateo);
			}*/
			controls.update();
		}
>>>>>>> Stashed changes
		renderer.render(scene, camera);
	}
	
	function startNavigationMode() {
<<<<<<< Updated upstream
		if (controls != null)
			controls.dispose();
=======
		controlMode = 0;
		if (controls != null)
			controls.dispose();
		for (var i = 0; i < objects.length; i++) {
			objects[i].x = models[i].position.x;
			objects[i].y = models[i].position.y;
			objects[i].z = models[i].position.z;
		}
>>>>>>> Stashed changes
		controls = new THREE.TrackballControls(camera);
		controls.rotateSpeed = 5;
		controls.zoomSpeed = 5;
		controls.panSpeed = 2;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 1;
		controls.minDistance = 2;
		controls.maxDistance = 10000;
	}
	
	function startEditingMode() {
		if (controls != null)
			controls.dispose();
<<<<<<< Updated upstream
		
=======
		controlMode = 1;
		controls = new THREE.DragControls(models, camera, renderer.domElement);
>>>>>>> Stashed changes
	}
	
	function addAxes() {
		scene.add(new THREE.AxesHelper(100));
	}
	
	function addSceneCenterSphere() {
		sceneCenterSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({color: 0xff0000}));
		scene.add(sceneCenterSphere);
	}
	
	function createSkyBox() {
		textures.skyBox.mapping = THREE.UVMapping;
		skyBox = new THREE.Mesh(new THREE.SphereGeometry(10000000, 4, 4), textures.skyBox);
		skyBox.material.side = THREE.DoubleSide;
		scene.add(skyBox);
	}
	
	function getGraphicFunctions() {
		var objectId = 1;
		function addObject(texture, radius, x, y, z) {
			if (x == null)
				x = 0;
			if (y == null)
				y = 0;
			if (z == null)
				z = 0;
			var model = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), texture);
			model.material.side = THREE.DoubleSide;
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
						tailFunctions.remove();
					},
					moveBy: function(x, y, z) {
						object.x += x;
						object.y += y;
						object.z += z;
						tailFunctions.addPoint(object.x, object.y, object.z);
						model.position.set(object.x, object.y, object.z);
					}
				};
			models.push(model);	
			objects.push(object);
			return object;
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
				},
				remove: function() {
					scene.remove(tail);
				}
			};
		}
		return {addObject, loadTexture, loadTextures, setMode};
	}
	var textureLoader = new THREE.TextureLoader();
	function loadTexture(textureName, onComplete) {
		textureLoader.load("textures/" + textureName, function(texture) {
			textures[textureName] = new THREE.MeshLambertMaterial({map: texture});
			if (onComplete != null)
				onComplete();
		});
	}

	main();
	animate();
	
	return getGraphicFunctions();
}
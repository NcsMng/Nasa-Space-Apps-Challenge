var textureNames = ["earth", "sun", "sun2", "moon", "venus", "mercury", "mars", "jupiter", "saturn", "smokeparticle"];
var textures = {};
var SKYBOX;

function startRendering(element, args) {
	var settings;
	var tailPoints, _3DObjectsEvents = {};
	var scene, camera, renderer, controls, sceneCenterSphere, models = [], objects = [], controlMode, skyBox, moveControlOffset, moveCameraOffset, controlsTarget;
	
	function main() {
		settings = getArgsOrDefault({
			showTail: true,
			tailPoints: 100,
			showCenterSphere: true,
			showAxes: false,
			interactionMode: 0
		});
		init();
		SKYBOX = new THREE.CubeTextureLoader().load(['images/px.png', 'images/nx.png', 'images/py.png', 'images/ny.png', 'images/pz.png', 'images/nz.png']);
		SKYBOX.mapping = THREE.CubeRefractionMapping;
		scene.background = SKYBOX;
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
			for (var i = 0; i < intersects.length; i++) {
				if (intersects[i].object.name != "")
					if (tmpDist == null) {
						tmpDist = intersects[i].distance;
						minName = intersects[i].object.name
					} else if (tmpDist > intersects[i].distance) {
						tmpDist = intersects[i].distance;
						minName = intersects[i].object.name
					}
			}
			if (minName != null)
				if (_3DObjectsEvents[minName].onClick != null)
					_3DObjectsEvents[minName].onClick();
		}, false);
	}
	
	function init() {
		var computedStyle = window.getComputedStyle(element);
		var width = parseInt(computedStyle.getPropertyValue('width'));
		var height = parseInt(computedStyle.getPropertyValue('height'));
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, width /  height, 0.1, 10000000);
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		renderer.setSize(width, height);
		window.addEventListener('resize', onResize, false);
		element.appendChild(renderer.domElement);
		camera.position.z = 175;
		camera.position.x = 0;
		camera.position.y = 0;
		scene.add(new THREE.AmbientLight(0x202020));
	}
	
	function onResize(){
		var computedStyle = window.getComputedStyle(element);
		var width = parseInt(computedStyle.getPropertyValue('width'));
		var height = parseInt(computedStyle.getPropertyValue('height'));
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}
	
	function animate() {
		requestAnimationFrame(animate);
		if (controlMode == 0) {
			var dist = controls.target.distanceTo(controls.object.position);
			if (sceneCenterSphere != null) {
				var rateo = dist / 5;
				sceneCenterSphere.position.set(controls.target.x, controls.target.y, controls.target.z);
				sceneCenterSphere.scale.set(rateo, rateo, rateo);
			}
			if (moveControlOffset != null) {
				if (moveControlOffset.x == 0 && moveControlOffset.y == 0 && moveControlOffset.z == 0) {
					moveControlOffset.onComplete();
					moveControlOffset = null;
				} else {
					var x, y, z;
					x = moveControlOffset.x;
					y = moveControlOffset.y;
					z = moveControlOffset.z;
					
					if (Math.abs(x) < 1) {}
					else if (x > 0)
						x = 1;
					else
						x = -1;
					if (Math.abs(y) < 1) {}
					else if (y > 0)
						y = 1;
					else
						y = -1;
					if (Math.abs(z) < 1) {}
					else if (z > 0)
						z = 1;
					else
						z = -1;
					
					moveControlOffset = {x: moveControlOffset.x - x, y: moveControlOffset.y - y, z: moveControlOffset.z - z, onComplete: moveControlOffset.onComplete};
					x += controls.target.x;
					y += controls.target.y;
					z += controls.target.z;
					controls.target.set(x, y, z);
				}
			}
			if (moveCameraOffset != null) {
				if (moveCameraOffset.x == 0 && moveCameraOffset.y == 0 && moveCameraOffset.z == 0) {
					moveCameraOffset.onComplete();
					moveCameraOffset = null;
				} else {
					var x, y, z;
					x = moveCameraOffset.x;
					y = moveCameraOffset.y;
					z = moveCameraOffset.z;
					
					if (Math.abs(x) < 1) {}
					else if (x > 0)
						x = 1;
					else
						x = -1;
					if (Math.abs(y) < 1) {}
					else if (y > 0)
						y = 1;
					else
						y = -1;
					if (Math.abs(z) < 1) {}
					else if (z > 0)
						z = 1;
					else
						z = -1;
					
					moveCameraOffset = {x: moveCameraOffset.x - x, y: moveCameraOffset.y - y, z: moveCameraOffset.z - z, onComplete: moveCameraOffset.onComplete};
					x += camera.position.x;
					y += camera.position.y;
					z += camera.position.z;
					camera.position.set(x, y, z);
				}
			}
			controls.update();
		}
		renderer.render(scene, camera);
	}
	
	function startNavigationMode() {
		controlMode = 0;
		if (controls != null)
			controls.dispose();
		for (var i = 0; i < objects.length; i++) {
			objects[i].x = models[i].position.x;
			objects[i].y = models[i].position.y;
			objects[i].z = models[i].position.z;
		}
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.rotateSpeed = 1;
		controls.autoRotateSpeed = 1;
		controls.autoRotate = false;
		controls.zoomSpeed = 1;
		controls.enableZoom = true;
		controls.enablePan = false;
		controls.enableRotate = true;
		controls.minDistance = 2;
		controls.maxDistance = 10000;
		controls.enableDamping = true;
		controls.dampingFactor = 0.07;
	}
	
	function startEditingMode() {
		if (controls != null)
			controls.dispose();
		controlMode = 1;
		controls = new THREE.DragControls(models, camera, renderer.domElement);
	}
	
	function addAxes() {
		scene.add(new THREE.AxesHelper(100));
	}
	
	function addSceneCenterSphere() {
		sceneCenterSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({color: 0xff0000}));
		scene.add(sceneCenterSphere);
	}
	
	function createSkyBox() {
		var material = new THREE.MeshBasicMaterial({map: textures.skyBox.baseMap});
		material.mapping = THREE.UVMapping;
		skyBox = new THREE.Mesh(new THREE.SphereGeometry(10000000, 4, 4), material);
		skyBox.material.side = THREE.DoubleSide;
		scene.add(skyBox);
	}
	
	function getGraphicFunctions() {
		var objectId = 1;
		var cameraFollowObject = null;
		function getControlsPosition() {
			return controlsTarget;
		}
		function addObjectFromModel(objectGenerator, x, y, z) {
			var radius = objectGenerator.radius;
			var texture = objectGenerator.mainTexture;
			var lightSourceColor = objectGenerator.lightSourceColor;
			if (x == null)
				x = 0;
			if (y == null)
				y = 0;
			if (z == null)
				z = 0;
			var id = objectId++;
			var model = new THREE.Mesh(new THREE.SphereGeometry(radius + 3, 32, 32), new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
			model.renderOrder = 3;
			objectGenerator.generate(model, objectGenerator, {
				setAsLightSource: function(intensity) {
					var light = new THREE.PointLight(lightSourceColor, intensity);
					model.add(light);
					var spriteMap = new THREE.TextureLoader().load("images/glow.png");
					var spriteMaterial = new THREE.SpriteMaterial({map: spriteMap, color: lightSourceColor});
					lightSprite = new THREE.Sprite(spriteMaterial);
					lightSprite.scale.set(radius * 4, radius * 3.5, 1);
					lightSprite.renderOrder = 2;
					model.add(lightSprite);
				},
				getCamera: function() {
					return camera;
				}
			});
			var object = getNewObject(model, id, texture, radius, lightSourceColor, x, y, z, objectGenerator);
			model.name = id;
			model.position.set(x, y, z);
			scene.add(model);
			models.push(model);
			objects.push(object);
			return object;
		}
		function addObject(texture, radius, x, y, z, lightSourceColor) {
			var isALightSource = lightSourceColor != null;
			if (x == null)
				x = 0;
			if (y == null)
				y = 0;
			if (z == null)
				z = 0;
			if (texture == null) {
				console.error("TEXTURE NOT FOUND!");
				return;
			}
			var id = objectId++;
			var model = new THREE.Mesh(new THREE.SphereGeometry(radius + 3, 32, 32), new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
			var planet = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), isALightSource ? new THREE.MeshBasicMaterial({map: texture.baseMap, opacity: 0.5}) : texture.meshLambertMaterial);
			planet.material.side = THREE.DoubleSide;
			model.add(planet);
			model.renderOrder = 3;
			var lightSprite;
			if (isALightSource) {
				var light = new THREE.PointLight(lightSourceColor, 1.5);
				model.add(light);
				var spriteMap = new THREE.TextureLoader().load("images/glow.png");
				var spriteMaterial = new THREE.SpriteMaterial({map: spriteMap, color: lightSourceColor});
				lightSprite = new THREE.Sprite(spriteMaterial);
				lightSprite.scale.set(radius * 4, radius * 3.5, 1);
				lightSprite.renderOrder = 2;
				model.add(lightSprite);
			}
			var object = getNewObject(model, id, texture, radius, lightSourceColor, x, y, z, null);
			model.name = id;
			model.position.set(x, y, z);
			scene.add(model);
			models.push(model);
			objects.push(object);
			return object;
		}
		function getNewObject(model, id, texture, radius, lightSourceColor, x, y, z, objectGenerator) {
			var tailFunctions;
			if (settings.showTail)
				tailFunctions = createTail(x, y, z);
			else
				tailFunctions = {addPoint: function(x, y, z) {}};
			var cameraDistance = radius * 2;
			var cameraLock = false;
			_3DObjectsEvents[id] = {};
			var object = {id, texture, radius, cameraDistance, lightSourceColor, objectGenerator, cameraFollow: false, x, y, z, events: _3DObjectsEvents[id],
					setPosition: function(x, y, z) {
						model.position.set(x, y, z);
						if (object.cameraFollow) {
							controls.target.set(x, y, z);
							if (cameraLock)
								camera.position.set(x + cameraDistance, y + cameraDistance, z + cameraDistance);
						}
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
						x = object.x;
						y = object.y;
						z = object.z;
						tailFunctions.addPoint(x, y, z);
						model.position.set(x, y, z);
						if (object.cameraFollow) {
							controls.target.set(x, y, z);
							if (cameraLock)
								camera.position.set(x + cameraDistance, y + cameraDistance, z + cameraDistance);
						}
					},
					follow: function() {
						if (cameraFollowObject != null)
							cameraFollowObject.unfollow();
						object.cameraFollow = true;
						cameraFollowObject = object;
					},
					unfollow: function() {
						object.cameraFollow = false;
						if (cameraLock)
							unlockCamera();
					},
					lockCamera: function() {
						cameraLock = true;
						controls.enableZoom = false;
						controls.enableRotate = false;
					},
					unlockCamera: function() {
						cameraLock = false;
						controls.enableZoom = true;
						controls.enableRotate = true;
					},
					ignoreEvents: function() {
						model.name = "";
					},
					catchEvents: function() {
						model.name = id;
					}
				};
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
		function setMode(mode) {
			if (mode == 0){
				startNavigationMode();
			}
			else if (mode == 1){
				controlsTarget = controls.target;
				startEditingMode();
			}

		}
		function createTail(x, y, z) {
			var tailPoints = settings.tailPoints;
			var pointArray = new Array(tailPoints);
			for (var i = 0; i < tailPoints; i++)
				pointArray[i] = new THREE.Vector3(x, y, z);
			var curve = new THREE.CatmullRomCurve3(pointArray);
			var points = curve.getPoints(50);
			var geometry = new THREE.BufferGeometry().setFromPoints(pointArray);
			var material = new THREE.LineBasicMaterial({color: 0x666666, transparent: true, opacity: 1, linewidth: 1});
			var tail = new THREE.Line(geometry, material);
			tail.renderOrder = 1;
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
		function setCameraCenter(x, y, z, distance, onComplete) {
			var i = 2;
			moveControlOffset = {x: x - controls.target.x, y: y - controls.target.y, z: z - controls.target.z, onComplete: function() { if (--i == 0) onComplete(); }};
			moveCameraOffset =  {x: x - camera.position.x + distance, y: y - camera.position.y + distance, z: z - camera.position.z + distance, onComplete: function() { if (--i == 0) onComplete(); }};
		}
		function lockCameraControls() {
			controls.enableZoom = false;
			controls.enableRotate = false;
		}
		return {addObject, loadTexture, loadTextures, setMode, setCameraCenter, lockCameraControls, addObjectFromModel, toggleResize: onResize, getControlsPosition};
	}
	var textureLoader = new THREE.TextureLoader();
	function loadTexture(textureName, onComplete) {
		textureLoader.load("textures/" + textureName, function(texture) {
			textures[textureName] = {
				meshLambertMaterial: new THREE.MeshLambertMaterial({map: texture}),
				baseMap: texture
			};
			if (onComplete != null)
				onComplete();
		});
	}

	main();
	animate();
	
	return getGraphicFunctions();
}
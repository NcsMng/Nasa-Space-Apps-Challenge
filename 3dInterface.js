var textureNames = ["earth", "jupiter", "mars", "mercury", "moon", "neptune", "saturn", "sun", "sun2", "uranus", "venus"];
var textures = {};
var SKYBOX;

function startRendering(element, args) {
	var settings;
	var tailPoints, _3DObjectsEvents = [];
	var scene, camera, renderer, controls, sceneCenterSphere, controlMode, skyBox, moveControlOffset, moveCameraOffset, controlsTarget, group, grid, domElement, hitboxes = [];
	var lineVertexShader = `
		varying vec3 vPos;
		void main() {
			vPos = position;
			vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
			gl_Position = projectionMatrix * modelViewPosition;
		}
	`;
	var lineFragmentShader = `
		uniform vec3 origin;
		uniform vec3 color;
		uniform float limitDistance;
		varying vec3 vPos;
		void main() {
			float distance = clamp(length(vPos - origin), 0., limitDistance);
			float opacity = 1. - distance / limitDistance;
			gl_FragColor = vec4(color, opacity * opacity);
		}
	`;
	function main() {
		settings = getArgsOrDefault({
			showTail: true,
			tailLastPointMaxDistance: 20,
			tailPoints: 100,
			maxTailPoints: Infinity,
			minTailPoints: 100,
			showCenterSphere: true,
			showAxes: false,
			axesSize: 1000,
			showGrid: true
		});
		init();
		if (settings.showGrid)
			addGrid();
		SKYBOX = new THREE.CubeTextureLoader().load(['images/px.png', 'images/nx.png', 'images/py.png', 'images/ny.png', 'images/pz.png', 'images/nz.png']);
		SKYBOX.mapping = THREE.CubeRefractionMapping;
		scene.background = SKYBOX;
		manageObjectEvents();
		
		initNavigation();
		if (settings.showAxes)
			addAxes(settings.axesSize);
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
		addMouseEvent("click");
		addMouseEvent("dblclick");
		addMouseEvent("mousemove");
	}
	function addMouseEvent(eventName) {
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		domElement.addEventListener(eventName, function(event){
			var objectName = getSelectedObject(raycaster, event, mouse);
			if (objectName != null)
				_3DObjectsEvents[objectName][eventName]();
		}, false);
	}
	function getSelectedObject(raycaster, mouseEvent, mouse) {
		updateRaycaster(raycaster, mouseEvent, mouse);
		var intersects = raycaster.intersectObjects(hitboxes, false);
		var objectName;
		for (var i = 0; i < intersects.length; i++)
			if ((objectName = intersects[i].object.name) != "")
				return objectName;
		return null;
	}
	function updateRaycaster(raycaster, mouseEvent, mouse) {
		var bounds = domElement.getBoundingClientRect();
		mouse.x = ((mouseEvent.clientX - bounds.left) / domElement.clientWidth) * 2 - 1;
		mouse.y = - ((mouseEvent.clientY - bounds.top) / domElement.clientHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
	}
	
	function init() {
		var computedStyle = window.getComputedStyle(element);
		var width = parseInt(computedStyle.getPropertyValue('width'));
		var height = parseInt(computedStyle.getPropertyValue('height'));
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, width /  height, 0.1, 10000000000000);
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		domElement = renderer.domElement
		group = new THREE.Group();
		renderer.setSize(width, height);
		window.addEventListener('resize', onResize, false);
		element.appendChild(domElement);
		camera.position.z = 0;
		camera.position.x = 0;
		camera.position.y = 1000;
		scene.add(group);
		group.add(new THREE.AmbientLight(0x202020));
	}
	
	function onResize(){
		var computedStyle = window.getComputedStyle(element);
		var width = parseInt(computedStyle.getPropertyValue('width'));
		var height = parseInt(computedStyle.getPropertyValue('height'));
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}
	
	function addGrid() {
		grid = new THREE.Group();
		var largeGrid = new THREE.GridHelper(170, 85);
		largeGrid.material = new THREE.ShaderMaterial({
				uniforms: {
					color: {
						value: new THREE.Color(0x555555)
					},
					origin: {
						value: new THREE.Vector3()
					},
					limitDistance:{
						value: 100
					}
				},
				vertexShader: lineVertexShader,
				fragmentShader: lineFragmentShader,
				transparent: true
			});
		var smallGrid = new THREE.GridHelper(50, 150);
		smallGrid.material = new THREE.ShaderMaterial({
				uniforms: {
					color: {
						value: new THREE.Color(0x333333)
					},
					origin: {
						value: new THREE.Vector3()
					},
					limitDistance:{
						value: 10
					}
				},
				vertexShader: lineVertexShader,
				fragmentShader: lineFragmentShader,
				transparent: true
			});
		grid.add(largeGrid);
		grid.add(smallGrid);
		scene.add(grid);
	}
	var V3 = new THREE.Vector3();
	function animate() {
		requestAnimationFrame(animate);
		var dist = controls.target.distanceTo(controls.object.position);
		for (var i = hitboxes.length - 1; i >= 0; i--) {
			var parent = hitboxes[i].parent;
			/*if (i == 5)
				console.log(parent.position, camera.position, V3.subVectors(parent.position, camera.position).length() / 30);*/
			var hitboxScale = V3.subVectors(parent.position, camera.position).length() / 30;//controls.target.distanceTo(parent.position) / 30;
			if (hitboxScale < parent.name + 3)
				hitboxScale = parent.name + 3;
			console.log();
			hitboxes[i].scale.set(hitboxScale, hitboxScale, hitboxScale);
		}
		if (grid != null)
			grid.scale.set(dist, dist, dist);
		if (controlMode == 0) {
			if (sceneCenterSphere != null) {
				var rateo = dist / 5;
				sceneCenterSphere.position.set(controls.target.x, controls.target.y, controls.target.z);
				sceneCenterSphere.scale.set(rateo, rateo, rateo);
			}
			/*if (moveControlOffset != null) {
				if (moveControlOffset.x == 0 && moveControlOffset.y == 0 && moveControlOffset.z == 0) {
					moveControlOffset.onComplete();
					moveControlOffset = null;
				} else {
					var x, y, z;
					x = moveControlOffset.x;
					y = moveControlOffset.y;
					z = moveControlOffset.z;
					if (Math.abs(x) < 10) {}
					else if (x > 0)
						x = 10;
					else
						x = -10;
					if (Math.abs(y) < 10) {}
					else if (y > 0)
						y = 10;
					else
						y = -10;
					if (Math.abs(z) < 10) {}
					else if (z > 0)
						z = 10;
					else
						z = -10;
					
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
					
					if (Math.abs(x) < 10) {}
					else if (x > 0)
						x = 10;
					else
						x = -10;
					if (Math.abs(y) < 10) {}
					else if (y > 0)
						y = 10;
					else
						y = -10;
					if (Math.abs(z) < 10) {}
					else if (z > 0)
						z = 10;
					else
						z = -10;
					
					moveCameraOffset = {x: moveCameraOffset.x - x, y: moveCameraOffset.y - y, z: moveCameraOffset.z - z, onComplete: moveCameraOffset.onComplete};
					x += camera.position.x;
					y += camera.position.y;
					z += camera.position.z;
					camera.position.set(x, y, z);
				}
			}*/
		}
		controls.update();
		renderer.render(scene, camera);
	}
	function initNavigation() {
		controls = new THREE.OrbitControls(camera, domElement);
		controls.rotateSpeed = 1;
		controls.autoRotateSpeed = 1;
		controls.autoRotate = false;
		controls.zoomSpeed = 2;
		controls.enableZoom = true;
		controls.enablePan = false;
		controls.enableRotate = true;
		controls.minDistance = 2;
		controls.maxDistance = Infinity;
		controls.enableDamping = true;
		controls.dampingFactor = 0.07;
	}
	function addAxes(size) {
		group.add(new THREE.AxesHelper(size));
	}
	
	function addSceneCenterSphere() {
		sceneCenterSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({color: 0xff0000}));
		group.add(sceneCenterSphere);
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
			var pointGeometry = new THREE.Geometry();
			pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
			var model = new THREE.Group();
			var hitbox = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({transparent: true, opacity: 0.56}));
			model.add(hitbox);
			hitbox.renderOrder = 3;
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
			var object = getNewObject(model, id, texture, radius, lightSourceColor, x, y, z, objectGenerator, hitbox);
			hitbox.name = id;
			model.name = radius;
			model.position.set(x, y, z);
			group.add(model);
			return object;
		}
		function addObject(texture, radius, x, y, z, lightSourceColor) {
			alert("DEPRECATED!");
			/*var isALightSource = lightSourceColor != null;
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
			group.add(model);
			return object;*/
		}
		function getNewObject(model, id, texture, radius, lightSourceColor, x, y, z, objectGenerator, hitbox) {
			var tailFunctions;
			if (settings.showTail)
				tailFunctions = createTail(x, y, z);
			else
				tailFunctions = {addPoint: function(x, y, z) {}};
			var cameraDistance = radius * 2;
			var cameraLock = false;
			_3DObjectsEvents[id] = {events: {}};
			var ev = _3DObjectsEvents[id];
			var mouseIsHover = false;
			var mouseMoved = false;
			ev.click = function() {
				if (ev.events.click != null)
					ev.events.click();
			};
			ev.dblclick = function() {
				if (ev.events.dblClick != null)
					ev.events.dblClick();
			};
			ev.mouseEnter = function() {
				if (ev.events.mouseEnter != null)
					ev.events.mouseEnter();
				hitbox.material.opacity = 0.5;
			};
			ev.mouseLeave = function() {
				if (ev.events.mouseLeave != null)
					ev.events.mouseLeave();
				//hitbox.material.opacity = 0;
			};
			ev.mousemove = function() {
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
			hitboxes.push(hitbox);
			var object = {id, texture, radius, cameraDistance, lightSourceColor, objectGenerator, cameraFollow: false, x, y, z, events: _3DObjectsEvents[id].events,
					setPosition: function(x, y, z) {
						model.position.set(x, y, z);
						if (object.cameraFollow)
							group.position.set(-x, -y, -z);
					},
					setScale: function(scale) {
						model.scale.set(scale, scale, scale);
					},
					remove: function() {
						scene.remove(model);
						hitboxes.splice(hitboxes.indexOf(hitbox), 1);
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
						if (object.cameraFollow)
							group.position.set(-x, -y, -z);
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
		function createTail(x, y, z) {
			var lpmd = settings.tailLastPointMaxDistance;
			var nlpmd = -lpmd;
			var mtp = settings.minTailPoints;
			var Mtp = settings.maxTailPoints;
			var pointArray = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, y, z)];
			var geometry = new THREE.BufferGeometry().setFromPoints(pointArray);
			var material = new THREE.LineBasicMaterial({color: 0x666666, transparent: true, opacity: 1, linewidth: 1});
			var tail = new THREE.Line(geometry, material);
			tail.renderOrder = 1;
			group.add(tail);

			return {
				addPoint: function(x, y, z) {
					var firstPoint = pointArray[0];
					var xDist = firstPoint.x - x, yDist = firstPoint.y - y, zDist = firstPoint.z - z;
					var totPoints = pointArray.length;
					if ((totPoints > mtp)&&(totPoints > Mtp || xDist < lpmd && xDist > nlpmd && yDist < lpmd && yDist > nlpmd && zDist < lpmd && zDist > nlpmd))
						pointArray.shift();
					pointArray.push(new THREE.Vector3(x, y, z));
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
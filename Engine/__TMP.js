var textureNames = ["earth", "jupiter", "mars", "mercury", "moon", "neptune", "saturn", "sun", "sun2", "uranus", "venus"];
var textures = {};
var SKYBOX;

function startRendering(element, args) {
	var settings;
	var scene, camera, renderer, controls, sceneCenterSphere, controlMode, skyBox, moveControlOffset, moveCameraOffset, controlsTarget, group, grid, domElement, hitboxes = [];
	function main() {
		settings = getArgsOrDefault({
			showTail: true,
			tailLastPointMaxDistance: 20,
			tailPoints: 100,
			maxTailPoints: Infinity,
			minTailPoints: 100,
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
		largeGrid.material = getShaderMaterial(0x555555, 100);
		var smallGrid = new THREE.GridHelper(50, 150);
		smallGrid.material = getShaderMaterial(0x333333, 10);
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
	
	function getGraphicFunctions() {
		var objectId = 1;
		var cameraFollowObject = null;
		function getControlsPosition() {
			return controlsTarget;
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

	main();
	animate();
	
	return getGraphicFunctions();
}
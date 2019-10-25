function ObjectManager(mouseEvents) {
	var objectId = 0;
	var lightSpriteMap = new THREE.TextureLoader().load("images/glow.png");
	var hitboxes = [];
	var textureLoader = new THREE.TextureLoader();
	var textures = [];
	
	function loadTexture(textureName, textureId, onComplete) {
		textureLoader.load("textures/" + textureName, function(texture) {
			textures[textureId] = {
				meshLambertMaterial: new THREE.MeshLambertMaterial({map: texture}),
				baseMap: texture
			};
			if (onComplete != null)
				onComplete();
		});
	}
	function loadTextures(textureName, onComplete) {
		var n = textureName.length;
		for(var i = 0; i < textureName.length; i++)
			graphicFunctions.loadTexture(textureName[i], i, function() {
				if (onComplete != null && --n == 0)
					onComplete();
			});
	}
	function getObjectGenerators(string) {
		var objectGenerators = JSON.parse(string);
		var textureNames = [];
		var keys = Object.keys(objectGenerators);
		for (var i = 0; i < keys.length; i++) {
			var objectGenerator = objectGenerators[keys[i]];
			for (var x = 0; x < objectGenerator.textures.length; x++) {
				var index = textureNames.includes(objectGenerator.textures[x]);
				if (index == -1)
					index = textureNames.push(objectGenerator.textures[x]);
				objectGenerator.textures[x] = index;
			}
			objectGenerator.generate = new Function(["model", "objectGenerator", "e"], objectGenerator.generate);
		}
		loadTextures(textureNames, function() {
			
		});
	}
	function addObjectFromModel(objectGenerator, x, y, z) {
		if (objectGenerator == null)
			return null;
		var radius = objectGenerator.radius;
		var textures = objectGenerator.textures;
		var lightSourceColor = objectGenerator.lightSourceColor;
		if (x == null)
			x = 0;
		if (y == null)
			y = 0;
		if (z == null)
			z = 0;
		var id = objectId++;
		var model = new THREE.Group();
		var hitbox = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
		model.add(hitbox);
		hitbox.renderOrder = 3;
		objectGenerator.generate(model, objectGenerator, {
			setAsLightSource: function(intensity) {
				var light = new THREE.PointLight(lightSourceColor, intensity);
				model.add(light);
				var spriteMaterial = new THREE.SpriteMaterial({map: lightSpriteMap, color: lightSourceColor});
				lightSprite = new THREE.Sprite(spriteMaterial);
				lightSprite.scale.set(radius * 4, radius * 3.5, 1);
				lightSprite.renderOrder = 2;
				model.add(lightSprite);
			},
			getCamera: function() {
				return camera;
			}
		});
		var object = getNewObject(model, id, radius, lightSourceColor, x, y, z, objectGenerator, hitbox);
		hitbox.name = id;
		model.name = radius;
		model.position.set(x, y, z);
		group.add(model);
		return object;
	}
	function getNewObject(model, id, radius, lightSourceColor, x, y, z, objectGenerator, hitbox) {
		var tailFunctions;
		if (settings.showTail)
			tailFunctions = createTail(x, y, z);
		else
			tailFunctions = {addPoint: function(x, y, z) {}};
		var cameraDistance = radius * 2;
		var cameraLock = false;			
		hitboxes.push(hitbox);
		var object = {id, radius, cameraDistance, lightSourceColor, objectGenerator, cameraFollow: false, x, y, z, events: _3DObjectsEvents[id].events,
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

}
function getObjectGenerators() {
	return {
		venus: {
			radius: 0.95,
			mainTexture: textures.venus,
			lightSourceColor: null,
			mass: 0.81,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		uranus: {
			radius: 3.98,
			mainTexture: textures.uranus,
			lightSourceColor: null,
			mass: 14.54,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		saturn: {
			radius: 9.14,
			mainTexture: textures.saturn,
			lightSourceColor: null,
			mass: 95.16,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		neptune: {
			radius: 3.86,
			mainTexture: textures.neptune,
			lightSourceColor: null,
			mass: 17.15,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		moon: {
			radius: 0.27,
			mainTexture: textures.moon,
			lightSourceColor: null,
			mass: 0.01,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		mercury: {
			radius: 0.38,
			mainTexture: textures.mercury,
			lightSourceColor: null,
			mass: 0.06,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		jupiter: {
			radius: 10.97,
			mainTexture: textures.jupiter,
			lightSourceColor: null,
			mass: 317.82,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		mars: {
			radius: 0.53,
			mainTexture: textures.mars,
			lightSourceColor: null,
			mass: 0.11,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		earth: {
			radius: 1,
			mainTexture: textures.earth,
			lightSourceColor: null,
			mass: 1,
			generate: function(model, currentObject, utils) {
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), currentObject.mainTexture.meshLambertMaterial);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		},
		sun: {
			radius: 109.17,
			mainTexture: textures.sun2,
			lightSourceColor: 0xffffff,
			mass: 333054.25,
			generate: function(model, currentObject, utils) {
				var star = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), new THREE.MeshBasicMaterial({map: currentObject.mainTexture.baseMap, opacity: 0.5}));
				star.material.side = THREE.DoubleSide;
				model.add(star);
				utils.setAsLightSource(1.5);
			}
		},
		blackhole: {
			radius: 10,
			mainTexture: null,
			lightSourceColor: 0x440000,
			mass: 9999999,
			generate: function(model, currentObject, utils) {
				var material = new THREE.MeshBasicMaterial({color: 0x111111, envMap: SKYBOX, refractionRatio: 0.96});
				material.envMap.mapping = THREE.CubeRefractionMapping;
				var distortion = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius * 1.1, 32, 32), material);
				distortion.material.side = THREE.DoubleSide;
				model.add(distortion);
				utils.setAsLightSource(0);
			}
		}
	};
}
function getObjectGenerators() {
	return {
		sun: {
			radius: 12,
			mainTexture: textures.sun2,
			lightSourceColor: 0xffffff,
			mass: 6000,
			generate: function(model, currentObject, utils) {
				var star = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), new THREE.MeshBasicMaterial({map: currentObject.mainTexture.baseMap, opacity: 0.5}));
				star.material.side = THREE.DoubleSide;
				model.add(star);
				utils.setAsLightSource();
			}
		},
		blackhole: {
			radius: 10,
			mainTexture: null,
			lightSourceColor: null,
			mass: 99999,
			generate: function(model, currentObject, utils) {
				var material = new THREE.MeshBasicMaterial({color: 0xffffff, envMap: textures.skyBox.baseMap, refractionRatio: 0.95});
				material.envMap.mapping = THREE.CubeRefractionMapping;
				var planet = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius, 32, 32), material);
				planet.material.side = THREE.DoubleSide;
				model.add(planet);
			}
		}
	};
}
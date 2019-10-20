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
				var distortion = new THREE.Mesh(new THREE.SphereGeometry(currentObject.radius * 1.3, 32, 32), material);
				distortion.material.side = THREE.DoubleSide;
				model.add(distortion);
				utils.setAsLightSource(0);
			}
		}
	};
}
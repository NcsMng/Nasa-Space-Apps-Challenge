function getShaderMaterial(_color, _limitDistance) {
	return new THREE.ShaderMaterial({transparent: true,
		uniforms: {
			color: {
				value: new THREE.Color(_color)
			},
			origin: {
				value: new THREE.Vector3()
			},
			limitDistance:{
				value: _limitDistance
			}
		},
		vertexShader: "varying vec3 vPos;void main() {vPos = position;vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);gl_Position = projectionMatrix * modelViewPosition;}",
		fragmentShader: "uniform vec3 origin;uniform vec3 color;uniform float limitDistance;varying vec3 vPos;void main() {float distance = clamp(length(vPos - origin), 0., limitDistance);float opacity = 1. - distance / limitDistance;gl_FragColor = vec4(color, opacity * opacity);}"
		});
}
function getLineDynamicShaderMaterial(color, limitDistance) {
	return new THREE.ShaderMaterial({transparent: true,
		uniforms: {
			color, limitDistance,
			origin: {
				value: new THREE.Vector3()
			}
		},
		vertexShader: "varying vec3 vPos;void main() {vPos = position;vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);gl_Position = projectionMatrix * modelViewPosition;}",
		fragmentShader: "uniform vec3 origin;uniform vec3 color;uniform float limitDistance;varying vec3 vPos;void main() {float distance = clamp(length(vPos - origin), 0., limitDistance);float opacity = 1. - distance / limitDistance;gl_FragColor = vec4(color, opacity * opacity);}"
		});
}

uniform float uTime;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 pos = position;
  pos.x += sin(pos.x * 5.0 + uTime * 3.0) * 0.04;
  pos.y += cos(pos.x * 1.0 + uTime * 1.0) * 0.1;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
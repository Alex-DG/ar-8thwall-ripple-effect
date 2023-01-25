uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform float uTime;
uniform float uProgress;
uniform float uScale;
uniform float uOpacity;

varying vec2 vUv;

float PI = 3.141592653589793238;

void main() {
  vec2 uv1 = vUv;

  // Distorsion
  vec2 p = 2.0 * vUv - 2.0;
  p += 0.1 * cos(uScale * 3.7 * p.yx + 1.4 * uTime + vec2(2.2, 3.4));
  p += 0.1 * cos(uScale * 3.0 * p.yx + 1.0 * uTime + vec2(1.2, 3.4));
  p += 0.3 * cos(uScale * 5.0 * p.yx + 2.6 * uTime + vec2(4.2, 1.4));
  p += 0.3 * cos(uScale * 7.5 * p.yx + 3.6 * uTime + vec2(12.2, 3.4));

	uv1.x = mix(vUv.x, length(p), uProgress);
  uv1.y = mix(vUv.y, 0.5 * length(p) + 0.15, uProgress);

 // Ripple
  vec4 displacement = texture2D(uDisplacement, uv1);
  float theta = displacement.r * 2.0 * PI * uTime * 0.5;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 uv2 = uv1 + dir * displacement.r * 0.5;

  vec4 color =  texture2D(uTexture, uv2);

  gl_FragColor = color * uOpacity;
  // gl_FragColor = displacement;
}

// uniform sampler2D tDiffuse;
// uniform float uTime;
// uniform float u_progress;
// uniform float uScale;
// varying vec2 v_uv;

// void main() {
//   vec2 uv = v_uv;

//   vec2 p = 2.0 * v_uv - 1.0; // -1 ~ 1
//   p += 0.1 * cos(uScale * 3.7 * p.yx + 1.4 * uTime + vec2(2.2, 3.4));
//   p += 0.1 * cos(uScale * 3.0 * p.yx + 1.0 * uTime + vec2(1.2, 3.4));
//   p += 0.3 * cos(uScale * 5.0 * p.yx + 2.6 * uTime + vec2(4.2, 1.4));
//   p += 0.3 * cos(uScale * 7.5 * p.yx + 3.6 * uTime + vec2(12.2, 3.4));

// 	uv.x = mix(v_uv.x, length(p), u_progress);
//   uv.y = mix(v_uv.y, 0.5 * length(p) + 0.15, u_progress);
  
//   vec4 color = texture2D(tDiffuse, uv);
  
//   gl_FragColor = color;
//   // gl_FragColor = vec4(vec3(length(p)), 1.0);
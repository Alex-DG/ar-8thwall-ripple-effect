import { ShaderMaterial, Texture, Vector4 } from 'three'

import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

class ImageMaterial extends ShaderMaterial {
  constructor(texture) {
    super({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0.02 },
        uScale: { value: 0.5 },
        uTexture: { value: texture },
        uDisplacement: { value: null },
        uOpacity: { value: 1 },
      },
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
      transparent: false,
    })
  }
}

export default ImageMaterial

import brushSrc from '../../assets/textures/brush.png'
import fujiSrc from '../../assets/textures/fuji.png'
import ImageMaterial from './Materials/ImageMaterial'

class _Ripple {
  ////////////////////////////////////////////////////////////

  onTouchStart(e) {
    e.preventDefault()

    const { renderer } = XR8.Threejs.xrScene()
    const { clientX, clientY } = e.touches[0]

    const rect = renderer.domElement.getBoundingClientRect()

    this.touchPosition.x = ((clientX - rect.left) / rect.width) * 2 - 1
    this.touchPosition.y = -((clientY - rect.top) / rect.height) * 2 + 1
  }

  onTouchMove(e) {
    e.preventDefault()

    const { renderer } = XR8.Threejs.xrScene()
    const { clientX, clientY } = e.changedTouches[0]

    const rect = renderer.domElement.getBoundingClientRect()

    this.touchPosition.x = ((clientX - rect.left) / rect.width) * 2 - 1
    this.touchPosition.y = -((clientY - rect.top) / rect.height) * 2 + 1
  }

  mouseEvents() {
    window.addEventListener('touchstart', this.onTouchStart.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
  }

  ////////////////////////////////////////////////////////////

  setNewWave(x, y, index) {
    let mesh = this.meshes[index]
    mesh.visible = true
    mesh.position.x = x * 400 //* (1000 / 6) // 250
    mesh.position.y = y * 400 //* (1000 / 6) //250
    mesh.material.opacity = 0.1
    mesh.scale.x = mesh.scale.y = 0.5
  }

  trackMousePos() {
    if (!this.touchPosition || !this.prevTouchPosition) return

    const isMoveX =
      Math.abs(this.touchPosition.x - this.prevTouchPosition.x) * 1 < 0.01
    const isMoveY =
      Math.abs(this.touchPosition.y - this.prevTouchPosition.y) * 1 < 0.01

    // console.log({
    //   x: Math.abs(this.touchPosition.x - this.prevTouchPosition.x),
    //   y: Math.abs(this.touchPosition.y - this.prevTouchPosition.y),
    // })

    if (isMoveX && isMoveY) {
      // nothing
    } else {
      this.setNewWave(
        this.touchPosition.x,
        this.touchPosition.y,
        this.currentWave
      )
      this.currentWave = (this.currentWave + 1) % this.max
      console.log(this.currentWave)
    }

    this.prevTouchPosition.x = this.touchPosition.x
    this.prevTouchPosition.y = this.touchPosition.y
  }

  ////////////////////////////////////////////////////////////

  setWave(texture) {
    this.mouseEvents()

    this.touchPosition = new THREE.Vector2()
    this.prevTouchPosition = new THREE.Vector2()
    this.startPosition = new THREE.Vector2()
    this.endPosition = new THREE.Vector2()

    const { scene2 } = XR8.Threejs.xrScene()

    this.max = 100
    this.meshes = []
    this.currentWave = 0

    const geometry = new THREE.PlaneGeometry(64, 64, 1, 1)

    for (let index = 0; index < this.max; index++) {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.visible = false
      mesh.rotation.z = 2 * Math.PI * Math.random()

      scene2.add(mesh)
      this.meshes.push(mesh)
    }
  }

  setPlane(texture) {
    const { scene, sizes } = XR8.Threejs.xrScene()
    this.baseTexture = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    })

    this.imageMaterial = new ImageMaterial(texture)
    const geometry = new THREE.PlaneGeometry(5, 5, 64, 64)
    this.quad = new THREE.Mesh(geometry, this.imageMaterial)

    scene.add(this.quad)
  }

  async load() {
    try {
      const loader = new THREE.TextureLoader()
      const [brushTexture, fujiSanTexture] = await Promise.all([
        loader.loadAsync(brushSrc),
        loader.loadAsync(fujiSrc),
      ])

      this.setWave(brushTexture)
      this.setPlane(fujiSanTexture)

      this.isReady = true
    } catch (error) {
      console.log('error-load', { error })
    }
  }

  init() {
    this.load()
  }

  render() {
    if (!this.isReady) return

    const { renderer, scene2, camera2 } = XR8.Threejs.xrScene()

    this.trackMousePos()

    renderer.autoClear = true

    renderer.setRenderTarget(this.baseTexture)
    renderer.render(scene2, camera2)
    this.imageMaterial.uniforms.uDisplacement.value = this.baseTexture.texture

    this.meshes?.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.z += 0.02
        mesh.material.opacity *= 0.96

        mesh.scale.x = 1.025 * mesh.scale.x + 0.15 //+ Math.random()
        mesh.scale.x = 0.982 * mesh.scale.x + 0.108
        mesh.scale.y = mesh.scale.x

        if (mesh.material.opacity < 0.002) mesh.visible = false
      }
    })
  }
}

const Ripple = new _Ripple()
export default Ripple

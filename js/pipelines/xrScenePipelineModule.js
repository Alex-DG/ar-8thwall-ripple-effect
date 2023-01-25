import Ripple from '../experience/Ripple'

const setSizes = ({ canvasWidth, canvasHeight }) => {
  const sizes = {
    width: canvasWidth,
    height: canvasHeight,
  }
  return sizes
}

const setScene = () => {
  const scene_1 = new THREE.Scene()
  const scene_2 = new THREE.Scene()
  return { scene_1, scene_2 }
}

const setCamera = ({ sizes }) => {
  const aspect = sizes.width / sizes.height
  const camera_1 = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)

  // Set the initial camera position relative to the scene we just laid out. This must be at a
  // height greater than y=0.
  camera_1.position.set(0, 2, 5)

  const furstrumSize = 10
  let camera_2 = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    -window.innerHeight / 2,
    1,
    10
  )
  // camera_2.position.y = 1
  camera_2.position.z = 3
  // let camera_2 = new THREE.OrthographicCamera(
  //   (furstrumSize * aspect) / -2,
  //   (furstrumSize * aspect) / 2,
  //   (furstrumSize * aspect) / 2,
  //   (furstrumSize * aspect) / -2,
  //   -1000,
  //   1000
  // )

  XR8.XrController.updateCameraProjectionMatrix({
    origin: camera_1.position,
    facing: camera_1.quaternion,
  })

  return { camera_1, camera_2 }
}

const setRenderer = ({ canvas, sizes, GLctx }) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: GLctx,
    // alpha: true,
    antialias: true,
  })

  // renderer.autoClear = false
  renderer.setSize(sizes.width, sizes.height)

  return renderer
}

export const initXRScenePipelineModule = () => {
  let scene
  let scene2

  let camera
  let camera2

  let renderer
  let sizes

  let xrSceneData

  const xrScene = () => xrSceneData

  let engaged = false

  // Populates a cube into an XR scene and sets the initial camera position.
  const initXrScene = ({ canvas, canvasWidth, canvasHeight, GLctx }) => {
    if (engaged) return

    // Sizes
    sizes = setSizes({ canvasWidth, canvasHeight })

    // Scene
    const { scene_1, scene_2 } = setScene()
    scene = scene_1
    scene2 = scene_2

    // Camera
    const { camera_1, camera_2 } = setCamera({ sizes })
    camera = camera_1
    camera2 = camera_2

    scene.add(camera)

    // Renderer
    renderer = setRenderer({ canvas, sizes, GLctx })

    // XR Scene Data
    xrSceneData = { scene, camera, renderer, scene2, camera2, sizes }
    window.xrSceneData = xrSceneData
    window.XR8.Threejs.xrScene = xrScene

    // Prevent scroll/pinch gestures on canvas
    canvas.addEventListener('touchmove', (event) => {
      event.preventDefault()
    })

    // Ready ✨
    engaged = true
    console.log('🤖', 'XR Scene ready')
  }

  // This is a workaround for https://bugs.webkit.org/show_bug.cgi?id=237230
  // Once the fix is released, we can add `&& parseFloat(device.osVersion) < 15.x`
  const device = XR8.XrDevice.deviceEstimate()
  const needsPrerenderFinish =
    device.os === 'iOS' && parseFloat(device.osVersion) >= 15.4

  return {
    name: 'init-xr-scene',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    onStart: (args) => initXrScene(args), // Add objects set the starting camera position.

    onDetach: () => {
      engaged = false
    },

    onUpdate: ({ processCpuResult }) => {
      const realitySource =
        processCpuResult.reality || processCpuResult.facecontroller

      if (!realitySource) return

      const { rotation, position, intrinsics } = realitySource

      for (let i = 0; i < 16; i++) {
        camera.projectionMatrix.elements[i] = intrinsics[i]
      }

      // Fix for broken raycasting in r103 and higher. Related to:
      //   https://github.com/mrdoob/three.js/pull/15996
      // Note: camera.projectionMatrixInverse wasn't introduced until r96 so check before setting
      // the inverse
      if (camera.projectionMatrixInverse) {
        if (camera.projectionMatrixInverse.invert) {
          // THREE 123 preferred version
          camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
        } else {
          // Backwards compatible version
          camera.projectionMatrixInverse.getInverse(camera.projectionMatrix)
        }
      }

      if (rotation) camera.setRotationFromQuaternion(rotation)

      if (position) camera.position.set(position.x, position.y, position.z)
    },

    onCanvasSizeChange: ({ canvasWidth, canvasHeight }) => {
      if (!engaged) return
      setSizes({ sizes, canvasWidth, canvasHeight })
      xrSceneData.sizes = sizes
      renderer.setSize(canvasWidth, canvasHeight)
    },

    onRender: () => {
      Ripple.render()

      renderer.autoClear = false

      renderer.setRenderTarget(null)
      renderer.render(scene, camera)
      renderer.clearDepth()
    },
    xrScene: () => xrScene,
  }
}

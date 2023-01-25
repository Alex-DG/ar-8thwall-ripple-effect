import Ripple from '../experience/Ripple'

export const initWorldPipelineModule = () => {
  const clock = new THREE.Clock()
  const init = () => {
    Ripple.init()

    console.log('✨', 'World ready')
  }

  const update = () => {
    // const time = clock.getElapsedTime()
    // Ripple?.update(time)
    // Ripple?.update()
  }

  return {
    name: 'init-world',

    onStart: () => init(),

    onUpdate: () => update(),
  }
}

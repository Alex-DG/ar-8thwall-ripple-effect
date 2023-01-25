import Ripple from '../experience/Ripple'

export const initWorldPipelineModule = () => {
  const init = () => {
    Ripple.init()
    console.log('✨', 'World ready')
  }

  const update = () => {}

  return {
    name: 'init-world',

    onStart: () => init(),

    onUpdate: () => update(),
  }
}

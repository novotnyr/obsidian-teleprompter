import { useControlFeature } from '@/features/control'
import { ControlType } from '@/features/control/enums'
import { defineFeature } from '@/features/feature'
import { ref, watch } from 'vue'
import CountdownIcon from '@/features/countdown/CountdownIcon.vue'
import { usePlayFeature } from '@/features/play'
import CountdownControlSettings from '@/features/countdown/CountdownControlSettings.vue'
import { useCommandFeature } from '@/features/commands'

export const useCountdownFeature = defineFeature('countdown', (id) => {
  const value = ref(0)
  const resetValue = ref(10)
  const label = 'Countdown'
  const desc = 'Countdown before play in seconds'
  const resetOnPause = ref(false)

  const playStore = usePlayFeature().useStore()
  let countdownRun = 0
  let isUpdatingFromTimer = false

  function setCountdownValue(nextValue: number) {
    isUpdatingFromTimer = true
    value.value = nextValue
    isUpdatingFromTimer = false
  }

  function startCountdown() {
    const initialValue = Math.ceil(value.value)
    if (!playStore.value || initialValue <= 0) return

    const run = ++countdownRun
    const endsAt = performance.now() + initialValue * 1000

    function tick() {
      if (run !== countdownRun || !playStore.value) return

      const remaining = Math.max(
        0,
        Math.ceil((endsAt - performance.now()) / 1000),
      )
      if (remaining !== value.value) setCountdownValue(remaining)

      if (remaining > 0) setTimeout(tick, 250)
    }

    setTimeout(tick, 250)
  }

  useCommandFeature().use(id, [
    {
      id: 'countdown:reset-on-pause:true',
      name: 'Countdown - reset on pause - toggle on',
      callback: () => (resetOnPause.value = true),
    },
    {
      id: 'countdown:reset-on-pause:false',
      name: 'Countdown - reset on pause - toggle off',
      callback: () => (resetOnPause.value = false),
    },
    {
      id: 'countdown:reset-on-pause:toggle',
      name: 'Countdown - reset on pause - toggle',
      callback: () => (resetOnPause.value = !resetOnPause.value),
    },
  ])

  useControlFeature().use({
    id,
    type: ControlType.SLIDER,
    defaults: {
      label,
      desc,
      value: value.value,
      resetValue: resetValue.value,
      min: 0,
      max: 30,
      step: 1,
    },
    state: {
      value,
      resetValue,
    },
    components: {
      icon: () => CountdownIcon,
      settings: () => CountdownControlSettings,
    },
  })

  watch(
    () => playStore.value,
    (isPlaying) => {
      countdownRun += 1
      if (!isPlaying && resetOnPause.value) value.value = resetValue.value
      if (isPlaying) startCountdown()
    },
    { immediate: true, flush: 'sync' },
  )

  watch(
    value,
    (newValue) => {
      if (!playStore.value || isUpdatingFromTimer) return
      countdownRun += 1
      if (newValue > 0) startCountdown()
    },
    { flush: 'sync' },
  )

  return {
    useStore: () => ({
      value,
      resetOnPause,
    }),
  }
})

import { defineFeature } from '@/features/feature'
import { computed, ref } from 'vue'
import { useControlFeature } from '@/features/control'
import { ControlType } from '@/features/control/enums'
import { useContentFeature } from '@/features/content'
import { mdiFormatParagraphSpacing } from '@mdi/js'

export const useParagraphSpacingFeature = defineFeature(
  'paragraph-spacing',
  (id) => {
    const value = ref(1)
    const label = 'Paragraph spacing'
    const desc = 'Space before and after paragraphs'

    useControlFeature().use({
      id,
      type: ControlType.SLIDER,
      icon: mdiFormatParagraphSpacing,
      defaults: {
        label,
        desc,
        value: value.value,
        resetValue: value.value,
        min: 0,
        max: 5,
        step: 0.1,
      },
      state: {
        value,
      },
    })

    useContentFeature().useModifier({
      id,
      defaults: {
        name: label,
      },
      contentStyles: {
        '--paragraph-spacing': computed(() => value.value + 'em'),
      },
    })

    return {
      useStore: () => ({
        value,
      }),
    }
  },
)

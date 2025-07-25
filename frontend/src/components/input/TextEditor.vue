<script lang="ts" setup>
import { commands } from '@guardian/prosemirror-invisibles'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { computed, onMounted, ref, watch } from 'vue'
import TextEditorMenu from '@/components/input/TextEditorMenu.vue'
import type { TextAreaInputAttributes } from '@/components/input/types'
import { CustomBulletList } from '@/editor/bulletList'
import { FontSize } from '@/editor/fontSize'
import { CustomImage } from '@/editor/image'
import { Indent } from '@/editor/indent'
import { InvisibleCharacters } from '@/editor/invisibleCharacters'
import { CustomListItem } from '@/editor/listItem'
import { CustomOrderedList } from '@/editor/orderedList'
import { CustomParagraph } from '@/editor/paragraph'
import { CustomSubscript, CustomSuperscript } from '@/editor/scriptText'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  value?: string
  editable?: boolean
  preview?: boolean
  ariaLabel?: string
  fieldSize?: TextAreaInputAttributes['fieldSize']
  showFormattingButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  editable: false,
  preview: false,
  ariaLabel: 'Editor Feld',
  fieldSize: 'medium',
  showFormattingButtons: true,
})

const emit = defineEmits<{
  updateValue: [newValue: string]
}>()

const editorElement = ref<HTMLElement>()
const hasFocus = ref(false)
const isHovered = ref(false)

const editor = new Editor({
  editorProps: {
    attributes: {
      tabindex: '0',
      style: props.preview
        ? 'height: 100%; overflow-y: auto; outline: 0'
        : 'height: 100%; overflow-y: auto; padding: 0.75rem 1rem; outline: 0',
    },
  },
  content: props.value,
  extensions: [
    StarterKit.configure({
      listItem: false,
      bulletList: false,
      orderedList: false,
      paragraph: false,
    }),
    Color,
    FontSize,
    CustomListItem,
    CustomBulletList,
    CustomOrderedList,
    CustomParagraph,
    CustomSubscript,
    CustomSuperscript,
    TextStyle,
    InvisibleCharacters,
    TextAlign.configure({
      types: ['paragraph', 'span'],
      alignments: props.editable
        ? ['left', 'right', 'center']
        : ['left', 'right', 'center', 'justify'],
    }),
    CustomImage.configure({
      allowBase64: true,
      inline: true,
      HTMLAttributes: {
        class: 'inline align-baseline',
      },
    }),
    Indent.configure({
      names: ['listItem', 'paragraph'],
    }),
  ],
  onUpdate: () => {
    emit('updateValue', editor.getHTML())
  },
  onFocus: () => (hasFocus.value = true),
  editable: props.editable,
  parseOptions: {
    preserveWhitespace: 'full',
  },
})

const containerWidth = ref<number>()

const editorExpanded = ref(false)
const editorStyleClasses = computed(() => {
  if (editorExpanded.value) {
    return `h-640 p-4`
  }

  const fieldSizeClasses = {
    max: 'h-full',
    big: 'h-320',
    medium: 'h-160',
    small: 'h-96',
  } as const

  return fieldSizeClasses[props.fieldSize] ? `${fieldSizeClasses[props.fieldSize]} p-4` : undefined
})

watch(
  () => props.value,
  (value) => {
    if (!value || value === editor.getHTML()) {
      return
    }
    // incoming changes
    // the cursor should not jump to the end of the content but stay where it is
    const cursorPos = editor.state.selection.anchor
    editor.commands.setContent(value, { emitUpdate: false })
    editor.commands.setTextSelection(cursorPos)
  },
)

const buttonsDisabled = computed(() => !(props.editable && (hasFocus.value || isHovered.value)))

watch(
  () => hasFocus.value,
  () => {
    // When the TextEditor is editable and has focus, the invisibleCharacters should be visible
    commands.setActiveState(props.editable && hasFocus.value)(editor.state, editor.view.dispatch)
  },
  { immediate: true },
)

const ariaLabel = props.ariaLabel ? props.ariaLabel : null

onMounted(async () => {
  const editorContainer = document.querySelector('.editor')
  if (editorContainer != null) resizeObserver.observe(editorContainer)
})

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    containerWidth.value = entry.contentRect.width
  }
})
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/no-static-element-interactions -->
  <div
    id="text-editor"
    ref="editorElement"
    class="editor bg-white"
    fluid
    @blur="hasFocus = false"
    @focusin="hasFocus = true"
    @focusout="!editorElement?.matches(':focus-within') && (hasFocus = false)"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <TextEditorMenu
      v-if="editable"
      :ariaLabel="props.ariaLabel"
      :buttons-disabled="buttonsDisabled"
      :container-width="containerWidth"
      :editor="editor"
      :editor-expanded="editorExpanded"
      :show-formatting-buttons="showFormattingButtons"
      @on-editor-expanded-changed="(isExpanded) => (editorExpanded = isExpanded)"
    />
    <hr v-if="editable" class="ml-8 mr-8 border-blue-300" />
    <div>
      <EditorContent
        :class="editorStyleClasses"
        :data-testid="`${ariaLabel} Editor`"
        :editor="editor"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { commands, selectActiveState } from '@guardian/prosemirror-invisibles'
import { Editor } from '@tiptap/vue-3'
import { computed, ref } from 'vue'
import TextEditorButton, { type EditorButton } from '@/components/input/TextEditorButton.vue'
import { useCollapsingMenuBar } from '@/composables/useCollapsingMenuBar'
import IconExpand from '~icons/ic/sharp-expand'
import IconAlignCenter from '~icons/ic/sharp-format-align-center'
import IconAlignLeft from '~icons/ic/sharp-format-align-left'
import IconAlignRight from '~icons/ic/sharp-format-align-right'
import IconBold from '~icons/ic/sharp-format-bold'
import IndentDecrease from '~icons/ic/sharp-format-indent-decrease'
import IndentIncrease from '~icons/ic/sharp-format-indent-increase'
import IconItalic from '~icons/ic/sharp-format-italic'
import IconUnorderedList from '~icons/ic/sharp-format-list-bulleted'
import IconOrderedList from '~icons/ic/sharp-format-list-numbered'
import IconBlockquote from '~icons/ic/sharp-format-quote'
import IconStrikethrough from '~icons/ic/sharp-format-strikethrough'
import IconUnderline from '~icons/ic/sharp-format-underlined'
import IconRedo from '~icons/ic/sharp-redo'
import IconSubscript from '~icons/ic/sharp-subscript'
import IconSuperscript from '~icons/ic/sharp-superscript'
import IconUndo from '~icons/ic/sharp-undo'
import IconParagraph from '~icons/material-symbols/format-paragraph'

interface Props {
  editorExpanded: boolean
  ariaLabel: string
  buttonsDisabled: boolean
  editor: Editor
  containerWidth?: number
  showFormattingButtons?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{ onEditorExpandedChanged: [boolean] }>()

const buttons = computed(() => {
  const displayedButtons = [
    {
      type: 'expand',
      icon: IconExpand,
      ariaLabel: 'Erweitern',
      group: 'display',
      isCollapsable: false,
      callback: () => emit('onEditorExpandedChanged', !props.editorExpanded),
    },
    {
      type: 'invisible-characters',
      icon: IconParagraph,
      ariaLabel: 'Nicht-druckbare Zeichen',
      shortcut: 'Strg + Alt + #',
      group: 'display',
      isCollapsable: false,
      callback: () => commands.toggleActiveState()(props.editor.state, props.editor.view.dispatch),
    },
  ]
  if (props.showFormattingButtons) {
    displayedButtons.push(
      {
        type: 'bold',
        icon: IconBold,
        ariaLabel: 'Fett',
        shortcut: 'Strg + b',
        group: 'Formatierung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().toggleMark('bold').run(),
      },
      {
        type: 'italic',
        icon: IconItalic,
        ariaLabel: 'Kursiv',
        shortcut: 'Strg + i',
        group: 'Formatierung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().toggleMark('italic').run(),
      },
      {
        type: 'underline',
        icon: IconUnderline,
        ariaLabel: 'Unterstrichen',
        shortcut: 'Strg + u',
        group: 'Formatierung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().toggleMark('underline').run(),
      },
      {
        type: 'strike',
        icon: IconStrikethrough,
        ariaLabel: 'Durchgestrichen',
        shortcut: 'Strg + ⇧ + s',
        group: 'Formatierung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().toggleMark('strike').run(),
      },
      {
        type: 'superscript',
        icon: IconSuperscript,
        ariaLabel: 'Tiefgestellt',
        shortcut: 'Strg + .',
        group: 'Formatierung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().toggleMark('superscript').run(),
      },
      {
        type: 'subscript',
        icon: IconSubscript,
        ariaLabel: 'Hochgestellt',
        shortcut: 'Strg + ,',
        group: 'Formatierung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().toggleMark('subscript').run(),
      },
      {
        type: 'left',
        icon: IconAlignLeft,
        ariaLabel: 'Linksbündig',
        shortcut: 'Strg + ⇧ + l',
        group: 'Ausrichtung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().setTextAlign('left').run(),
      },
      {
        type: 'center',
        icon: IconAlignCenter,
        ariaLabel: 'Zentriert',
        shortcut: 'Strg + ⇧ + e',
        group: 'Ausrichtung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().setTextAlign('center').run(),
      },
      {
        type: 'right',
        icon: IconAlignRight,
        ariaLabel: 'Rechtsbündig',
        shortcut: 'Strg + ⇧ + r',
        group: 'Ausrichtung',
        isCollapsable: true,
        callback: () => props.editor.chain().focus().setTextAlign('right').run(),
      },
      {
        type: 'orderedList',
        icon: IconOrderedList,
        ariaLabel: 'Nummerierte Liste',
        shortcut: 'Strg + ⇧ + 7',
        group: 'indent',
        isCollapsable: false,
        callback: () => props.editor.chain().focus().toggleOrderedList().run(),
      },
      {
        type: 'bulletList',
        icon: IconUnorderedList,
        ariaLabel: 'Aufzählungsliste',
        shortcut: 'Strg + ⇧ + 8',
        group: 'indent',
        isCollapsable: false,
        callback: () => props.editor.chain().focus().toggleBulletList().run(),
      },
      {
        type: 'outdent',
        icon: IndentDecrease,
        ariaLabel: 'Einzug verringern',
        group: 'indent',
        isCollapsable: false,
        callback: () => props.editor.chain().focus().outdent().run(),
      },
      {
        type: 'indent',
        icon: IndentIncrease,
        ariaLabel: 'Einzug vergrößern',
        group: 'indent',
        isCollapsable: false,
        callback: () => props.editor.chain().focus().indent().run(),
      },
      {
        type: 'blockquote',
        icon: IconBlockquote,
        ariaLabel: 'Zitat einfügen',
        shortcut: 'Strg + ⇧ + B',
        group: 'blockquote',
        isCollapsable: false,
        callback: () => props.editor.chain().focus().toggleBlockquote().run(),
      },
    )
  }
  return displayedButtons
})

const fixButtons = [
  {
    type: 'undo',
    icon: IconUndo,
    ariaLabel: 'Rückgängig machen',
    shortcut: 'Strg + z',
    group: 'arrow',
    isCollapsable: false,
    callback: () => props.editor.chain().focus().undo().run(),
  },
  {
    type: 'redo',
    icon: IconRedo,
    ariaLabel: 'Wiederherstellen',
    shortcut: 'Strg + ⇧ + z',
    group: 'arrow',
    isCollapsable: false,
    callback: () => props.editor.chain().focus().redo().run(),
  },
]

const editorButtons = computed(() =>
  buttons.value.map((button) => {
    let isActive

    if (button.group === 'alignment') {
      isActive = props.editor.isActive({ textAlign: button.type })
    } else if (button.type === 'invisible-characters') {
      isActive = selectActiveState(props.editor.view.state)
    } else if (button.type === 'expand') {
      isActive = props.editorExpanded
    } else {
      isActive = props.editor.isActive(button.type)
    }

    return {
      ...button,
      isActive,
    }
  }),
)
const buttonSize = 48
const maxButtonEntries = computed(() =>
  props.containerWidth !== undefined
    ? Math.floor((props.containerWidth - 100) / buttonSize)
    : Number.MAX_VALUE,
)
const { collapsedButtons } = useCollapsingMenuBar(editorButtons, maxButtonEntries)

function handleButtonClick(button: EditorButton) {
  if (button.callback) button.callback()
}

const menuBar = ref<HTMLElement>()
const fixButtonElements = ref<(typeof TextEditorButton)[]>([])
const collapsedButtonElements = ref<(typeof TextEditorButton)[]>([])
// All the HTML <button> elements of the TextEditorButtons, so we can call .focus() on them
const buttonElements = computed<HTMLElement[]>(() =>
  [...collapsedButtonElements.value, ...fixButtonElements.value]
    .flatMap((buttonComponent) => [
      buttonComponent.button,
      // If it is a collapsed button, it might have visible children
      ...(buttonComponent?.children ?? []),
    ])
    .filter((button) => !!button),
)

const focusedButtonIndex = ref(0)
const focusNextButton = () => {
  if (focusedButtonIndex.value < buttonElements.value.length) {
    focusedButtonIndex.value++
  }
  focusCurrentButton()
}
const focusPreviousButton = () => {
  if (focusedButtonIndex.value > 0) {
    focusedButtonIndex.value--
  }
  focusCurrentButton()
}
const focusCurrentButton = () => {
  if (focusedButtonIndex.value >= buttonElements.value.length) {
    // If menu buttons are removed (collapsable), the index might be too high
    focusedButtonIndex.value = buttonElements.value.length - 1
  }
  const buttonElement = buttonElements.value?.[focusedButtonIndex.value]
  if (buttonElement && !props.buttonsDisabled) {
    buttonElement.focus()
  } else if (props.buttonsDisabled) {
    // When navigating from a previous element the buttons are initially disabled.
    // We don't want to focus the toolbar but the EditorContent instead
    props.editor.commands.focus()
  }
}

const ariaLabel = props.ariaLabel ? props.ariaLabel : null
</script>

<template>
  <!-- Menu bar can be focused so that you can navigate between the buttons with arrow left and right -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div
    ref="menuBar"
    :aria-label="ariaLabel + ' Button Leiste'"
    class="flex flex-row flex-wrap justify-between pb-4 pe-8 ps-8 pt-8"
    :tabindex="menuBar?.matches(':focus-within') || props.buttonsDisabled ? -1 : 0"
    @focus="focusCurrentButton"
    @keydown.left.stop.prevent="focusPreviousButton"
    @keydown.right.stop.prevent="focusNextButton"
  >
    <div class="flex flex-row">
      <TextEditorButton
        v-for="(button, index) in collapsedButtons"
        :key="index"
        v-bind="button"
        ref="collapsedButtonElements"
        :disabled="props.buttonsDisabled"
        :tab-index="-1"
        @toggle="handleButtonClick"
      />
    </div>
    <div class="flex flex-row">
      <TextEditorButton
        v-for="(button, index) in fixButtons"
        :key="index"
        v-bind="button"
        ref="fixButtonElements"
        :disabled="props.buttonsDisabled"
        :tab-index="-1"
        @toggle="handleButtonClick"
      />
    </div>
  </div>
</template>

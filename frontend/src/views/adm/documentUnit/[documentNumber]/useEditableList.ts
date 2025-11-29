import { ref, type Ref } from 'vue'

/**
 * A composable for managing a reactive list of editable items.
 *
 * Provides utility functions to:
 * - Add a new item to the list (`onAddItem`)
 * - Update an existing item by its `id` (`onUpdateItem`)
 * - Remove an item by its `id` (`onRemoveItem`)
 *
 * Also exposes a reactive flag (`isCreationPanelOpened`) to track UI state,
 * such as whether a creation panel is open.
 *
 * @param list - A Ref-wrapped array of items, each with a unique `id` string.
 * @returns An object with list management methods and reactive UI state.
 */
export function useEditableList<T extends { id: string }>(list: Ref<T[]>) {
  const isCreationPanelOpened = ref(false)

  const onRemoveItem = (id: string) => {
    list.value = list.value.filter((n) => n.id !== id)
  }

  const onAddItem = (item: T) => {
    list.value = [...list.value, item]
    isCreationPanelOpened.value = false
  }

  const onUpdateItem = (item: T) => {
    const index = list.value.findIndex((n) => n.id === item.id)
    list.value[index] = item
  }

  return {
    list,
    onAddItem,
    onUpdateItem,
    onRemoveItem,
    isCreationPanelOpened,
  }
}

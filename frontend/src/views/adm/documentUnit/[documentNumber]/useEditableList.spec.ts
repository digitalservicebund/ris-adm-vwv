import { ref } from 'vue'
import { describe, it, expect, beforeEach } from 'vitest'
import { useEditableList } from '@/views/adm/documentUnit/[documentNumber]/useEditableList'

type Item = { id: string; name: string }

describe('useEditableList', () => {
  const items = ref<Item[]>([])
  let editableList: ReturnType<typeof useEditableList<Item>>

  beforeEach(() => {
    items.value = [
      { id: '1', name: 'Normgeber1' },
      { id: '2', name: 'Normgeber2' },
    ]
    editableList = useEditableList(items)
  })

  it('adds a new item and closes the creation panel', () => {
    editableList.isCreationPanelOpened.value = true

    editableList.onAddItem({ id: '3', name: 'Normgeber3' })

    expect(items.value).toHaveLength(3)
    expect(items.value.find((i) => i.id === '3')).toEqual({ id: '3', name: 'Normgeber3' })
    expect(editableList.isCreationPanelOpened.value).toBe(false)
  })

  it('removes an item by id', () => {
    editableList.onRemoveItem('1')

    expect(items.value).toHaveLength(1)
    expect(items.value.find((i) => i.id === '1')).toBeUndefined()
  })

  it('updates an existing item by id', () => {
    editableList.onUpdateItem({ id: '2', name: 'updatedNormgeber' })

    expect(items.value.find((i) => i.id === '2')).toEqual({ id: '2', name: 'updatedNormgeber' })
  })

  it('does nothing if updating a non-existent item', () => {
    editableList.onUpdateItem({ id: '999', name: 'Ghost' })

    expect(items.value).toHaveLength(2)
    expect(items.value.find((i) => i.id === '999')).toBeUndefined()
  })
})

import { useState } from 'react'
import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'

export function AddListItemForm() {
  const item = useLiveQuery(() => db.list.toArray())
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [status, setStatus] = useState('')

  async function addItem() {
    try {
      // Add the new friend!
      const id = await db.list.add({
        name,
        desc,
      })

      setStatus(`Friend ${name} successfully added. Got id ${id}`)
      setName('')
      setDesc('')
    } catch (error) {
      setStatus(`Failed to add ${name}: ${error}`)
    }
  }
  return (
    <>
      <p>{status}</p>
      Name:
      <input
        type="text"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />
      Desc:
      <input
        type="text"
        value={desc}
        onChange={(ev) => setDesc(ev.target.value)}
      />
      <button onClick={addItem}>Add</button>
      <div>{JSON.stringify(item)}</div>
    </>
  )
}

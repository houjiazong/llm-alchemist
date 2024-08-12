import { AddListItemForm } from '@/components/AddListItemForm'
function App() {
  return (
    <>
      <div className="flex justify-center flex-col items-center">
        <img src="/logo.svg" width={200} />
        <div className="text-xl">LLM Alchemist</div>
      </div>
      <AddListItemForm />
    </>
  )
}

export default App

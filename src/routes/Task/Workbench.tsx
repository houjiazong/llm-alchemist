import { Workbench } from '@/views/Workbench'
import { useParams } from 'react-router-dom'

export const TaskWorkbench = () => {
  const params = useParams()

  return <Workbench taskId={params.taskId as string} />
}

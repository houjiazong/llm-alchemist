import { useRouteError, ErrorResponse } from 'react-router-dom'
export const ErrorPage = () => {
  const error = useRouteError() as ErrorResponse & Error

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl">Oops!</h1>
      <p className="mt-2">Sorry, an unexpected error has occurred.</p>
      <p className="text-xs text-gray-400 mt-2">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}

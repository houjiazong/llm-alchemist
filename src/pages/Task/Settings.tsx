import { RequestSettingsForm } from '@/components/RequestSettingsForm'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
export const TaskSettings = () => {
  return (
    <div className="py-4 max-w-3xl m-auto">
      <RequestSettingsForm />
    </div>
    // <div>
    //   <Tabs defaultValue="endpoint" className="w-full">
    //     <div>
    //       <TabsList>
    //         <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
    //         <TabsTrigger value="request">Request</TabsTrigger>
    //       </TabsList>
    //     </div>
    //     <TabsContent value="endpoint">
    //       <EndpointSettings />
    //     </TabsContent>
    //     <TabsContent value="request">Request</TabsContent>
    //   </Tabs>
    // </div>
  )
}

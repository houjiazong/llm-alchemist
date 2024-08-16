import { RequestSettingsForm } from '@/components/RequestSettingsForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
export const TaskSettings = () => {
  return (
    <Card className="py-4 max-w-xl m-auto">
      <CardHeader>
        <CardTitle>Configur connection</CardTitle>
        {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
      </CardHeader>
      <CardContent>
        <RequestSettingsForm />
      </CardContent>
    </Card>
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

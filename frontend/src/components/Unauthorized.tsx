import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <div className="rounded-full bg-red-100 p-3">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-center text-sm text-gray-500">
          <p>You do not have permission to access this resource.</p>
          <p>
            Please contact your system administrator if you believe this is a
            mistake.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button
            variant="default"
            className="min-w-[140px]"
            render={<Link href="/console" />}
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

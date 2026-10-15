import { Trigger } from "microwireflow";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";

export function Reset() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>We’ll ink a fresh link to your inbox.</CardDescription>
      </CardHeader>
      <CardContent>
        <label className="flex flex-col gap-1 text-sm" htmlFor="reset-email">
          Email
          <Input id="reset-email" placeholder="ada@sketch.shop" />
        </label>
      </CardContent>
      <CardFooter>
        <Trigger id="send" fullWidth={true}>
          <Button type="button" className="flex-1">
            Send reset link
          </Button>
        </Trigger>
      </CardFooter>
    </Card>
  );
}

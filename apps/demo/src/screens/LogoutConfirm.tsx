import { Trigger } from "microwireflow";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

export function LogoutConfirm() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Log out?</CardTitle>
        <CardDescription>The board stays; your session ends.</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch gap-2">
        <Trigger id="confirm" fullWidth={true}>
          <Button type="button" className="w-full">
            Yes, log out
          </Button>
        </Trigger>
        <Trigger id="cancel" fullWidth={true}>
          <Button type="button" variant="neutral" className="w-full">
            Keep me in
          </Button>
        </Trigger>
      </CardFooter>
    </Card>
  );
}

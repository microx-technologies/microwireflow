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

export function LogoutConfirm() {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sign out of session?</CardTitle>
            <CardDescription>
              Your whiteboard layouts will remain safely stored.
            </CardDescription>
          </div>
          <span className="rounded-sketchy-pill border-2 border-border bg-secondary-background px-2.5 py-0.5 text-xs">
            Confirm
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <div className="rounded-sketchy-card border-2 border-border bg-secondary-background p-3 text-xs shadow-shadow">
          <div className="font-bold text-sm">Ada Lovelace</div>
          <div className="text-muted-foreground">
            ada@sketch.shop · Studio Workspace
          </div>
          <p className="mt-2 text-foreground/80">
            All 42 screen node alignments and smart edge routes will be retained
            for your next login.
          </p>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-3 pt-1">
        <Trigger id="cancel" fullWidth={true}>
          <Button type="button" variant="neutral" className="w-full">
            Keep me signed in
          </Button>
        </Trigger>
        <Trigger id="confirm" fullWidth={true}>
          <Button type="button" className="w-full">
            Yes, log out
          </Button>
        </Trigger>
      </CardFooter>
    </Card>
  );
}

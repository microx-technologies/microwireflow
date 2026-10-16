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
    <Card size="sm" className="gap-3">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              We’ll dispatch a secure recovery token to your registered address.
            </CardDescription>
          </div>
          <span className="rounded-sketchy-pill border-2 border-border bg-secondary-background px-2.5 py-0.5 text-xs">
            Security 2FA
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm" htmlFor="reset-email">
            Account email
            <Input id="reset-email" placeholder="ada@sketch.shop" />
          </label>
          <label className="flex flex-col gap-1 text-sm" htmlFor="reset-org">
            Workspace domain
            <Input id="reset-org" placeholder="sketch.shop" />
          </label>
        </div>

        <div className="rounded-sketchy-card border-2 border-dashed border-border bg-secondary-background/60 p-2.5 text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> Single-use recovery
          links remain valid for 15 minutes and invalidate active mobile
          sessions.
        </div>
      </CardContent>

      <CardFooter>
        <Trigger id="send" fullWidth={true}>
          <Button type="button" className="flex-1">
            Send recovery link & return
          </Button>
        </Trigger>
      </CardFooter>
    </Card>
  );
}

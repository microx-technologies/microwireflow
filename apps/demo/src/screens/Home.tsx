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

export function Home() {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Welcome back, Ada</CardTitle>
            <CardDescription>
              3 flows active · last session saved 12m ago.
            </CardDescription>
          </div>
          <span className="rounded-sketchy-pill border-2 border-border bg-secondary-background px-2.5 py-0.5 text-xs">
            Lead Architect
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-sketchy-card border-2 border-border bg-secondary-background p-2 text-center shadow-shadow">
            <div className="text-lg font-bold leading-none">14</div>
            <div className="text-xs text-muted-foreground">Wireflows</div>
          </div>
          <div className="rounded-sketchy-card border-2 border-border bg-secondary-background p-2 text-center shadow-shadow">
            <div className="text-lg font-bold leading-none">42</div>
            <div className="text-xs text-muted-foreground">Live screens</div>
          </div>
          <div className="rounded-sketchy-card border-2 border-border bg-secondary-background p-2 text-center shadow-shadow">
            <div className="text-lg font-bold leading-none">8</div>
            <div className="text-xs text-muted-foreground">Reviewers</div>
          </div>
        </div>

        <div className="rounded-sketchy-card border-2 border-border bg-background p-3 shadow-shadow text-xs">
          <div className="font-bold text-sm mb-1.5">
            Recent architectural flows
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/40">
            <span>Auth & Identity flow</span>
            <span className="text-muted-foreground">5 screens · v1.2</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>Checkout & Payment flow</span>
            <span className="text-muted-foreground">9 screens · Draft</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 pt-1">
        <Trigger id="logout" fullWidth={true}>
          <Button type="button" variant="neutral" className="flex-1">
            Log out of workspace
          </Button>
        </Trigger>
      </CardFooter>
    </Card>
  );
}

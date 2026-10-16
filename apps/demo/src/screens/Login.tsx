import { Trigger } from "microwireflow";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

export function Login({ error }: { error?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-xl leading-none">Welcome back</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to sketch and inspect wireflow architectures.
          </p>
        </div>
        <span className="rounded-sketchy-pill border-2 border-border bg-secondary-background px-2.5 py-0.5 text-xs">
          Studio v0.2
        </span>
      </div>

      {error ? (
        <p className="rounded-sketchy-card border-2 border-border bg-secondary-background px-3 py-2 text-sm text-foreground shadow-shadow">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm" htmlFor="login-email">
          Email address
          <Input id="login-email" placeholder="ada@sketch.shop" />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="login-pass">
          Access token / password
          <Input id="login-pass" type="password" placeholder="••••••••••••" />
        </label>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="remember-me"
            defaultChecked
            className="accent-foreground"
          />
          <label htmlFor="remember-me" className="cursor-pointer">
            Remember session on this canvas
          </label>
        </span>
        <Trigger id="forgot">
          <Button type="button" variant="neutral" size="sm">
            Forgot password?
          </Button>
        </Trigger>
      </div>

      <div className="pt-1">
        <Trigger id="submit" fullWidth={true}>
          <Button type="button" className="flex-1">
            Sign in to board
          </Button>
        </Trigger>
      </div>
    </div>
  );
}

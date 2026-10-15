import { Trigger } from "microwireflow";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

export function Login({ error }: { error?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xl leading-none">Welcome back</h2>
      {error ? (
        <p className="rounded-sketchy-card border-2 border-border bg-secondary-background px-3 py-2 text-sm text-foreground shadow-shadow">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm" htmlFor="login-email">
        Email
        <Input id="login-email" placeholder="ada@sketch.shop" />
      </label>
      <Trigger id="submit" fullWidth={true}>
        <Button type="button" className="flex-1">
          Sign in
        </Button>
      </Trigger>
      <Trigger id="forgot">
        <Button type="button" variant="neutral" size="sm">
          Forgot password?
        </Button>
      </Trigger>
    </div>
  );
}

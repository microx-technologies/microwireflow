import { Trigger } from "microwireflow";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

export function Home() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Home, Ada</CardTitle>
        <CardDescription>
          3 boards pinned · last visit sketched in.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Trigger id="logout" fullWidth={true}>
          <Button type="button" variant="neutral" className="flex-1">
            Log out
          </Button>
        </Trigger>
      </CardFooter>
    </Card>
  );
}

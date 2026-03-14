import { Card, CardContent } from "@/components/ui/card";

export function DataState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-semibold text-slate-100">{title}</p>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

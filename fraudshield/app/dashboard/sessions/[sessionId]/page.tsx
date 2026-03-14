import { SessionDetailPage } from "@/components/dashboard/pages/session-detail-page";

export default function DashboardSessionDetailPage({
  params
}: {
  params: { sessionId: string };
}) {
  return <SessionDetailPage sessionId={params.sessionId} />;
}

import { pageMeta } from "@/lib/seo";
import PageIntro from "@/components/page-intro";
import DashboardApp from "@/components/dashboard-app";

export const metadata = pageMeta({
  title: "Дашборд ЛУЧ — командный центр застройщика (демо)",
  description:
    "Интерактивный дашборд застройщика: сквозная воронка показы→выручка, KPI план-факт, графики по каналам и слой рекомендаций «что делать». Демо на синтетике.",
  path: "/dashboard",
});

export default function DashboardPage() {
  return (
    <>
      <PageIntro
        kicker="Командный центр · демо"
        title={
          <>
            Дашборд ЛУЧ — <span className="text-spectrum">данные плюс решения</span>
          </>
        }
        lead="Плотная BI-подача, как в отчётах сквозной аналитики, но в дизайне ЛУЧ и с тем, чего нет у обычных дашбордов: планом-фактом на каждой метрике и слоем рекомендаций «что делать». Фильтры вверху реально пересчитывают все виджеты. Данные синтетические, на реальных порядках застройщика."
        color="var(--c-indigo)"
      />
      <DashboardApp />
    </>
  );
}

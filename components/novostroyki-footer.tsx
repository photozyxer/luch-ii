import Link from "next/link";
import { listDistricts, listDevelopers } from "@/lib/novostroyki/catalog";

/** Футер поддомена новостроек — без агентского блока ЛУЧ. */
export default function NovostroykiFooter() {
  const districts = listDistricts().slice(0, 6);
  const developers = listDevelopers();

  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-sm font-semibold">Новостройки Екатеринбурга</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Подбор квартир в новостройках Екатеринбурга — все застройщики, актуальные цены, планировки и акции. ИИ-консультант поможет выбрать.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Районы</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {districts.map((d) => (
                <li key={d.slug}><Link href={`/novostroyki/rayon/${d.slug}`} className="text-muted transition-colors hover:text-fg">{d.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Застройщики</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {developers.map((d) => (
                <li key={d.slug}><Link href={`/novostroyki/zastroyshchik/${d.slug}`} className="text-muted transition-colors hover:text-fg">{d.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Разделы</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/novostroyki/akcii" className="text-muted transition-colors hover:text-fg">Акции и скидки</Link></li>
              <li><Link href="/novostroyki/ipoteka" className="text-muted transition-colors hover:text-fg">Ипотека и рассрочка</Link></li>
              <li><Link href="/novostroyki" className="text-muted transition-colors hover:text-fg">Подобрать квартиру</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs leading-relaxed text-muted/70">
          <p>
            Данные собраны из открытых каталогов застройщиков Екатеринбурга. Цены, наличие и условия акций могут измениться — актуальные подтверждает менеджер. Сервис не является публичной офертой.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Новостройки Екатеринбурга ·{" "}
            <Link href="/privacy" className="underline decoration-line underline-offset-2 hover:decoration-fg">Политика обработки персональных данных</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

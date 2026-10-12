import { awards, education, socialService } from "@/data/portfolio";
import { SectionLabel } from "./About";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-current/20 pt-6">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  );
}

export default function Extras() {
  return (
    <section data-blob="experience" data-theme-section="light" className="relative grid gap-20 px-4 pb-28 md:grid-cols-12 md:gap-x-8 md:px-8 md:pb-44">
      <div className="md:col-span-5">
        <Block title="Education">
          <ul className="space-y-8">
            {education.map((e) => (
              <li key={e.title}>
                <p className="label opacity-60">{e.period}</p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-medium leading-none">{e.title}</h3>
                <p className="mt-2 text-sm">{e.place}</p>
                {e.note && <p className="mt-1 text-sm opacity-60">{e.note}</p>}
              </li>
            ))}
          </ul>
        </Block>
      </div>
      <div className="md:col-span-4 md:col-start-7 md:mt-32">
        <Block title="Awards">
          <ul className="space-y-8">
            {awards.map((a) => (
              <li key={a.title}>
                <p className="label opacity-60">{a.year}</p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-medium leading-none">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-80">{a.detail}</p>
              </li>
            ))}
          </ul>
        </Block>
      </div>
      <div className="md:col-span-3 md:col-start-10 md:-mt-10 md:row-start-2">
        <Block title="Social service">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium leading-tight">{socialService.org}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {socialService.points.map((p) => <li key={p}>— {p}</li>)}
          </ul>
        </Block>
      </div>
    </section>
  );
}

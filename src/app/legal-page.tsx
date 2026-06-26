import React from "react";
import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-pink-500/30 selection:text-pink-900">
      <div className="background-container opacity-60">
        <div className="background-shape shape1 mix-blend-multiply" />
        <div className="background-shape shape2 mix-blend-multiply" />
        <div className="background-shape shape3 mix-blend-multiply" />
      </div>

      <main className="relative z-10 px-4 sm:px-10 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white/70 text-sm font-medium text-[#1B0D15] hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined !text-base">arrow_back</span>
            Back to 1Do
          </Link>

          <section className="frosted-glass rounded-[2.4rem] p-6 sm:p-9 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))]">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-white/65 border border-white/70 text-[#1B0D15]/70">
              {eyebrow}
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-[#1B0D15]">
              {title}
            </h1>
            <p className="mt-3 text-sm text-[#1B0D15]/55">
              Last updated: {updated}
            </p>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#1B0D15]/75">
              {intro}
            </p>
          </section>

          <section className="space-y-4">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[2rem] bg-white/75 border border-white/80 p-5 sm:p-7 shadow-[0_15px_35px_-24px_rgba(30,27,75,0.5)]"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1B0D15]">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm sm:text-base leading-relaxed text-[#1B0D15]/72"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

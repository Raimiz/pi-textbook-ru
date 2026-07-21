import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  Braces,
  GitBranch,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { ContinueLearning } from "@/components/continue-learning";
import { CourseMap } from "@/components/course-map";
import { courseNav, courseParts } from "@/lib/course";

export const metadata: Metadata = {
  description:
    "Практический путь от протокола сообщений и потока событий до надежного Runtime для агента.",
};

const trace = [
  ["01", "user", "прочитать README, исправить тест"],
  ["02", "model", "toolCall · read({ path })"],
  ["03", "tool", "toolResult · содержимое файла"],
  ["04", "model", "toolCall · edit({ oldText, newText })"],
  ["05", "tool", "toolResult · точная замена"],
  ["06", "model", "toolCall · bash({ command: npm test })"],
  ["07", "loop", "stop · изменения готовы, тесты проходят"],
];

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">15 CHECKPOINTS · TYPESCRIPT</p>
          <h1>
            Начните с одной траектории,
            <br />
            <em>шаг за шагом соберите Pi.</em>
          </h1>
          <p className="hero-intro">
            Начните с полностью офлайн-трассировки, затем постепенно соберите
            потоковую модель, протокол инструментов, Agent Loop, дерево сессий,
            сжатие контекста и расширяемый продуктовый вход. На каждом шаге —
            настоящий TypeScript, эксперименты со сбоями и машинная проверка.
          </p>
          <ContinueLearning chapters={courseNav} />
          <div className="hero-secondary-links">
            <Link href="/map">Посмотреть всю программу</Link>
            <Link href="/about">Почему такой порядок</Link>
          </div>
        </div>
        <div className="hero-trace" aria-label="Полная траектория агента">
          <header>
            <span className="trace-status" />
            <strong>OFFLINE TRACE</strong>
            <small>ScriptedModel · deterministic</small>
          </header>
          <ol>
            {trace.map(([number, owner, event]) => (
              <li key={number}>
                <span>{number}</span>
                <small>{owner}</small>
                <code>{event}</code>
              </li>
            ))}
          </ol>
          <footer>
            <span>7 событий</span>
            <span>3 хода модели</span>
            <span>0 сетевых вызовов</span>
          </footer>
        </div>
        <a className="hero-scroll" href="#course">
          <ArrowDown aria-hidden="true" size={16} />
          Начать с карты
        </a>
      </section>

      <section className="principle-band" aria-label="Четыре принципа учебника">
        <div>
          <Braces aria-hidden="true" />
          <strong>Настоящий код</strong>
          <span>Интерфейсы происходят из одного компилируемого Workshop</span>
        </div>
        <div>
          <TerminalSquare aria-hidden="true" />
          <strong>Настоящий вывод</strong>
          <span>Ключевые трассы и границы зафиксированы тестами</span>
        </div>
        <div>
          <GitBranch aria-hidden="true" />
          <strong>Накопительное знание</strong>
          <span>Каждая глава оставляет восстанавливаемый checkpoint</span>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" />
          <strong>Сбой вначале</strong>
          <span>Находим ответственный слой по первому отклонению</span>
        </div>
      </section>

      <section id="course" className="home-course">
        <header className="section-heading">
          <p>15 ЭТАПОВ · ОДНА РАБОЧАЯ СИСТЕМА</p>
          <h2>Одна основная цепочка — и реальная сложность слой за слоем</h2>
          <span>
            Это не экскурсия по папкам репозитория. Каждая глава вводит одну
            главную сложность и снова применяет предыдущую идею в новых ограничениях.
          </span>
        </header>
        <CourseMap parts={courseParts} chapters={courseNav} />
      </section>

      <section className="home-contract">
        <div>
          <p>КРИТЕРИЙ ОСВОЕНИЯ</p>
          <h2>Зелёный тест — не финиш.</h2>
        </div>
        <blockquote>
          Когда задержка, отсутствие подсказки или другой сценарий сбоя не ломают
          парность сообщений, владение состоянием и инварианты истории — вы
          действительно умеете строить агентов.
        </blockquote>
        <Link href="/about">Прочитать учебный договор →</Link>
      </section>
    </main>
  );
}

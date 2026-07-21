# Russian Translation Guide

## Purpose

This document defines the editorial and translation rules for the Russian edition of Pi Textbook.

The goal is not a literal translation. The Russian text should read as if it was originally written in Russian technical prose while preserving the author's meaning, structure, rhythm, and engineering intent.

## Source of truth

When rules conflict, use this priority:

1. The original source text and code behavior.
2. Approved editorial decisions in this document.
3. Terms defined in `GLOSSARY.md`.
4. Working rules in `AGENTS.md`.
5. Local consistency within the chapter.

Do not silently override an approved decision. Record a proposed change and explain why it improves accuracy or readability.

## Translation workflow

Every chapter passes through three stages.

### 1. Technical translation

- Preserve the exact meaning of the original.
- Verify technical claims against surrounding code and examples.
- Preserve code, identifiers, commands, paths, API names, and protocol names.
- Mark ambiguous places for review instead of guessing.

### 2. Editorial rewrite

- Rewrite literal constructions into natural Russian.
- Preserve the author's concise rhythm.
- Prefer direct sentences and concrete verbs.
- Remove calques, unnecessary nouns, and bureaucratic wording.
- Keep explanations compact unless the original intentionally expands them.

### 3. Technical consistency review

- Check terms against `GLOSSARY.md`.
- Check repeated concepts across earlier chapters.
- Verify headings, UI labels, code comments, tests, and links.
- Confirm that the Russian wording does not imply behavior absent from the original.

A chapter is complete only after all three stages.

## Editorial style

The target style is modern Russian technical documentation, comparable in tone to well-edited JetBrains, Go, Rust, and PostgreSQL documentation.

Use:

- clear subject and predicate;
- active voice where natural;
- short paragraphs;
- precise engineering vocabulary;
- consistent terminology;
- `ё` only where needed to prevent ambiguity or where already used consistently in a local context.

Avoid:

- word-for-word translation;
- heavy participial chains;
- bureaucratic phrases;
- marketing language not present in the original;
- unnecessary English where an established Russian term is clearer;
- forced translation of names, interfaces, APIs, and project-specific concepts.

## Rhythm and structure

- Preserve the order of reasoning unless Russian syntax requires a local rewrite.
- Preserve intentional repetition when it reinforces a concept.
- Do not merge distinct paragraphs merely to shorten the text.
- Do not split a compact argument into a long tutorial unless a translator note is explicitly justified.
- Headings should be concise and parallel in form.

## Terminology policy

### Keep in English

- Pi
- Tool Calling
- Agent Loop
- runtime
- checkpoint
- prompt
- TypeScript
- JSON
- API
- CLI
- SDK
- HTTP
- SSE
- WebSocket

These terms may receive a Russian explanation in the glossary, but their established spelling remains unchanged in the course text unless a later approved decision says otherwise.

### Translate consistently

- Session Tree → дерево сессий
- Streaming → потоковая обработка
- Context Compression → сжатие контекста
- Trace → трассировка
- Chapter → глава
- Lesson → урок
- Layer → слой

### Approved UI labels

- Program → Курс
- Method → Методика
- Glossary → Глоссарий

### Approved buttons

- Начать курс
- Продолжить обучение
- Следующая глава
- Вернуться к checkpoint

## Code and technical artifacts

Do not translate:

- source code identifiers;
- filenames and paths;
- package names;
- shell commands;
- JSON keys;
- protocol messages;
- test names when changing them would break code or references.

Translate:

- prose comments when they are part of the educational narrative and changing them is safe;
- visible UI strings;
- explanatory text around code;
- test descriptions only when they are user-facing and remain technically valid.

Never change program behavior merely to make a translation easier.

## Translator notes

Translator notes are exceptional, not routine.

Add one only when:

- the original relies on cultural or technical context likely to be missing for the Russian reader;
- a project-specific term cannot be explained naturally in the main text;
- a source ambiguity materially affects understanding.

Rules:

- clearly label the note as `Примечание переводчика`;
- keep it short;
- do not use notes to add personal opinions;
- do not correct or argue with the author inside the translated text;
- place broader analysis in `OBSERVATIONS.md`.

## Handling ambiguity and disagreement

For a disputed passage, record:

1. the original wording;
2. the current Russian variant;
3. the proposed variant;
4. the type of problem: semantic, technical, stylistic, or terminological;
5. the trade-off introduced by each variant;
6. the final decision and rationale.

The best variant is the one that preserves meaning, sounds natural in Russian, fits the author's rhythm, and remains consistent with the rest of the book.

## AI translation instructions

An AI agent working on the project must:

- read `AGENTS.md`, this document, and relevant glossary entries before editing;
- inspect the whole local section, not translate isolated sentences;
- identify ambiguity explicitly;
- avoid inventing explanations absent from the original;
- distinguish translation from commentary;
- update the glossary and observations only when there is a meaningful addition;
- explain material deviations from the source in the commit or review notes;
- never treat fluent wording as proof of technical correctness.

## Final book-wide review

After all chapters are translated, perform a complete editorial pass across the textbook:

- unify terminology;
- remove local inconsistencies;
- normalize headings and UI labels;
- review translator notes;
- verify links, tests, and code snippets;
- write the Russian-edition preface based on the completed course;
- prepare the first stable release only after this pass.

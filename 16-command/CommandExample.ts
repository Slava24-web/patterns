// Паттерн: Command (Команда), пример на commander
// Идея: действие оформляем объектом: команда знает, как выполниться (execute) и как отмениться (undo).
// Объекты команд можно хранить, откладывать и выполнять по очереди. Так работает история отмены.
// commander запускает команды из терминала: каждая подкоманда создаёт объект команды и передаёт его в историю.

import { Command } from 'commander';

// 1. КОМАНДА: общий интерфейс. Все действия редактора реализуют его.
export interface EditCommand {
  execute(): void;
  undo(): void;
}

// 2. ПОЛУЧАТЕЛЬ: документ, который команды реально меняют.
export class Document {
  text = '';
}

// 3. Конкретные команды. Каждая знает, как отменить собственное изменение.
export class AppendCommand implements EditCommand {
  constructor(
    private readonly doc: Document,
    private readonly chunk: string,
  ) {}

  execute(): void {
    this.doc.text += this.chunk;
  }

  undo(): void {
    this.doc.text = this.doc.text.slice(0, -this.chunk.length);
  }
}

export class DeleteLastCommand implements EditCommand {
  private removed = '';

  constructor(private readonly doc: Document) {}

  execute(): void {
    // запоминаем удалённый символ, чтобы undo смог его вернуть
    this.removed = this.doc.text.slice(-1);
    this.doc.text = this.doc.text.slice(0, -1);
  }

  undo(): void {
    this.doc.text += this.removed;
  }
}

// 4. ИСТОРИЯ: выполняет команды и хранит их в стеке. undo снимает последнюю команду.
export class CommandHistory {
  private readonly done: EditCommand[] = [];

  run(command: EditCommand): void {
    command.execute();
    this.done.push(command);
  }

  undo(): boolean {
    const command = this.done.pop();
    if (!command) {
      return false;
    }
    command.undo();
    return true;
  }
}

// 5. CLI: каждая подкоманда создаёт объект команды и отдаёт его истории.
export function createCli(doc: Document, history: CommandHistory): Command {
  const program = new Command().name('note').exitOverride();

  program
    .command('append')
    .argument('<text>')
    .action((text: string) => history.run(new AppendCommand(doc, text)));

  program.command('delete').action(() => history.run(new DeleteLastCommand(doc)));

  program.command('undo').action(() => {
    history.undo();
  });

  program.command('show').action(() => {
    console.log(JSON.stringify(doc.text));
  });

  return program;
}

// 6. Использование: одна сессия, команды выполняются по очереди, отмена работает по стеку.
const doc = new Document();
const history = new CommandHistory();
const cli = createCli(doc, history);

async function demo() {
  await cli.parseAsync(['append', 'Hello '], { from: 'user' });
  await cli.parseAsync(['append', 'world'], { from: 'user' });
  await cli.parseAsync(['show'], { from: 'user' });
  await cli.parseAsync(['undo'], { from: 'user' });
  await cli.parseAsync(['show'], { from: 'user' });
}

demo();

// 7. Чтобы добавить новое действие (например, замену текста), пишем новый класс с execute и undo
// и подкоманду в createCli. CommandHistory и остальные команды при этом не меняются.

// Паттерн: Factory (Фабрика)
// Идея: есть данные (config) -> фабрика решает, какой компонент создать.
// Вызывающий код не знает про конкретные компоненты, он говорит только "дай поле такого типа".

import { useState, type FormEvent } from 'react';

// 1. Данные: описание полей. В реальности это приходит с сервера (JSON).
type TextConfig = { type: 'text' | 'email'; name: string; label: string };
type SelectConfig = { type: 'select'; name: string; label: string; options: string[] };
type FieldConfig = TextConfig | SelectConfig;

// 2. Общий контракт для всех полей, которые создает фабрика
type FieldProps<C extends FieldConfig> = {
  config: C;
  value: string;
  onChange: (value: string) => void;
};

// 3. Конкретные компоненты. Каждый знает только про свой тип.
function TextField({ config, value, onChange }: FieldProps<TextConfig>) {
  return (
    <label>
      {config.label}
      <input
        type={config.type}
        name={config.name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SelectField({ config, value, onChange }: FieldProps<SelectConfig>) {
  return (
    <label>
      {config.label}
      <select name={config.name} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          Выберите...
        </option>
        {config.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

// 4. ФАБРИКА: одна точка, которая по config.type выбирает компонент.
type FieldFactoryProps = {
  config: FieldConfig;
  value: string;
  onChange: (value: string) => void;
};

export function FieldFactory({ config, value, onChange }: FieldFactoryProps) {
  switch (config.type) {
    case 'text':
    case 'email':
      // TypeScript сузил config до TextConfig
      return <TextField config={config} value={value} onChange={onChange} />;
    case 'select':
      // config сужен до SelectConfig
      return <SelectField config={config} value={value} onChange={onChange} />;
    default: {
      // Если добавишь новый type и забудешь case, TypeScript покажет ошибку здесь
      const unknown: never = config;
      throw new Error(`Неизвестный тип поля: ${JSON.stringify(unknown)}`);
    }
  }
}

// 5. Использование: форма строится из данных, без единого if по типам
const signupSchema: FieldConfig[] = [
  { type: 'text', name: 'name', label: 'Имя' },
  { type: 'email', name: 'email', label: 'Email' },
  { type: 'select', name: 'plan', label: 'Тариф', options: ['Free', 'Pro', 'Team'] },
];

export default function SignupForm() {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Отправляем:', values);
  };

  return (
    <form onSubmit={handleSubmit}>
      {signupSchema.map((field) => (
        <FieldFactory
          key={field.name}
          config={field}
          value={values[field.name] ?? ''}
          onChange={(value) => setValues((prev) => ({ ...prev, [field.name]: value }))}
        />
      ))}
      <button type="submit">Зарегистрироваться</button>
    </form>
  );
}

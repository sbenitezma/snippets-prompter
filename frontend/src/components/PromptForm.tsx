import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { parseCategories } from '../lib/prompts';
import { promptFormSchema, type PromptFormValues } from '../lib/schema';
import type { PromptDraft } from '../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';

type PromptFormProps = {
  heading: string;
  initial?: PromptDraft;
  onSubmit: (draft: PromptDraft) => void;
  onCancel: () => void;
};

export function PromptForm({ heading, initial, onSubmit, onCancel }: PromptFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: initial?.title ?? '',
      body: initial?.body ?? '',
      categories: initial?.categories.join(', ') ?? '',
    },
  });

  // Move focus into the form when it opens so keyboard users land in it.
  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  return (
    <Card className="panel">
      <h2>{heading}</h2>
      <form
        className="form-grid"
        noValidate
        onSubmit={handleSubmit((values) =>
          onSubmit({
            title: values.title,
            body: values.body,
            categories: parseCategories(values.categories),
          }),
        )}
      >
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea
          label="Body"
          hint="Use {{variable}} to add a gap you can fill in later."
          error={errors.body?.message}
          {...register('body')}
        />
        <Input
          label="Categories"
          hint="Separate with commas. New categories are created as you type them."
          {...register('categories')}
        />
        <div className="actions">
          <Button type="submit">Save prompt</Button>
          <Button tone="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import App from './App';

function setup() {
  const user = userEvent.setup();
  const view = render(<App />);
  return { user, ...view };
}

function cardFor(title: string) {
  const card = screen.getByRole('heading', { level: 3, name: title }).closest('article');
  if (!card) throw new Error(`No card for ${title}`);
  return card;
}

async function createPrompt(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  body: string,
  categories = '',
) {
  await user.click(screen.getByRole('button', { name: 'New prompt' }));
  await user.type(screen.getByLabelText('Title'), title);
  await user.type(screen.getByLabelText('Body'), body);
  if (categories) await user.type(screen.getByLabelText('Categories'), categories);
  await user.click(screen.getByRole('button', { name: 'Save prompt' }));
}

describe('App', () => {
  it('shows the example prompts on first load', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Product launch teaser' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Your prompts \(4\)/ })).toBeVisible();
  });

  it('validates required fields', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'New prompt' }));
    await user.click(screen.getByRole('button', { name: 'Save prompt' }));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Body is required')).toBeInTheDocument();
  });

  it('creates a prompt and keeps it after a reload', async () => {
    const { user, unmount } = setup();
    await createPrompt(user, 'My test prompt', 'Hello {{name}}', 'testing, demo');
    expect(
      screen.getByRole('heading', { level: 3, name: 'My test prompt' }),
    ).toBeInTheDocument();

    unmount();
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'My test prompt' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'demo' })).toBeInTheDocument();
  });

  it('edits a prompt', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Edit Code review request' }));
    const title = screen.getByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'Renamed review');
    await user.click(screen.getByRole('button', { name: 'Save prompt' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Renamed review' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Code review request' }),
    ).not.toBeInTheDocument();
  });

  it('asks for confirmation before deleting', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: "Delete Explain like I'm new" }));
    expect(
      screen.getByRole('heading', { level: 3, name: "Explain like I'm new" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "Confirm delete Explain like I'm new" }));
    expect(
      screen.queryByRole('heading', { level: 3, name: "Explain like I'm new" }),
    ).not.toBeInTheDocument();
  });

  it('searches title and body', async () => {
    const { user } = setup();
    await user.type(screen.getByRole('searchbox', { name: 'Search prompts' }), 'teaser');
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Code review request' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Product launch teaser' }),
    ).toBeInTheDocument();
  });

  it('filters by category', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'coding' }));
    expect(
      screen.getByRole('heading', { level: 3, name: 'Code review request' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Product launch teaser' }),
    ).not.toBeInTheDocument();
  });

  it('creates from an existing prompt and forgets a deleted source', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Create from Product launch teaser' }));
    expect(screen.getByLabelText('Title')).toHaveValue('Product launch teaser (copy)');
    await user.click(screen.getByRole('button', { name: 'Save prompt' }));

    const copy = cardFor('Product launch teaser (copy)');
    expect(within(copy).getByText('Created from: Product launch teaser')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Product launch teaser' }));
    await user.click(screen.getByRole('button', { name: 'Confirm delete Product launch teaser' }));

    expect(within(cardFor('Product launch teaser (copy)')).queryByText(/Created from/)).toBeNull();
  });

  it('fills variables and copies the resolved text', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Use Product launch teaser (short)' }));
    await user.type(screen.getByLabelText('tone'), 'playful');
    await user.type(screen.getByLabelText('product'), 'Aurora');

    const expected = 'Write a playful one-line teaser for Aurora.';
    expect(screen.getByText(expected)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));
    expect(await screen.findByText('Copied to clipboard.')).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(expected);
  });
});

describe('accessibility', () => {
  it('has no axe violations on the main view', async () => {
    const { container } = setup();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations with the form open and showing errors', async () => {
    const { user, container } = setup();
    await user.click(screen.getByRole('button', { name: 'New prompt' }));
    await user.click(screen.getByRole('button', { name: 'Save prompt' }));
    await screen.findByText('Title is required');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations in the variable panel', async () => {
    const { user, container } = setup();
    await user.click(screen.getByRole('button', { name: 'Use Product launch teaser' }));
    expect((await axe(container)).violations).toEqual([]);
  });
});

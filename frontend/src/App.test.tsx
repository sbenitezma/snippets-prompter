import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { STORAGE_KEY } from './lib/storage';

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
    expect(screen.getByRole('heading', { level: 3, name: 'My test prompt' })).toBeInTheDocument();

    unmount();
    render(<App />);
    expect(screen.getByRole('heading', { level: 3, name: 'My test prompt' })).toBeInTheDocument();
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

describe('theme', () => {
  it('follows the system by default and remembers a chosen theme', async () => {
    const { user, unmount } = setup();
    const select = screen.getByRole('combobox', { name: 'Theme' });
    expect(select).toHaveValue('system');
    expect(document.documentElement.dataset.theme).toBeUndefined();

    await user.selectOptions(select, 'dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    unmount();
    render(<App />);
    expect(screen.getByRole('combobox', { name: 'Theme' })).toHaveValue('dark');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'system');
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});

describe('focus management', () => {
  it('moves focus into the variable panel and back to its button on close', async () => {
    const { user } = setup();
    const useButton = screen.getByRole('button', { name: 'Use Product launch teaser' });
    await user.click(useButton);
    expect(screen.getByLabelText('tone')).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('heading', { name: /^Use “/ })).not.toBeInTheDocument();
    expect(useButton).toHaveFocus();
  });

  it('returns focus to the opener after saving a form', async () => {
    const { user } = setup();
    await createPrompt(user, 'Focus test', 'Body');
    expect(screen.getByRole('button', { name: 'New prompt' })).toHaveFocus();
    expect(screen.getByText('Saved “Focus test”.')).toBeInTheDocument();
  });

  it('keeps focus on the delete controls and lands on the list after deleting', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: "Delete Explain like I'm new" }));
    expect(
      screen.getByRole('button', { name: "Confirm delete Explain like I'm new" }),
    ).toHaveFocus();

    await user.click(screen.getByRole('button', { name: "Keep Explain like I'm new" }));
    expect(screen.getByRole('button', { name: "Delete Explain like I'm new" })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: "Delete Explain like I'm new" }));
    await user.click(screen.getByRole('button', { name: "Confirm delete Explain like I'm new" }));
    expect(screen.getByRole('heading', { level: 2, name: /Your prompts/ })).toHaveFocus();
    expect(screen.getByText("Deleted “Explain like I'm new”.")).toBeInTheDocument();
  });

  it('announces how many prompts match a search', async () => {
    const { user } = setup();
    await user.type(screen.getByRole('searchbox', { name: 'Search prompts' }), 'teaser');
    expect(screen.getByText('2 prompts match.')).toBeInTheDocument();
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

  it('has no axe violations in the import preview and the recovery notice', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken');
    const { user, container } = setup();
    await uploadCsv(user, 'title,body\nOk,Body\n,Missing title\n');
    await screen.findByRole('heading', { name: 'Import “prompts.csv”' });
    expect((await axe(container)).violations).toEqual([]);
  });
});

async function uploadCsv(user: ReturnType<typeof userEvent.setup>, csv: string) {
  const file = new File([csv], 'prompts.csv', { type: 'text/csv' });
  await user.upload(screen.getByLabelText('CSV file to import'), file);
}

describe('import and export', () => {
  it('exports every prompt as a spreadsheet-ready CSV', async () => {
    // jsdom has no object URLs: stand in for them, and for the download click.
    const created = vi.fn<(blob: Blob) => string>(() => 'blob:test');
    URL.createObjectURL = created;
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    const csv = await created.mock.calls[0][0].text();
    // FileReader drops the byte order mark when decoding, so only the header is checked.
    expect(csv.split('\r\n')[0]).toBe('title,body,categories,id,sourceId');
    expect(csv).toContain('Product launch teaser (short)');
    expect(click).toHaveBeenCalledOnce();
    expect(
      screen.getByText(/^Exported 4 prompts to snippets-prompter-.*\.csv\.$/),
    ).toBeInTheDocument();
    click.mockRestore();
  });

  it('previews an import, applies it on confirmation and announces the result', async () => {
    const { user } = setup();
    const useButton = screen.getByRole('button', { name: 'Import CSV' });
    await user.click(useButton);
    await uploadCsv(
      user,
      'title,body,categories,id\nRenamed,Explain {{topic}}.,learning,seed-2\nBrand new,Hi,greetings,\n',
    );

    expect(await screen.findByText('1 new prompt')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Import “prompts.csv”' })).toHaveFocus();
    expect(screen.getByText('1 prompt updated')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Import 2 prompts' }));

    expect(screen.getByRole('heading', { level: 3, name: 'Brand new' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Renamed' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Your prompts \(5\)/ })).toBeVisible();
    expect(screen.getByText('Imported 1 new and 1 updated prompts.')).toBeInTheDocument();
  });

  it('changes nothing when an import is cancelled', async () => {
    const { user } = setup();
    await uploadCsv(user, 'title,body\nBrand new,Hi\n');
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { level: 3, name: 'Brand new' })).not.toBeInTheDocument();
  });

  it('lists skipped rows and explains files it cannot use', async () => {
    const { user } = setup();
    await uploadCsv(user, 'title,body\n,No title\n');
    expect(await screen.findByText('Row 2: Title is required')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Import \d/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await uploadCsv(user, 'name,text\nA,B\n');
    expect(await screen.findByText(/must name the columns/)).toBeInTheDocument();
  });
});

describe('recovery', () => {
  it('tells the user when saved data could not be read, and keeps a copy', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken');
    const { user } = setup();
    expect(
      screen.getByRole('heading', { name: 'Some saved prompts could not be read' }),
    ).toBeInTheDocument();
    const backups = Object.keys(window.localStorage).filter((key) => key.includes(':backup:'));
    expect(backups).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('heading', { name: /could not be read/ })).not.toBeInTheDocument();
  });
});

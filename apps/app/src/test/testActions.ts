import userEvent from '@testing-library/user-event';

/** Click helper using userEvent */
export async function click(el: Element) {
  await userEvent.click(el as HTMLElement);
}

/** Type helper using userEvent */
export async function type(el: Element, text: string) {
  await userEvent.type(el as HTMLElement, text);
}

/** Press Tab one or more times */
export async function tab(times = 1) {
  for (let i = 0; i < times; i++) {
  // eslint-disable-next-line no-await-in-loop
  await userEvent.tab();
  }
}

/** Change value of a select (native) */
export async function selectOption(selectEl: HTMLSelectElement, value: string) {
  await userEvent.selectOptions(selectEl, value);
}

/** Submit helper: clicks a button or submits a form */
export async function submit(target: HTMLFormElement | Element) {
  if (target instanceof HTMLFormElement) {
  target.requestSubmit();
  } else {
    await click(target);
  }
}

// Native disclosure supports touch and keyboard; hover is an enhancement.
for (const menu of document.querySelectorAll('.related-sites')) {
  const trigger = menu.querySelector('summary');
  menu.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') menu.open = true;
  });
  menu.addEventListener('pointerleave', () => {
    if (!menu.contains(document.activeElement)) menu.open = false;
  });
  menu.addEventListener('focusout', event => {
    if (!menu.contains(event.relatedTarget)) menu.open = false;
  });
  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menu.open = false;
      trigger.focus();
      event.preventDefault();
    }
  });
}

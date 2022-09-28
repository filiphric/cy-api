export const getContainer = () => {
  // @ts-ignore
  const doc: Document = cy.state('document');
  // @ts-ignore
  const win: Window = cy.state('window');
  let container = doc.querySelector<HTMLElement>('.container');
  if (!container) {
    container = doc.createElement('div');
    container.className = 'container';
    doc.body.appendChild(container);
  }
  container.className = 'container';
  return { container, win, doc };
}
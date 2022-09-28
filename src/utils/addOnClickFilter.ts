export const addOnClickFilter = (filterId: string): void => {
  // @ts-ignore
  const doc = cy.state('document')
  doc.getElementById(`check-${filterId}`).onclick = () => {
    const checkbox = doc.getElementById(`check-${filterId}`)
    const elements = doc.getElementsByClassName(checkbox.value)
    for (let log of elements) {
      log.style.display = checkbox.checked ? 'block' : 'none'
    }
  }
}
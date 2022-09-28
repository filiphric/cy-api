import { normalize } from './utils/normalize';
const { get, filter, map, uniq } = Cypress._

export const printResponse = (container: HTMLElement, hasApiMessages: boolean, messagesEndpoint: string, normalizedTypes: string[], normalizedNamespaces: string[], displayRequest = true) => {
  let messages: Message[] = [];
  if (hasApiMessages) {
    return cy.request({
      url: messagesEndpoint,
      log: false,
      failOnStatusCode: false // maybe there is no endpoint with logs
    }).then(res => {
      messages = get(res, 'body.messages', [])
      if (messages.length) {
        const types = uniq(map(messages, 'type')).sort()
        // types will be like
        // ['console', 'debug', 'util.debuglog']
        const namespaces = types.map(type => {
          return {
            type,
            namespaces: uniq(
              map(filter(messages, { type }), 'namespace')
            ).sort()
          }
        })
        // namespaces will be like
        // [
        //  {type: 'console', namespaces: ['log']},
        //  {type: 'util.debuglog', namespaces: ['HTTP']}
        // ]
        if (displayRequest) {
          container.innerHTML +=
            '<hr>\n' + '<div style="text-align: left">\n' + `<b>Server logs</b>`

          if (types.length) {
            for (const type of types) {
              const normalizedType = normalize(type)
              normalizedTypes.push(normalizedType)
              container.innerHTML += `\n<input type="checkbox" id="check-${normalizedType}" checked name="${type}" value="${normalizedType}"> ${type}`
            }
            container.innerHTML += '<br/>\n'
          }
          if (namespaces.length) {
            container.innerHTML +=
              '\n' +
              namespaces
                .map(n => {
                  if (!n.namespaces.length) {
                    return ''
                  }
                  return n.namespaces
                    .map(namespace => {
                      const normalizedNamespace = normalize(n.type, namespace)
                      normalizedNamespaces.push(normalizedNamespace)
                      return `\n<input type="checkbox" name="${n.type}.${namespace}"
                        id="check-${normalizedNamespace}" checked
                        value="${normalizedNamespace}"> ${n.type}.${namespace}`
                    })
                    .join('')
                })
                .join('') +
              '<br/>\n'
          }

          container.innerHTML +=
            '\n<pre class="cy-api-logs-messages">' +
            messages
              .map(m => `<div class="${normalize(m.type)} ${normalize(m.type, m.namespace)}">${m.type} ${m.namespace}: ${m.message}</div>`)
              .join('') +
            '\n</pre></div>'
        }
      }
    }).then(() => cy.wrap({ messages }, { log: false }))
  } else {
    return cy.wrap({ messages }, { log: false })
  }
}
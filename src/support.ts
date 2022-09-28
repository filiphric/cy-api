/// <reference types="cypress" />

import { html } from 'common-tags';
import { formatRequest } from './utils/formatRequest';
import { formatResponse } from './utils/formatResponse';
import { getContainer } from './utils/getContainer';
import { addOnClickFilter } from './utils/addOnClickFilter';
import { printResponse } from './printResponse';

const pack = require('../package.json');

//
// implementation of the custom command "cy.api"
// https://github.com/bahmutov/cy-api
//

// shortcuts to a few Lodash methods
const { get } = Cypress._

let firstApiRequest: boolean

let globalDisplayRequest = true

Cypress.on('test:before:run', () => {
  // @ts-ignore
  const apiDisplayRequest = Cypress.config('apiDisplayRequest')
  globalDisplayRequest = apiDisplayRequest === undefined ? true : apiDisplayRequest as boolean
  firstApiRequest = true;
  // @ts-ignore
  const doc: Document = cy.state('document');
  doc.body.innerHTML = ''
})

function initApiOptions(): ApiOptions {
  if (globalDisplayRequest === false) {
    return { displayRequest: false }
  } else {
    return { displayRequest: true }
  }
}

Cypress.Commands.add('api', (options: Partial<Cypress.RequestOptions>, name) => {

  const apiOptions = initApiOptions();
  const hasApiMessages = Cypress.env('API_MESSAGES') === false ? false : true
  let normalizedTypes: string[] = []
  let normalizedNamespaces: string[] = []
  var { container, win, doc } = getContainer();
  const messagesEndpoint = get(
    Cypress.env(),
    'cyApi.messages',
    '/__messages__'
  )

  // first reset any messages on the server
  if (hasApiMessages) {
    cy.request({
      method: 'POST',
      url: messagesEndpoint,
      log: false,
      failOnStatusCode: false // maybe there is no endpoint with logs
    })
  }

  // should we log the message before a request
  // in case it fails?
  Cypress.log({
    name: name || 'api',
    message: options.url,
    consoleProps() {
      return {
        request: options
      }
    }
  })

  let topMargin = '0';
  if (firstApiRequest) {
    container.innerHTML = ''
  }
  if (apiOptions.displayRequest) {
    if (firstApiRequest) {
      // remove existing content from the application frame
      firstApiRequest = false
      container.innerHTML = html`
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${pack['dependencies']['highlight.js']}/styles/vs.min.css">
        <style>
        .container { background-color: rgb(238, 238, 238); border-radius: 6px; padding: 30px 15px; text-align: center; }
          .cy-api {
            text-align: left;
          }
          .cy-api-request {
            font-weight: 600;
          }
          .cy-api-logs-messages {
            text-align: left;
            max-height: 25em;
            overflow-y: scroll;
            background-color: lightyellow;
            padding: 4px;
            border-radius: 4px;
          }
          .cy-api-response {
            text-align: left;
            margin-top: 1em;
          }
          .hljs {
            background: rgb(238, 238, 238);
          }
        </style>
      `
    } else {
      container.innerHTML += '<br><hr>\n'
      topMargin = '1em'
    }
  }

  if (apiOptions.displayRequest) {
    container.innerHTML +=
      // should we use custom class and insert class style?
      '<div class="cy-api">\n' +
      `<h1 class="cy-api-request" style="margin: ${topMargin} 0 1em">Cy-api: ${name || Cypress.currentTest.title}</h1>\n` +
      '<div>\n' +
      '<b>Request:</b>\n' +
      '<pre class="hljs">' +
      formatRequest(options) +
      '\n</pre></div>'
  }

  cy.request({
    ...options,
    log: false
  }).then(({ duration, body, status, headers, requestHeaders, statusText }) => {
    return printResponse(container, hasApiMessages, messagesEndpoint, normalizedTypes, normalizedNamespaces, apiOptions.displayRequest).then(({ messages }) => {
      return cy.wrap({ messages, duration, body, status, headers, requestHeaders, statusText }, { log: false })
    })
  }).then(({ messages, duration, body, status, headers, requestHeaders, statusText }) => {
    // render the response object
    // TODO render headers?
    if (apiOptions.displayRequest) {
      container.innerHTML +=
        '<div class="cy-api-response">\n' +
        `<b>Response: ${status} ${duration}ms</b>\n` +
        '<pre class="hljs">' +
        formatResponse(body, headers) +
        '\n</pre></div></div>'
    }

    // log the response
    Cypress.log({
      name: 'response',
      message: options.url,
      consoleProps() {
        return {
          type: typeof body,
          response: body
        }
      }
    })

    for (const type of normalizedTypes) {
      addOnClickFilter(type)
    }

    for (const namespace of normalizedNamespaces) {
      addOnClickFilter(namespace)
    }

    win.scrollTo(0, doc.body.scrollHeight)

    return {
      messages,
      // original response information
      duration,
      body,
      status,
      statusText,
      headers,
      requestHeaders
    }
  })
})


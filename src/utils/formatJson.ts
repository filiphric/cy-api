import hljs from 'highlight.js';

export const formatJSon = (jsonObject: object) => {
  return hljs.highlight(JSON.stringify(jsonObject, null, 4), { language: 'json' }).value
}
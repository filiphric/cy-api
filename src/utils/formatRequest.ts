import { formatJSon } from './formatJson'

export const formatRequest = (options: Partial<Cypress.RequestOptions>) => {
  const showCredentials = Cypress.env('API_SHOW_CREDENTIALS');
  const auth = options?.auth as { username?: string, password?: string }
  const hasPassword = auth?.password;
  if (!showCredentials && hasPassword) {
    return formatJSon({
      ...options,
      auth: {
        ...options.auth,
        password: '*****'
      }
    })
  }
  return formatJSon(options);
}
import '../styles/globals.css'
import 'react-datepicker/dist/react-datepicker.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp

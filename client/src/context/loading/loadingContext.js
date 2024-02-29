/* eslint-disable */
import { createContext } from 'react'


const LoadingContext = createContext({
  loadingCount: 0,
  showLoading: () => {},
  closeLoading: () => {}
})

export default LoadingContext;        
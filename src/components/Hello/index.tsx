import clsx from 'clsx'
import styles from './Hello.module.scss'

export const Hello = () => {
  return <h1 className={clsx(styles.root, styles.test)}>Hello React!</h1>
}

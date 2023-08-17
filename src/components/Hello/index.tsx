import clsx from 'clsx'
import styles from './Hello.module.scss'
import React from 'react'

export const Hello = () => {
  const [state, setState] = React.useState<boolean>(false)

  return (
    <>
      <div
        className={clsx(styles.root, { [styles.test]: state })}
        onClick={() => setState((prev) => !prev)}
        onKeyDown={() => setState((prev) => !prev)}
        role="button"
        tabIndex={0}
      >
        Hello React!
      </div>
    </>
  )
}

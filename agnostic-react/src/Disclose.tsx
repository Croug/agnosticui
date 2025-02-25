import { FC, ReactElement } from 'react';
import styles from './disclose.module.css';

export interface DiscloseParams {
  title: string;
  isOpen?: boolean;
  isBackground?: boolean;
  isBordered?: boolean;
}

export const Disclose: FC<DiscloseParams> = ({
  title,
  isOpen = false,
  isBackground = false,
  isBordered = false,
  children,
}): ReactElement => {
  const detailsClasses = [
    styles.disclose,
    isBackground ? styles.discloseBg : '',
    isBordered ? styles.discloseBorder : '',
  ]
    .filter((cl) => cl)
    .join(' ');

  return (
    <details className={detailsClasses} open={isOpen}>
      <summary className={styles.discloseTitle}>{title}</summary>
      <div className={styles.disclosePanel}>{children}</div>
    </details>
  );
};

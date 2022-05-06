import type { PageInfo } from '@lib/github';
import cn from 'classnames';
import { useRouter } from 'next/router';
import styles from './Pagination.module.css';

interface PaginationProps {
  pageInfo?: PageInfo;
  owner: string;
}

function Pagination({ pageInfo, owner }: PaginationProps) {
  const router = useRouter();

  if (!pageInfo) {
    return null;
  }

  const prevUrl = `/${owner}?before=${pageInfo.startCursor}`;
  const nextUrl = `/${owner}?after=${pageInfo.endCursor}`;

  const handlePreviousClick = () => {
    router.push(prevUrl, prevUrl, { shallow: true });
  };

  const handleNextClick = () => {
    router.push(nextUrl, nextUrl, { shallow: true });
  };

  return (
    <div className={styles.container}>
      <span className={styles.group}>
        <button
          type="button"
          disabled={!pageInfo.hasPreviousPage || !pageInfo.startCursor}
          onClick={handlePreviousClick}
          className={cn(styles.button, styles.buttonPrev)}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!pageInfo.hasNextPage || !pageInfo.endCursor}
          className={cn(styles.button, styles.buttonNext)}
        >
          Next
        </button>
      </span>
    </div>
  );
}

export default Pagination;
import React from 'react';
import PropTypes from 'prop-types';
import { useVirtual } from 'react-virtual';
import Book from '../book/Book';

const TabBooksContent = ({ books, action, actionLabel }) => {
	const parentRef = React.useRef();

	const rowVirtualizer = useVirtual({
		size: books.length,
		parentRef,
		estimateSize: React.useCallback(() => 260, []),
	});
	return (
		<div
			style={{
				maxHeight: '100%',
				minHeight: '0px',
				height: '100%',
			}}>
			<div
				ref={parentRef}
				style={{
					height: '100%',
					overflow: 'auto',
				}}>
				<div
					style={{
						height: `${rowVirtualizer.totalSize}px`,
						width: '100%',
						position: 'relative',
					}}>
					{rowVirtualizer.virtualItems.map((virtualRow) => (
						<div
							key={virtualRow.index}
							ref={virtualRow.measureRef}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: `${books[virtualRow.index]}px`,
								transform: `translateY(${virtualRow.start}px)`,
							}}>
							<Book book={books[virtualRow.index]} actionName={actionLabel} key={books[virtualRow.index].id} transfer={action} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default TabBooksContent;

TabBooksContent.propTypes = {
	books: PropTypes.arrayOf(PropTypes.object).isRequired,
	action: PropTypes.func.isRequired,
	actionLabel: PropTypes.string.isRequired,
	filterTags: PropTypes.arrayOf(PropTypes.string),
};

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useVirtual } from 'react-virtual';
import Book from '../book/Book';
import Context from '../../context';

const calcListHeight = (marginBottom) => document.documentElement.clientHeight - marginBottom;

const TabBooksContent = ({ books, action, actionLabel }) => {
	const { filterTags } = useContext(Context);
	const parentRef = React.useRef();

	const rowVirtualizer = useVirtual({
		size: books.length,
		parentRef,
	});

	return (
		<>
			<div
				ref={parentRef}
				style={{
					height: `${filterTags.length === 0 ? calcListHeight(100) : calcListHeight(175)}px`,
					width: '796px',
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
		</>
	);
};

export default TabBooksContent;

TabBooksContent.propTypes = {
	books: PropTypes.arrayOf(PropTypes.object).isRequired,
	action: PropTypes.func.isRequired,
	actionLabel: PropTypes.string.isRequired,
	filterTags: PropTypes.arrayOf(PropTypes.string),
};

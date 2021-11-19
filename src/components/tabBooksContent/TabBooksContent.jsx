import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Book from '../book/Book';
import Context from '../../context';
import { FixedSizeList as List } from 'react-window';

const TabBooksContent = ({ books, action, actionLabel }) => {
	const { filterTags } = useContext(Context);
	const booksToRender = books.filter((item) => item.tags.filter((tag) => filterTags.includes(tag)).length === filterTags.length);
	const itemHeight = 280;

	const Row = ({ index, style }) => (
		<div style={style}>
			<Book book={booksToRender[index]} actionName={actionLabel} key={booksToRender[index].id} transfer={action} />
		</div>
	);

	const calcListHeight = (marginBottom) => {
		if (booksToRender.length < Math.ceil(document.documentElement.clientHeight / itemHeight) && document.documentElement.clientHeight - marginBottom > booksToRender.length * itemHeight) {
			return booksToRender.length * itemHeight;
		} else {
			return document.documentElement.clientHeight - marginBottom;
		}
	};

	return (
		<List height={filterTags.length === 0 ? calcListHeight(100) : calcListHeight(175)} itemCount={booksToRender.length} itemSize={280} width={796}>
			{Row}
		</List>
	);
};

TabBooksContent.propTypes = {
	books: PropTypes.arrayOf(PropTypes.object).isRequired,
	action: PropTypes.func.isRequired,
	actionLabel: PropTypes.string.isRequired,
	filterTags: PropTypes.arrayOf(PropTypes.string),
};

export default TabBooksContent;

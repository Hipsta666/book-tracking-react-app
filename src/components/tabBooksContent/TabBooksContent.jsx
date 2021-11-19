import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Book from '../book/Book';
import Context from '../../context';

const TabBooksContent = ({ books, action, actionLabel }) => {
	const { filterTags } = useContext(Context);
	const booksToRender = books.filter((item) => item.tags.filter((tag) => filterTags.includes(tag)).length === filterTags.length);

	return (
		<div>
			{booksToRender.map((book) => {
				return <Book book={book} actionName={actionLabel} key={book.id} transfer={action} />;
			})}
		</div>
	);
};

TabBooksContent.propTypes = {
	books: PropTypes.arrayOf(PropTypes.object).isRequired,
	action: PropTypes.func.isRequired,
	actionLabel: PropTypes.string.isRequired,
	filterTags: PropTypes.arrayOf(PropTypes.string),
};

export default TabBooksContent;

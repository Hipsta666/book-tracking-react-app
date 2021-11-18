import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Book from '../book/Book';
import Context from '../../context';

const TabBooksContent = ({ books, action, actionLabel }) => {
	const { filterTags } = useContext(Context);
	console.log(books, typeof action, typeof actionLabel, typeof filterTags);
	const booksToRender = books.filter((item) => item.tags.filter((tag) => filterTags.includes(tag)).length === filterTags.length);

	return (
		<div>
			{booksToRender.map((item) => {
				return <Book book={item} actionName={actionLabel} key={item.id} transfer={action} />;
			})}
		</div>
	);
};

TabBooksContent.propTypes = {
	books: PropTypes.arrayOf(PropTypes.object).isRequired,
	action: PropTypes.func.isRequired,
	actionLabel: PropTypes.string.isRequired,
	filterTags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TabBooksContent;

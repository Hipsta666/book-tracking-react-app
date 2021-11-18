import React, { useContext } from 'react';
import Book from '../book/Book';
import Context from '../../context';

const TabBooksContent = ({ books, action, actionLabel }) => {
	const { filterTags } = useContext(Context);
	const booksToRender = books.filter((item) => item.tags.filter((tag) => filterTags.includes(tag)).length === filterTags.length);

	return (
		<div>
			{booksToRender.map((item) => {
				return <Book book={item} actionName={actionLabel} key={item.id} transfer={action} />;
			})}
		</div>
	);
};

export default TabBooksContent;

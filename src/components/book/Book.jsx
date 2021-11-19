import React from 'react';
import PropTypes from 'prop-types';
import Tags from '../tags/Tags';
import classes from './Book.module.css';

const Book = ({ book, actionName, transfer }) => {
	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<div className={classes.headerLeft}>
					<div className={classes.author}>{book.author}</div>
					<h2 className={classes.title}>{book.title}</h2>
				</div>
				<div className={classes.headerRight}>
					<div className={classes.actionName} onClick={() => transfer(book)}>
						<span>{actionName}</span>
						{'=>'}
					</div>
				</div>
			</div>
			<div className={classes.description}>
				<p>{book.description}</p>
			</div>
			<Tags tags={book.tags} />
		</div>
	);
};

Book.propTypes = {
	book: PropTypes.object.isRequired,
	actionName: PropTypes.string.isRequired,
	transfer: PropTypes.func.isRequired,
};

export default Book;

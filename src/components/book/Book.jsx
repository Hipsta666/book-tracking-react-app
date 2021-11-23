import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Tags from '../tags/Tags';
import classes from './Book.module.css';
import Context from '../../context';

const Book = ({ book, actionName, transfer }) => {
	const { booksAlreadyRead } = useContext(Context);

	return (
		<div className={classes.container}>
			<div className={booksAlreadyRead.includes(book.id) ? [classes.status, classes.statusActive].join(' ') : classes.status}>
				<span>Read</span>
			</div>
			<div className={classes.content}>
				<div>
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
			</div>
		</div>
	);
};

Book.propTypes = {
	book: PropTypes.object.isRequired,
	actionName: PropTypes.string.isRequired,
	transfer: PropTypes.func.isRequired,
};

export default Book;

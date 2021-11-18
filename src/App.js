import React, { useState, useEffect } from 'react';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Filter from './components/filterArea/Filter';
import BOOKS from './10-items.json';
import Context from './context';
import Localbase from 'localbase';
import TabBooksContent from './components/tabBooksContent/TabBooksContent';

function App() {
	const db = new Localbase('db');
	db.config.debug = false;

	const [filterTags, setFilterTags] = useState([]);

	const [books, setBooks] = useState({ toRead: [], inProgress: [], done: [] });

	const filterBooksByState = (items, state) => {
		const indices = items.filter((item) => item.state === state).map((item) => item.id);
		return BOOKS.items.filter((book) => {
			return indices.includes(book.id);
		});
	};

	const filterBooksToRead = (items) => {
		return BOOKS.items.filter((book) => ![...filterBooksByState(items, 'inProgress'), ...filterBooksByState(items, 'done')].map((item) => item.id).includes(book.id));
	};

	useEffect(() => {
		db.collection('books')
			.get()
			.then((items) => {
				setBooks({
					toRead: filterBooksToRead(items),
					inProgress: filterBooksByState(items, 'inProgress'),
					done: filterBooksByState(items, 'done'),
				});
			});
	}, []);

	const clearFilters = () => {
		setFilterTags([]);
	};

	const deleteFilterTag = (tag) => {
		setFilterTags(filterTags.filter((item) => item !== tag));
	};

	const toggleFilterTag = (tag) => {
		filterTags.includes(tag) ? deleteFilterTag(tag) : setFilterTags([...filterTags, tag]);
	};

	const transferToProgress = (book) => {
		db.collection('books').add({
			id: book.id,
			state: 'inProgress',
		});
		setBooks({ toRead: books.toRead.filter((item) => item.id !== book.id), inProgress: [...books.inProgress, book], done: [...books.done] });
	};

	const transferToDone = (book) => {
		db.collection('books').doc({ id: book.id }).update({
			state: 'done',
		});
		setBooks({ toRead: [...books.toRead], inProgress: books.inProgress.filter((item) => item.id !== book.id), done: [...books.done, book] });
	};

	const transferToRead = (book) => {
		db.collection('books').doc({ id: book.id }).delete();
		setBooks({ toRead: [...books.toRead, book], inProgress: [...books.inProgress], done: books.done.filter((item) => item.id !== book.id) });
	};

	return (
		<Context.Provider value={{ toggleFilterTag, deleteFilterTag, clearFilters, filterTags }}>
			<div className='App'>
				<Tabs className='tabs' selectedTabClassName='selectedTab'>
					<TabList className='tabList'>
						<Tab className='tab'>To read ({books.toRead.length})</Tab>
						<Tab className='tab'>In progress ({books.inProgress.length})</Tab>
						<Tab className='tab'>Done ({books.done.length})</Tab>
					</TabList>

					{filterTags.length ? <Filter tags={filterTags} /> : ''}

					<TabPanel className='tabPanel'>
						<TabBooksContent books={books.toRead} action={transferToProgress} actionLabel={'start reading'} />
					</TabPanel>

					<TabPanel className='tabPanel'>
						<TabBooksContent books={books.inProgress} action={transferToDone} actionLabel={'finish reading'} />
					</TabPanel>

					<TabPanel className='tabPanel'>
						<TabBooksContent books={books.done} action={transferToRead} actionLabel={'read over'} />
					</TabPanel>
				</Tabs>
			</div>
		</Context.Provider>
	);
}

export default App;

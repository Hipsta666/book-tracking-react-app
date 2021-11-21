import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Filter from './components/filterArea/Filter';
import json from './30000-items.json';
import Context from './context';
import Localbase from 'localbase';
import TabBooksContent from './components/tabBooksContent/TabBooksContent';
import { useSearchParams } from 'react-router-dom';

const BOOKS = json.items;
const db = new Localbase('db');
db.config.debug = false;

const getIndicesByState = (items, state) => items.filter((item) => item.state === state).map((item) => item.id);

function App() {
	const [filterTags, setFilterTags] = useState([]);
	const [booksStateStorage, setBooksStateStorage] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams({});
	const booksStateLength = booksStateStorage.length,
		booksInProgressLength = getIndicesByState(booksStateStorage, 'inProgress'),
		booksDoneLength = getIndicesByState(booksStateStorage, 'done');

	const getBooks = () => {
		db.collection('books')
			.get()
			.then((items) => {
				setBooksStateStorage(items);
			});
	};

	useEffect(() => {
		getBooks();
	}, [setBooksStateStorage]);

	useEffect(() => {
		filterTags.length === 0 ? setSearchParams({}) : setSearchParams({ tags: filterTags.join('%') });
	}, [filterTags, setSearchParams]);

	useEffect(() => {
		if (searchParams.get('tags')) {
			setFilterTags(searchParams.get('tags').split('%'));
		}
	}, [searchParams]);

	const clearFilterTags = () => setFilterTags([]);

	const deleteFilterTag = (tag) => setFilterTags(filterTags.filter((item) => item !== tag));

	const toggleFilterTag = (tag) => (filterTags.includes(tag) ? deleteFilterTag(tag) : setFilterTags([...filterTags, tag]));

	const getBookByTagFilter = (book) => book.tags.filter((tag) => filterTags.includes(tag)).length === filterTags.length;

	const transferToProgress = (book) => {
		db.collection('books').add({
			...book,
			state: 'inProgress',
		});
		setBooksStateStorage([...booksStateStorage, { ...book, state: 'inProgress' }]);
	};

	const transferToDone = (book) => {
		db.collection('books').doc({ id: book.id }).update({
			state: 'done',
		});
		setBooksStateStorage(booksStateStorage.map((item) => (item.id === book.id ? { ...item, state: 'done' } : item)));
	};

	const transferToRead = (book) => {
		db.collection('books').doc({ id: book.id }).delete();
		setBooksStateStorage(booksStateStorage.filter((item) => item.id !== book.id));
	};

	const getInProgressBooks = useMemo(() => {
		return booksStateStorage.filter((book) => book.state === 'inProgress' && getBookByTagFilter(book));
	}, [booksInProgressLength, filterTags, getBookByTagFilter]);

	const getDoneBooks = useMemo(() => {
		return booksStateStorage.filter((book) => book.state === 'done' && getBookByTagFilter(book));
	}, [booksDoneLength, filterTags, getBookByTagFilter]);

	const getToReadBooks = useMemo(() => {
		let booksToRead = [];
		const map = booksStateStorage.reduce((acc, book) => {
			acc[book.id] = 1;
			return acc;
		}, {});

		BOOKS.forEach((book) => {
			if (!map[book.id] && getBookByTagFilter(book)) booksToRead.push(book);
		});

		return booksToRead;
	}, [booksStateLength, getBookByTagFilter]);

	return (
		<Context.Provider value={{ toggleFilterTag, deleteFilterTag, clearFilterTags, filterTags }}>
			<div className='App'>
				<Tabs className='tabs' selectedTabClassName='selectedTab'>
					<TabList className='tabList'>
						<Tab className='tab'>To read ({BOOKS.length - booksStateStorage.length})</Tab>
						<Tab className='tab'>In progress ({getIndicesByState(booksStateStorage, 'inProgress').length})</Tab>
						<Tab className='tab'>Done ({getIndicesByState(booksStateStorage, 'done').length})</Tab>
					</TabList>

					{filterTags.length ? <Filter tags={filterTags} /> : ''}

					<TabPanel className='tabPanel'>
						<TabBooksContent books={getToReadBooks} action={transferToProgress} actionLabel={'start reading'} />
					</TabPanel>

					<TabPanel className='tabPanel'>
						<TabBooksContent books={getInProgressBooks} action={transferToDone} actionLabel={'finish reading'} />
					</TabPanel>

					<TabPanel className='tabPanel'>
						<TabBooksContent books={getDoneBooks} action={transferToRead} actionLabel={'read over'} />
					</TabPanel>
				</Tabs>
			</div>
		</Context.Provider>
	);
}

export default App;

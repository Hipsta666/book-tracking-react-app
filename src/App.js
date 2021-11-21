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
	const [booksState, setBooksState] = useState([]);
	let [searchParams, setSearchParams] = useSearchParams({});

	const getBooks = () => {
		db.collection('books')
			.get()
			.then((items) => {
				setBooksState(items);
			});
	};

	useEffect(() => {
		getBooks();
	}, [setBooksState]);

	useEffect(() => {
		filterTags.length === 0 ? setSearchParams({}) : setSearchParams({ tags: filterTags.join('%') });
	}, [filterTags]);

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
		setBooksState([...booksState, { ...book, state: 'inProgress' }]);
	};

	const transferToDone = (book) => {
		db.collection('books').doc({ id: book.id }).update({
			state: 'done',
		});
		setBooksState(booksState.map((item) => (item.id === book.id ? { ...item, state: 'done' } : item)));
	};

	const transferToRead = (book) => {
		db.collection('books').doc({ id: book.id }).delete();
		setBooksState(booksState.filter((item) => item.id !== book.id));
	};

	const getInProgressBooks = useMemo(() => {
		return booksState.filter((book) => book.state === 'inProgress' && getBookByTagFilter(book));
	}, [getIndicesByState(booksState, 'inProgress').length, filterTags]);

	const getDoneBooks = useMemo(() => {
		return booksState.filter((book) => book.state === 'done' && getBookByTagFilter(book));
	}, [getIndicesByState(booksState, 'done').length, filterTags]);

	const getToReadBooks = useMemo(() => {
		let booksToRead = [];
		const map = booksState.reduce((acc, book) => {
			acc[book.id] = 1;
			return acc;
		}, {});

		BOOKS.forEach((book) => {
			if (!map[book.id] && getBookByTagFilter(book)) booksToRead.push(book);
		});

		return booksToRead;
	}, [booksState.length, filterTags]);

	return (
		<Context.Provider value={{ toggleFilterTag, deleteFilterTag, clearFilterTags, filterTags }}>
			<div className='App'>
				<Tabs className='tabs' selectedTabClassName='selectedTab'>
					<TabList className='tabList'>
						<Tab className='tab'>To read ({BOOKS.length - booksState.length})</Tab>
						<Tab className='tab'>In progress ({getIndicesByState(booksState, 'inProgress').length})</Tab>
						<Tab className='tab'>Done ({getIndicesByState(booksState, 'done').length})</Tab>
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

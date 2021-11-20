import React, { useState, useEffect } from 'react';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Filter from './components/filterArea/Filter';
import BOOKs from './30000-items.json';
import Context from './context';
import Localbase from 'localbase';
import TabBooksContent from './components/tabBooksContent/TabBooksContent';
import { useSearchParams } from 'react-router-dom';

const BOOKS = BOOKs.items;

const getIndicesByState = (items, state) => {
	const indices = items.filter((item) => item.state === state).map((item) => item.id);
	return indices;
};

const getIndicesFromStorage = (items) => {
	return items.map((item) => item.id);
};

const getBooksByState = (items, state) => {
	return BOOKS.filter((book) => getIndicesByState(items, state).includes(book.id));
};

const getToReadBooks = (items) => {
	return BOOKS.filter((book) => !getIndicesFromStorage(items).includes(book.id));
};

const db = new Localbase('db');
db.config.debug = false;

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
	}, [db]);

	useEffect(() => {
		filterTags.length === 0 ? setSearchParams({}) : setSearchParams({ tags: filterTags.join('%') });
	}, [filterTags]);

	useEffect(() => {
		if (searchParams.get('tags')) {
			setFilterTags(searchParams.get('tags').split('%'));
		}
	}, [searchParams]);

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
		setBooksState([...booksState, { id: book.id, state: 'inProgress' }]);
	};

	const transferToDone = (book) => {
		db.collection('books').doc({ id: book.id }).update({
			state: 'done',
		});
		setBooksState(booksState.map((item) => (item.id === book.id ? { id: item.id, state: 'done' } : item)));
	};

	const transferToRead = (book) => {
		db.collection('books').doc({ id: book.id }).delete();
		setBooksState(booksState.filter((item) => item.id !== book.id));
	};

	return (
		<Context.Provider value={{ toggleFilterTag, deleteFilterTag, clearFilters, filterTags }}>
			<div className='App'>
				<Tabs className='tabs' selectedTabClassName='selectedTab'>
					<TabList className='tabList'>
						<Tab className='tab'>To read ({BOOKS.length - booksState.length})</Tab>
						<Tab className='tab'>In progress ({getIndicesByState(booksState, 'inProgress').length})</Tab>
						<Tab className='tab'>Done ({getIndicesByState(booksState, 'done').length})</Tab>
					</TabList>

					{filterTags.length ? <Filter tags={filterTags} /> : ''}

					<TabPanel className='tabPanel'>
						<TabBooksContent books={getToReadBooks(booksState)} action={transferToProgress} actionLabel={'start reading'} />
					</TabPanel>

					<TabPanel className='tabPanel'>
						<TabBooksContent books={getBooksByState(booksState, 'inProgress')} action={transferToDone} actionLabel={'finish reading'} />
					</TabPanel>

					<TabPanel className='tabPanel'>
						<TabBooksContent books={getBooksByState(booksState, 'done')} action={transferToRead} actionLabel={'read over'} />
					</TabPanel>
				</Tabs>
			</div>
		</Context.Provider>
	);
}

export default App;

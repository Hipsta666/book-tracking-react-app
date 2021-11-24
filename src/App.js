import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Localbase from 'localbase';
import Filter from './components/filterArea/Filter';
import Context from './context';
import TabBooksContent from './components/tabBooksContent/TabBooksContent';

const db = new Localbase('db');
db.config.debug = false;

const getIndicesByState = (items, state) => items.filter((item) => item.state === state).map((item) => item.id);

function App() {
	const [BOOKS, SetBOOKS] = useState([]);
	const [filterTags, setFilterTags] = useState([]);
	const [booksStateStorage, setBooksStateStorage] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams({});
	const [booksAlreadyRead, setBooksAlreadyRead] = useState([]);

	const getBooks = () => {
		fetch('./30000-items.json', {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		})
			.then((response) => response.json())
			.then((json) => {
				SetBOOKS(json.items);
			});
	};

	const getBooksFromDB = () => {
		db.collection('books')
			.get()
			.then((items) => {
				setBooksStateStorage(items);
				setBooksAlreadyRead(getIndicesByState(items, 'read'));
			});
	};

	useEffect(() => {
		getBooks();
		getBooksFromDB();
	}, []);

	useEffect(() => {
		if (filterTags.length === 0) {
			setSearchParams({});
		} else {
			setSearchParams({ tags: filterTags.join('%') });
		}
	}, [filterTags, setSearchParams]);

	useEffect(() => {
		if (searchParams.get('tags')) {
			setFilterTags(searchParams.get('tags').split('%'));
		}
	}, [searchParams]);

	const clearFilterTags = () => setFilterTags([]);

	const deleteFilterTag = (tag) => setFilterTags(filterTags.filter((item) => item !== tag));

	const toggleFilterTag = (tag) => (filterTags.includes(tag) ? deleteFilterTag(tag) : setFilterTags([...filterTags, tag]));

	const getBookByTagFilter = useCallback((book) => filterTags.filter((tag) => book.tags.includes(tag)).length === filterTags.length, [filterTags]);

	const transferToProgress = (book) => {
		db.collection('books').add({
			...book,
			state: 'inProgress',
		});
		db.collection('books')
			.doc({ id: book.id, state: 'read' })
			.get()
			.then((item) => {
				if (item) {
					db.collection('books').doc({ id: book.id, state: 'read' }).delete();
				}
			});

		setBooksStateStorage([...booksStateStorage.filter((item) => item.id !== book.id && item.state !== 'read'), { ...book, state: 'inProgress' }]);

		setBooksAlreadyRead([...booksAlreadyRead.filter((id) => id !== book.id)]);
	};

	const transferToDone = (book) => {
		db.collection('books').doc({ id: book.id }).delete();
		db.collection('books').add({
			...book,
			state: 'done',
		});

		setBooksStateStorage([...booksStateStorage.filter((item) => item.id !== book.id), { ...book, state: 'done' }]);
	};

	const transferToRead = (book) => {
		db.collection('books').doc({ id: book.id }).delete();
		db.collection('books').add({
			...book,
			state: 'read',
		});
		setBooksStateStorage([...booksStateStorage.filter((item) => item.id !== book.id), { ...book, state: 'read' }]);
		setBooksAlreadyRead([...booksAlreadyRead, book.id]);
	};

	const getInProgressBooks = useMemo(() => booksStateStorage.filter((book) => book.state === 'inProgress' && getBookByTagFilter(book)), [booksStateStorage, getBookByTagFilter]);

	const getDoneBooks = useMemo(() => booksStateStorage.filter((book) => book.state === 'done' && getBookByTagFilter(book)), [getBookByTagFilter, booksStateStorage]);

	const getToReadBooks = useMemo(() => {
		const booksToRead = [];
		const map = booksStateStorage.reduce((acc, book) => {
			acc[book.id] = book.state;
			return acc;
		}, {});
		BOOKS.forEach((book) => {
			if ((!map[book.id] && getBookByTagFilter(book)) || (map[book.id] === 'read' && getBookByTagFilter(book))) booksToRead.push(book);
		});

		return booksToRead;
	}, [booksStateStorage, getBookByTagFilter, BOOKS]);

	return (
		<Context.Provider
			value={{
				toggleFilterTag,
				deleteFilterTag,
				clearFilterTags,
				filterTags,
				booksAlreadyRead,
			}}>
			<div className='App'>
				<Tabs className='tabs' selectedTabClassName='selectedTab' selectedTabPanelClassName='tabPanel'>
					<TabList className='tabList'>
						<Tab className='tab'>
							<span>To read ({BOOKS.length - getIndicesByState(booksStateStorage, 'inProgress').length - getIndicesByState(booksStateStorage, 'done').length})</span>{' '}
						</Tab>
						<Tab className='tab'>
							<span>In progress ({getIndicesByState(booksStateStorage, 'inProgress').length})</span>{' '}
						</Tab>
						<Tab className='tab'>
							<span>Done ({getIndicesByState(booksStateStorage, 'done').length})</span>{' '}
						</Tab>
					</TabList>

					{filterTags.length ? <Filter tags={filterTags} /> : ''}

					<TabPanel>
						<TabBooksContent books={getToReadBooks} action={transferToProgress} actionLabel={'start reading'} />
					</TabPanel>

					<TabPanel>
						<TabBooksContent books={getInProgressBooks.reverse()} action={transferToDone} actionLabel={'finish reading'} />
					</TabPanel>

					<TabPanel>
						<TabBooksContent books={getDoneBooks.reverse()} action={transferToRead} actionLabel={'read over'} />
					</TabPanel>
				</Tabs>
			</div>
		</Context.Provider>
	);
}

export default App;

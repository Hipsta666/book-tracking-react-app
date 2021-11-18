import React, { useContext } from 'react';
import classes from './Filter.module.css';
import tagsClasses from '../tags/Tags.module.css';
import Context from '../../context';

const Filter = ({ tags }) => {
	const { clearFilters, deleteFilterTag } = useContext(Context);

	return (
		<div className={classes.container}>
			<span className={classes.title}>Filters by tags:</span>
			<div className={tagsClasses.tags}>
				{tags.map((tag, index) => {
					return (
						<div className={tagsClasses.tag} key={index} onClick={() => deleteFilterTag(tag)}>
							{tag}
						</div>
					);
				})}
				<div className={classes.clear} onClick={() => clearFilters()}>
					(clear)
				</div>
			</div>
		</div>
	);
};

export default Filter;

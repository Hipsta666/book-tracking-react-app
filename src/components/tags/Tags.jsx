import React, { useContext } from 'react';
import classes from './Tags.module.css';
import Context from '../../context';

const Tags = ({ tags }) => {
	const { toggleFilterTag, filterTags } = useContext(Context);

	return (
		<div className={classes.tags}>
			{tags.map((tag, id) => {
				return (
					<div className={filterTags.includes(tag) ? [classes.tag, classes.activeFilterTag].join(' ') : classes.tag} key={id} onClick={() => toggleFilterTag(tag)}>
						#{tag}
					</div>
				);
			})}
		</div>
	);
};

export default Tags;

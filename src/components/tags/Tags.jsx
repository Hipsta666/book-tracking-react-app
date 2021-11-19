import React, { useContext } from 'react';
import PropTypes from 'prop-types';
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

Tags.propTypes = {
	tags: PropTypes.arrayOf(PropTypes.string).isRequired,
	toggleFilterTag: PropTypes.func,
	filterTags: PropTypes.arrayOf(PropTypes.string),
};

export default Tags;

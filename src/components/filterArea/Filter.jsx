import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classes from './Filter.module.css';
import tagsClasses from '../tags/Tags.module.css';
import Context from '../../context';

const Filter = ({ tags }) => {
	const { clearFilterTags, deleteFilterTag } = useContext(Context);
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
				<div className={classes.clear} onClick={() => clearFilterTags()}>
					(clear)
				</div>
			</div>
		</div>
	);
};

Filter.propTypes = {
	tags: PropTypes.arrayOf(PropTypes.string).isRequired,
	clearFilters: PropTypes.func,
	deleteFilterTag: PropTypes.func,
};

export default Filter;

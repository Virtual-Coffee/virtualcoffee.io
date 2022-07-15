import { dateForDisplay } from '~/util/date';
import { useState, useEffect } from 'react';

type DateTimeProps = {
	date: string;
};

const DateTime = ({ date }: DateTimeProps) => {
	const [dateLocal, setDateLocal] = useState(dateForDisplay(date));
	const [converted, setConverted] = useState(false);
	useEffect(() => {
		setDateLocal(dateForDisplay(date));
		setConverted(true);
	}, []);

	// Not converted yet? Don't show anything.
	if (!converted) {
		return null;
	}

	// Show localized date
	return <time dateTime={date}> {dateLocal}</time>;
};

export default DateTime;

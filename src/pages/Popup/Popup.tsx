import React, { useEffect, useState } from 'react';
import './Popup.scss';
import { findByProperty, getTDCS } from './tdcs.service';
import { ReactComponent as CopyIcon } from '../../assets/img/copy.svg';

export const Popup = () => {
	const [fetchResults, setFetchResults] = useState(
		localStorage.getItem('fetchResults') ?? ''
	);
	const [output, setOutput] = useState(localStorage.getItem('output') ?? '');
	const [version, setVersion] = useState(
		localStorage.getItem('version') ?? '25.0'
	);
	const [key, setKey] = useState(localStorage.getItem('key') ?? '');
	const [portal, setPortal] = useState(
		(localStorage.getItem('portal') as any) ?? 'SMB'
	);
	const [env, setEnv] = useState(localStorage.getItem('env') ?? 'QA');
	const [error, setError] = useState<any>();
	const [enableCopyBtn] = useState(!!navigator.clipboard);
	const [timestamp, setTimestamp] = useState(
		localStorage.getItem('timestamp') ?? ''
	);

	useEffect(() => {
		window.localStorage.setItem('portal', portal);
	}, [portal]);

	useEffect(() => {
		window.localStorage.setItem('key', key);
	}, [key]);

	useEffect(() => {
		window.localStorage.setItem('version', version);
	}, [version]);

	useEffect(() => {
		window.localStorage.setItem('env', env);
	}, [env]);

	useEffect(() => {
		window.localStorage.setItem('fetchResults', fetchResults);
	}, [fetchResults]);

	useEffect(() => {
		window.localStorage.setItem('timestamp', timestamp);
	}, [timestamp]);

	useEffect(() => {
		window.localStorage.setItem('output', output);
	}, [output]);

	const fetchTdcs = () => {
		if (!version) {
			setError(`🛑 Missing Value For Version Field`);
			return;
		} else if (!/^[\d]{2,3}.?\d?$/.test(version)) {
			setError(`🛑 Version Field Is Not Valid`);
			return;
		} else {
			setError(null);
		}

		getTDCS(portal, version, env)
			.then((res) => {
				if (res.error) {
					setError(`🛑 ${res.msg}`);
				} else {
					setFetchResults(res.result);
					setOutput(res.result);
				}
				setKey('');
				setTimestamp(new Date().toLocaleString());
			})
			.catch((e) => {
				setError(`🛑 ${e}`);
			});
	};

	const filterTdcs = () => {
		if (!key) {
			setOutput(fetchResults);
		} else {
			let filtered = findByProperty(fetchResults, key);
			if (!filtered || filtered.length <= 0) {
				filtered = "Didn't find anything 😢";
			}
			setOutput(filtered);
		}
	};

	const clearFilter = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		event.stopPropagation();
		event.preventDefault();
		setOutput(fetchResults);
		setKey('');
	};

	const copyToClickBoard = () => {
		navigator.clipboard
			.writeText(output)
			.then(() => {
				console.log('Text copied to clipboard...');
			})
			.catch((err) => {
				console.log('Something went wrong', err);
			});
	};

	const bugReport = () => {
		window.open(
			'https://github.com/JCron245/TDCS-Viewer/issues/new?assignees=JCron245&labels=bug&template=bug_report.md&title=',
			'_blank'
		);
	};

	return (
		<div className="app">
			<main className="main">
				<div className="app-fetch-options">
					<label className="label version">
						<p>
							<span className="required" title="required">
								*
							</span>
							Version:
						</p>
						<input
							className="app-input"
							value={version}
							onChange={(event: any) => setVersion(event.target.value)}
						/>
					</label>
					<label className="label">
						<p>Portal:</p>
						<select
							className="app-select"
							value={portal}
							onChange={(event: any) => setPortal(event.target.value)}
						>
							<option value="RESI">RESI</option>
							<option value="SMB">SMB</option>
						</select>
					</label>
					<label className="label">
						<p>Environment:</p>
						<select
							value={env}
							onChange={(event: any) => setEnv(event.target.value)}
							className="app-select"
						>
							<option value="DEV">DEV</option>
							<option value="QA">QA</option>
							<option value="UAT">UAT</option>
							<option value="STAGE">STAGE</option>
							<option value="PROD">PROD</option>
						</select>
					</label>
					<p className="error-box">{error}</p>
					<div className="btn-container">
						<button
							type="button"
							className="app-btn"
							title="Fetch TDCS Config"
							onClick={fetchTdcs}
						>
							Get TDCS
						</button>
					</div>
				</div>
				<form
					className="app-filter-options"
					onSubmit={(event) => event.preventDefault()}
				>
					<label className="label">
						<p>Key:</p>
						<input
							className="app-input"
							value={key}
							onChange={(event: any) => setKey(event.target.value)}
						/>
					</label>
					<div className="btn-container">
						<button
							type="submit"
							className="app-btn"
							title="Filter Tdcs"
							onClick={filterTdcs}
						>
							Filter
						</button>
						<button
							type="button"
							className="app-btn app-btn-alt"
							title="Clear Filter"
							onClick={(event) => clearFilter(event)}
						>
							Clear
						</button>
					</div>
				</form>
			</main>

			<pre className="code">{output}</pre>

			{enableCopyBtn && (
				<button
					className="app-btn copy-icon-container"
					onClick={copyToClickBoard}
					title="Copy"
				>
					<CopyIcon className="copy-icon" />
				</button>
			)}

			<button
				className="app-btn bug-icon-container"
				onClick={bugReport}
				title="Report A Bug"
			>
				🐛
			</button>

			<span className="timestamp">Last Fetched: {timestamp}</span>
		</div>
	);
};

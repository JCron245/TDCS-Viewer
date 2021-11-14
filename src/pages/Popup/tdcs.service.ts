interface ApiCallData {
	apiKey?: "PORTALS" | "SMB"
	clientType?: string,
	appVersion?: string,
	timestamp?: string,
	deviceId: string,
	deviceType: string,
	osVersion: string,
}

const apiCallData: ApiCallData = {
	deviceId: 'Test',
	deviceType: 'Chrome Extension Testing Tool',
	osVersion: '1',
};

const apiUrls: { SMB: any, RESI: any } = {
	SMB: {
		DEV: process.env.SMB_DEV,
		QA: process.env.SMB_QA,
		UAT: process.env.SMB_UAT,
		STAGE: process.env.SMB_STAGE,
		PROD: process.env.SMB_PROD,
	},
	RESI: {
		DEV: process.env.RESI_DEV,
		QA: process.env.RESI_QA,
		UAT: process.env.RESI_UAT,
		STAGE: process.env.RESI_STAGE,
		PROD: process.env.RESI_PROD,
	}
}

export const findByProperty = (strObj: string, key: string): string => {
	return JSON.stringify(iterate(JSON.parse(strObj), key), null, 2)
}

export const iterate = (obj: any, key: string): any => {
	let result;
	for (let property in obj) {
		if (obj.hasOwnProperty(property)) {
			if (property === key) {
				return obj[key]; // returns the value
			} else if (typeof obj[property] === 'object') {
				// in case it is an object
				result = iterate(obj[property], key);

				if (typeof result !== 'undefined') {
					return result;
				}
			}
		}
	}
};

export const getTDCS = (portal: "RESI" | "SMB", version: string, env: string): Promise<string> => {
	apiCallData.apiKey = portal === 'RESI' ? "PORTALS" : "SMB";
	apiCallData.clientType = `ACCTSUPP-${portal}`;
	apiCallData.appVersion = `${version}`;
	apiCallData.timestamp = new Date().getTime().toString();

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(apiCallData),
	};

	return fetch(apiUrls[portal][env], requestOptions)
		.then((res) => res.json())
		.then(
			(result) => {
				let newOutput = result;
				return JSON.stringify(newOutput, null, 2);
			},
			(error) => {
				return error.message;
			}
		);
};

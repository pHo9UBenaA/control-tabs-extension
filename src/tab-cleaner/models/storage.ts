type Domain = string;

type ClearHistory = {
	id: number;
	// TODO: (x): x is ClearHistory => x !== undefined
	title: string | undefined;
	url: string | undefined;
};

type RemoveNewTab = boolean;

export { ClearHistory, Domain, RemoveNewTab };

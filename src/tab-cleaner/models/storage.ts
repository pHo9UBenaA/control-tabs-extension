/**
 * ドメイン
 * v0.1.1 から v0.2.0 にアップデートする際、ドメインの型が変更されました。
 *
 * @type {Domain}
 * @example 'google.com'
 * @example { uuid: 'c4b3d1c0-1f3b-11ec-9621-0242ac130002', name: 'google.com' }
 */
type Domain =
	| string
	| {
			/**
			 * uuid
			 *
			 * @type {string}
			 * @memberof Domain
			 * @example 'c4b3d1c0-1f3b-11ec-9621-0242ac130002'
			 */
			uuid: string;
			/**
			 * ドメイン名
			 *
			 * @type {string}
			 * @memberof Domain
			 * @example 'google.com'
			 */
			name: string;
			/**
			 * 履歴を保持するかどうか
			 *
			 * @type {boolean | undefined}
			 * @memberof Domain
			 * @example true
			 */
			// isKeepHistory?: boolean;
	  };

/**
 * クリア履歴
 *
 * @type {ClearHistory}
 * @example { id: 1, title: 'Google', url: 'https://www.google.com/' }
 */
type ClearHistory = {
	/**
	 * タブID
	 *
	 * @type {number}
	 * @memberof ClearHistory
	 * @example 1
	 */
	id: number;
	// TODO: (x): x is ClearHistory => x !== undefined
	/**
	 * タイトル
	 *
	 * @type {string}
	 * @memberof ClearHistory
	 * @example 'Google'
	 */
	title: string | undefined;
	/**
	 * URL
	 *
	 * @type {string}
	 * @memberof ClearHistory
	 * @example 'https://www.google.com/'
	 */
	url: string | undefined;
};

/**
 * 設定項目
 */
type Setting = {
	/**
	 * 新規タブを削除するかどうか
	 *
	 * @type {boolean}
	 * @memberof Setting
	 */
	enableAutoRemoveNewTab: boolean;
	/**
	 * クリア履歴の削除上限
	 *
	 * @type {number}
	 * @memberof Setting
	 */
	clearHistoriesLimit?: number;
	/**
	 * 登録外ドメインタブの一括削除
	 *
	 * @type {boolean}
	 * @memberof Setting
	 */
	removeOtherDomains?: boolean;
};

export { ClearHistory, Domain, Setting };

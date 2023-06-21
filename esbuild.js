const srcDirName = 'src';
const distDirName = 'dist';

// esbuildオプションのentryPointsとoutdirを作成
const path = require('path');
const glob = require('glob');

const srcDir = path.join(__dirname, srcDirName);
const distDir = path.join(__dirname, distDirName);

const entryPoints = glob.sync(`${srcDir}/*.ts`);
const outdir = distDir;

// copyプラグイン
const copyStaticFiles = require('esbuild-copy-static-files');
const copyAssets = copyStaticFiles({
	src: `./${srcDirName}/assets`,
	dest: `./${distDirName}`,
	dereference: true,
	errorOnExist: false,
});

// ビルド
const options = {
	entryPoints,
	outdir,
	outbase: `./${srcDirName}`,
	platform: 'browser',
	external: [],
	bundle: true,
	tsconfig: './tsconfig.json',
	plugins: [copyAssets],
};

const { build } = require('esbuild');
build(options).catch((err) => {
	process.stderr.write(err.stderr);
	process.exit(1);
});

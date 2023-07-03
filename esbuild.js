const srcDirName = 'src';
const distDirName = 'dist';

const path = require('path');
const glob = require('glob');

const srcDir = path.join(__dirname, srcDirName);
const distDir = path.join(__dirname, distDirName);

const directories = ['merge-window', 'tab-cleaner'];
const optionsArray = directories.map((dir) => {
	const entryPoints = glob.sync(`${srcDir}/${dir}/*.ts`);
	const outdir = `${distDir}/${dir}`;

	const copyStaticFiles = require('esbuild-copy-static-files');
	const copyAssets = copyStaticFiles({
		src: `./${srcDirName}/${dir}/assets`,
		dest: `./${distDirName}/${dir}`,
		dereference: true,
		errorOnExist: false,
	});

	const options = {
		entryPoints,
		outdir,
		minify: true,
		outbase: `./${srcDirName}/${dir}`,
		platform: 'browser',
		external: [],
		bundle: true,
		tsconfig: './tsconfig.json',
		plugins: [copyAssets],
	};

	return options;
});

const { build } = require('esbuild');
optionsArray.forEach((options) => {
	build(options).catch((err) => {
		process.stderr.write(err.stderr);
		process.exit(1);
	});
});

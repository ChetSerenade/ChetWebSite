import superEjs from 'super-ejs'
import path from 'path'
import fsExtra from 'fs-extra'
import changeCase from '@juln/change-case'

const logInfo = (...args: string[]): void => console.info('\x1B[33m', ...args, '\x1B[0m')
const logError = (...args: string[]): void => console.error('\x1B[31m', ...args, '\x1B[0m')

const updatedFiles: string[] = []
const compName: string = fetchCompName()
const displayName = `${changeCase(compName, 'upper-camel-case')}`
const __dirname: string = path.resolve()
const outputDir: string = path.resolve(__dirname, '../../src/components', compName)
const mainFilePath: string = path.join('../../src/components', compName, `${compName}.vue`)

const detectPublic = async (): Promise<void> => {
	/** 如果已经存在 */
	if (fsExtra.existsSync(outputDir)) {
		logError(`组件 ${compName}` + '\n' + `已存在${mainFilePath}`)
		return
	}

	try {
		await generate()
		logInfo('本次创建/修改的文件有：' + '\n' + '\n' + `${updatedFiles.join('\n')}` + '\n')
	} catch (error: unknown) {
		logError(`不好意思，组件[${compName}]创建失败了` + '\n' + `error: ${error}`)
		process.exit(0)
	}

	logInfo(`${displayName} 组件创建完成 🎉🎉🎉` + '\n')
}

detectPublic()

/** 检测组件名是否规范 */
function fetchCompName(): string {
	const input: string = process.argv[2]

	if (input === undefined) {
		logError(
			'\n' +
				'命令使用方法为: pnpm new <component-name>' +
				'\n' +
				'例如: pnpm new user-avatar' +
				'\n',
		)
		process.exit(0)
	}

	if (
		input.match(/^[a-zA-Z]+?[-|_|a-zA-Z0-9]*?$/) &&
		!input.endsWith('-') &&
		!input.endsWith('_')
	) {
		const compName: string = changeCase(input, 'param-case')
		return compName
	}

	logError('组件名不规范')
	process.exit(0)
}

async function generate(): Promise<[void, void, void]> {
	updatedFiles.push(
		`/src/components/${compName}/**`,
		'/src/components/index.ts',
		`/src/styles/common/_common.${compName}.scss`,
		'/src/styles/index.scss',
	)
	const catchError = async (callback: Function, info: string): Promise<void> => {
		try {
			await callback()
		} catch (error: unknown) {
			logError(info + '\n' + `error: ${error}`)
		}
	}
	return Promise.all([
		catchError(generateComponentDir, '🚧 组件源文件创建失败'),
		catchError(incrementStyle, '🚧 样式文件创建失败'),
		catchError(updateStyleEntry, '🚧 样式入口修改失败'),
	] as const)
}

async function generateComponentDir(): Promise<void> {
	const tplDir: string = path.resolve(__dirname, './template/component')

	/** 编译文件内容 */
	await superEjsGerenateDir(outputDir, tplDir)
}

/** 修改组件入口文件 */
// async function updateComponentEntry(): Promise<void> {
// 	const entryFilePath: string = path.resolve(__dirname, '/components.ts')
// 	let content: string = (await fsExtra.readFile(entryFilePath)).toString()

// 	content =
// 		content.slice(0, -1) +
// 		'\n' +
// 		'\n' +
// 		`export { F${displayName} } from './${compName}'` +
// 		'\n' +
// 		`export * from './${compName}'` +
// 		'\n'

// 	await fsExtra.writeFile(entryFilePath, content)
// }

/** 创建样式文件 */
async function incrementStyle(): Promise<void> {
	const outputDir: string = path.resolve(__dirname, '../../src/styles/common')
	const tplDir: string = path.resolve(__dirname, './template/style')

	/** 编译文件内容 */
	await superEjsGerenateDir(outputDir, tplDir)
}

/** 添加样式入口 */
async function updateStyleEntry(): Promise<void> {
	const entryFilePath: string = path.resolve(__dirname, '../../src/styles/index.scss')
	let content: string = (await fsExtra.readFile(entryFilePath)).toString()

	content = content.slice(0, -1) + '\n' + `@import './common/_common.${compName}.scss';` + '\n'

	await fsExtra.writeFile(entryFilePath, content)
}

async function superEjsGerenateDir(outputDir: string, tplDir: string): Promise<void> {
	return await superEjs.gerenateDir(
		outputDir,
		tplDir,
		{
			name: compName,
			displayName,
			changeCase,
		},
		{},
		{
			parseFilename: (original: string): string => {
				// eslint-disable-next-line no-useless-escape
				return original.replace(/(.*?)__name__([a-zA-Z0-9|\.]*?$)/, `$1${compName}$2`)
			},
		},
	)
}

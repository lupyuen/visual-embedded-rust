import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const tree = {
	'a': {
		'aa': {
			'aaa': {
				'aaaa': {
					'aaaaa': {
						'aaaaaa': {

						}
					}
				}
			}
		},
		'ab': {}
	},
	'b': {
		'ba': {},
		'bb': {}
	}
};
let nodes = {};

function getChildren(key: string): string[] {
	if (!key) {
		return Object.keys(tree);
	}
	let treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key: string): vscode.TreeItem {
	const treeElement = getTreeElement(key);
	return {
		label: <vscode.TreeItemLabel>{ label: key, highlights: key.length > 1 ? [[key.length - 2, key.length - 1]] : void 0},
		tooltip: `Tooltip for ${key}`,
		collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
	};
}

function getTreeElement(element): any {
	let parent = tree;
	for (let i = 0; i < element.length; i++) {
		parent = parent[element.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}

function getNode(key: string): Dependency {
	if (!nodes[key]) {
		nodes[key] = new Key(key);
	}
	return nodes[key];
}

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;

    getChildren(element?: Dependency): Thenable<Dependency[]> {
        const children = getChildren(element ? element.key : undefined)
            .map(key => getNode(key));
        return Promise.resolve(children);
    }

    getTreeItem(element: Dependency): vscode.TreeItem {
        const treeItem = getTreeItem(element.key);
        treeItem.id = element.key;
        return treeItem;
    }

    getParent(element: Dependency): vscode.ProviderResult<Dependency> {
        const parentKey = key.substring(0, key.length - 1);
        return parentKey ? new Key(parentKey) : void 0;
    }

	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    /*
        getTreeItem(element: Dependency): vscode.TreeItem {
            return element;
        }

        getChildren(element?: Dependency): Thenable<Dependency[]> {
            if (!this.workspaceRoot) {
                vscode.window.showInformationMessage('No dependency in empty workspace');
                return Promise.resolve([]);
            }

            if (element) {
                return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
            } else {
                const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
                if (this.pathExists(packageJsonPath)) {
                    return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
                } else {
                    vscode.window.showInformationMessage('Workspace has no package.json');
                    return Promise.resolve([]);
                }
            }

        }

        //  Given the path to package.json, read all its dependencies and devDependencies.
        private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
            if (this.pathExists(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

                const toDep = (moduleName: string, version: string): Dependency => {
                    if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
                        return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
                    } else {
                        return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
                            command: 'extension.openPackageOnNpm',
                            title: '',
                            arguments: [moduleName]
                        });
                    }
                };

                const deps = packageJson.dependencies
                    ? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
                    : [];
                const devDeps = packageJson.devDependencies
                    ? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
                    : [];
                return deps.concat(devDeps);
            } else {
                return [];
            }
        }

        private pathExists(p: string): boolean {
            try {
                fs.accessSync(p);
            } catch (err) {
                return false;
            }

            return true;
        }
    */
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return `${this.label}-${this.version}`;
	}

	get description(): string {
		return this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';

}
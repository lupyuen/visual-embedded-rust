import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

//  Tree of nodes
let tree: any = {
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

//  List of nodes indexed by name
let nodes: {[name: string]: Node} = {};

//  Each node of the tree
class Node extends vscode.TreeItem {
	constructor(
        public readonly key: string,
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
		light: 	path.join(__filename, '..', '..', 'resources', 'light', 'folder.svg'),
		dark: 	path.join(__filename, '..', '..', 'resources', 'dark',  'folder.svg')
	};

	contextValue = 'Node';
}

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

function getTreeElement(key: string): any {
	let parent = tree;
	for (let i = 0; i < key.length; i++) {
		parent = parent[key.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}

function getNode(key: string): Node {
	if (!nodes[key]) {
        const treeElement = getTreeElement(key);
        const collapsibleState = 
            treeElement && Object.keys(treeElement).length 
                ? vscode.TreeItemCollapsibleState.Collapsed 
                : vscode.TreeItemCollapsibleState.None;
        nodes[key] = new Node(key, key, "1", collapsibleState);
	}
	return nodes[key];
}

class DeclarationsProvider implements vscode.TreeDataProvider<Node> {

	private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> = new vscode.EventEmitter<Node | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;

    getChildren(element?: Node): Thenable<Node[]> {
        const children = getChildren(element ? element.key : "")
            .map(key => getNode(key));
        return Promise.resolve(children);
    }

    getTreeItem(element: Node): vscode.TreeItem {
        const treeItem = getNode(element.key);
        treeItem.id = element.key;
        return treeItem;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    constructor(private workspaceRoot: string) {}
}

//  Called when VSCode is activated
export function activate(context: vscode.ExtensionContext) {
	//  Create the Tree View.
	const provider = new DeclarationsProvider(vscode.workspace.rootPath || '');
	const treeView = vscode.window.createTreeView('visualEmbeddedRustDeclarations', {
		treeDataProvider: provider
	});

	//  Register the commands.
	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.refreshEntry', 
		() => provider.refresh());

	vscode.commands.registerCommand('extension.openPackageOnNpm', 
		moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));

	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.addEntry', 
		() => vscode.window.showInformationMessage(`Successfully called add entry.`));

	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.editEntry', 
		(node: Node) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));

	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.deleteEntry', 
		(node: Node) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));	
}
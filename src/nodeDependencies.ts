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

export class DepNodeProvider implements vscode.TreeDataProvider<Node> {

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

export class Node extends vscode.TreeItem {
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
		light: path.join(__filename, '..', '..', 'resources', 'light', 'Node.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'Node.svg')
	};

	contextValue = 'Node';
}
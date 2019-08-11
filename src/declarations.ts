import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

//  Tree of nodes
let tree: any = {
	"To Be Inferred": {
		"start_sensor_listener"          : [ ["sensor", "_"], ["sensor_type", "_"], ["poll_time", "_"] ],
	},
	"Mynewt API": {		
		"sensor::set_poll_rate_ms"          : [ ["devname", "&Strn"],       ["poll_rate", "u32"] ],
		"sensor::mgr_find_next_bydevname"   : [ ["devname", "&Strn"],       ["prev_cursor", "*mut sensor"] ],
		"sensor::register_listener"         : [ ["sensor", "*mut sensor"],  ["listener", "sensor_listener"] ],
		"new_sensor_listener"               : [ ["sl_sensor_type", "sensor_type_t"],     ["sl_func", "sensor_data_func"] ]	
	},
	a: {
		b: {
			c: 1
		}
	}
};

const pending_tree 	= tree[Object.keys(tree)[0]];
const known_tree 	= tree[Object.keys(tree)[1]];

//  List of nodes indexed by path e.g. `Mynewt API|sensor::set_poll_rate_ms|devname`
let nodes: {[path: string]: Node} = {};

//  Each node of the tree. `key` looks like `
class Node extends vscode.TreeItem {
	constructor(
        public readonly pathkey: string,
        public readonly key: string,
		public prefix: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(`${prefix}${key}`, collapsibleState);
	}

	set label(_: string) {}

	get label(): string {
		return `${this.prefix}${this.key}`;
	}

	get tooltip(): string {
		return `${this.prefix}${this.key}`;
	}

	get description(): string {
		return '';
	}

	get icon(): string {
		return (this.collapsibleState === vscode.TreeItemCollapsibleState.None)
			? 'string.svg'   //  Icon for no children
			: 'folder.svg';  //  Icon for children
	}

	iconPath = {
		light: 	path.join(__filename, '..', '..', 'resources', 'light', this.icon),
		dark: 	path.join(__filename, '..', '..', 'resources', 'dark',  this.icon)
	};

	contextValue = 'Node';
}

function getChildren(pathkey: string): string[] {
	//  Return the paths of the child nodes.
	if (!pathkey) {
		return Object.keys(tree);
	}
	let treeElement = getTreeElement(pathkey);
	if (treeElement) {
		//  Get the child keys.
		const childKeys = Object.keys(treeElement);
		console.log('getChildren: ' + pathkey + JSON.stringify(treeElement));
		//  Append the child keys to the parent path.
		return childKeys.map(key => pathkey + '|' + key);
	}
	return [];
}

function getTreeElement(pathkey: string): any {
	//  Return the subtree for the path e.g. `Mynewt API|sensor::set_poll_rate_ms|devname`
	//  console.log('getTreeElement ' + pathkey);
	let parent = tree;
	//  Split by `|` and walk the tree.
	let pathSplit = pathkey.split('|');
	for (;;) {
		let key = pathSplit.shift();
		if (key === undefined) { return null; }
		console.log('getTreeElement key=' + key + ', parent=' + JSON.stringify(parent));
		parent = parent[key];
		if (parent === undefined) { return null; }
		if (pathSplit.length === 0) { return parent; }
	}
	return null;
}

function getNode(pathkey: string): Node {
	if (!nodes[pathkey]) {
		//  Key is the last part of the path.
		let pathSplit = pathkey.split('|');
		let key = pathSplit[pathSplit.length - 1];
		let prefix = '';
        const treeElement = getTreeElement(pathkey);
        const collapsibleState = 
            treeElement && Object.keys(treeElement).length 
                ? vscode.TreeItemCollapsibleState.Collapsed 
				: vscode.TreeItemCollapsibleState.None;				
        nodes[pathkey] = new Node(pathkey, key, prefix, collapsibleState);
	}
	return nodes[pathkey];
}

class DeclarationsProvider implements vscode.TreeDataProvider<Node> {

	private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> = new vscode.EventEmitter<Node | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;

    getChildren(element?: Node): Thenable<Node[]> {
        const children = getChildren(element ? element.pathkey : "")
            .map(key => getNode(key));
        return Promise.resolve(children);
    }

    getTreeItem(element: Node): vscode.TreeItem {
        const treeItem = getNode(element.pathkey);
        treeItem.id = element.pathkey;
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
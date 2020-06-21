import * as VS from "vscode";
import * as Path from "path";

function Wrap_(Where:string):string
{
	const Quote:string="\"";
	return Quote+Where+Quote;
}
function Terminal_(Name:string):VS.Terminal
{
	const Terminal:undefined|VS.Terminal=VS.window.terminals.find((Temp:VS.Terminal)=>(Temp.name===Name));
	return ((Terminal)?(Terminal):(VS.window.createTerminal(Name)));
}
function Parse_():void
{
	const Work:undefined|VS.WorkspaceFolder[]=VS.workspace.workspaceFolders;

	if((Work)&&(Work.length>0.0))
	{
		VS.workspace.saveAll().then
		(
			()=>
			{
				const Extension:undefined|VS.Extension<any>=VS.extensions.getExtension("dlOuOlb.bulb-chain-language");

				if(Extension)
				{
					const Terminal:VS.Terminal=Terminal_("Bulb Chain");
					const Space:string=" ";
					let Command:string=Path.resolve(Extension.extensionPath,"outputs","bch.js");

					Command="node"+Space+Wrap_(Command)+Space+Wrap_(Work[0.0].uri.fsPath);

					Terminal.show();
					Terminal.sendText(Command,true);
				}
				else
				{VS.window.showErrorMessage("Bulb Chain: cannot find the bulb chain extension.");}
				return;
			},
			()=>
			{
				VS.window.showErrorMessage("Bulb Chain: failed to save workspace files.");
				return;
			}
		);
	}
	else
	{VS.window.showErrorMessage("Bulb Chain: cannot find any workspace.");}

	return;
}
export function activate(context:VS.ExtensionContext):void
{
	context.subscriptions.push(VS.commands.registerCommand("bulb.run",Parse_));
	return;
}
export function deactivate():void{return;}

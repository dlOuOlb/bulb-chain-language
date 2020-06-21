//#region "Module Imports"
import * as File from "fs-extra";
import * as Dir from "path";
//#endregion

//#region "Keyword Mapping"
enum Seal{None="?",Zone="[]",Flow="{}",Link="<>"}
enum Note{None="?",Just="-",Spin="~",Both="+",Eith="=",Dead="|",Live="$",Jump=":"}
enum Move{None="?",C=".",Up="..",Root="...",Into="/",Link="_"}

const Pair:{[Key:string]:string}={"[":"]","{":"}","<":">","]":"[","}":"{",">":"<"};
const SealMap:{[Key:string]:Seal}={"[]":Seal.Zone,"{}":Seal.Flow,"<>":Seal.Link};
const NoteMap:{[Key:string]:Note}={"-":Note.Just,"~":Note.Spin,"+":Note.Both,"=":Note.Eith,"|":Note.Dead,"$":Note.Live,":":Note.Jump};
const MoveMap:{[Key:string]:Move}={".":Move.C,"^":Move.Up,"%":Move.Root,"/":Move.Into};
//#endregion

//#region "Global Constants"
enum Word{Zone="Zone",Flow="Flow",Link="Link",Root="Root",Main="Main"}
enum Char{Empty="",Space=" ",Tab="\t",NewLine="\r\n",C=".",Up="^",Root="%",Wrong="?",Show="@",Hide="*",ZoneOpen="[",ZoneClose="]",FlowOpen="{",FlowClose="}",LinkOpen="<",LinkClose=">",Redefine=" :: ",Linking=" => "}
enum Cons{Erase="\x1B[1A\x1B[K",Reset="\x1b[0m",Dim="\x1b[2m",Green="\x1b[32m",Yello="\x1b[33m",Blue="\x1b[34m",Cyan="\x1b[36m"}
enum Lite{Flow="{#}",Link="<%>"}
enum Spec{Extension=".bch",Encoding="utf8",Log="log.txt"}
const PlayPeriod:number=100.0;
//#endregion

//#region "Prmal Syntax Tree"
class Tree
{
	public readonly Size:number;
	public readonly Show:boolean;
	public readonly Name?:string;
	public readonly Root?:Tree;
	public List?:Tree[];
	public readonly Seal?:Seal;
	public readonly Note?:Note;
	public readonly Move?:Move;

	private Parse_(Text:string[]):void
	{
		this.List=new Array<Tree>();

		while(Text.length>0.0)
		{
			const Leaf:Tree=new Tree(Text,this);

			this.List.push(Leaf);
			Text=Text.slice(Math.abs(Leaf.Size));
		}

		return;
	}
	public constructor(Text:string[],Root?:Tree)
	{
		if(Root)
		{
			this.Size=+1.0;
			this.Show=false;
			this.Root=Root;
		}
		else
		{
			this.Size=Text.length;
			this.Show=true;
			this.Name=Word.Root.toLowerCase();
			this.Seal=Seal.Zone;
			this.Parse_(Text);

			return;
		}

		switch(Text[0.0])
		{
		default:
			if(Tree.Check_Alnum_(Text[0.0]))
			{
				this.Name=Text[0.0];
				this.Move=Move.Link;
			}
			else
			{this.Size=-this.Size;}
			return;
		case Char.C:
		case Char.Up:
		case Char.Root:
		case Move.Into:
			this.Move=MoveMap[Text[0.0]];
			return;
		case Note.Just:
		case Note.Spin:
		case Note.Both:
		case Note.Eith:
		case Note.Dead:
		case Note.Live:
		case Note.Jump:
			this.Note=NoteMap[Text[0.0]];
			return;
		case Char.Show:
			{this.Show=true;}
		case Char.Hide:
			if(Text.length<4.0)
			{
				this.Size=-Text.length;
				return;
			}
			else if(Tree.Check_Alnum_(Text[1.0]))
			{
				if(Tree.Check_Brace_(Text[2.0]))
				{
					this.Size+=+2.0;
					this.Name=Text[1.0];
					Text=Text.slice(2.0);
				}
				else
				{
					this.Size=-Text.length;
					return;
				}
			}
			else
			{return;}
		case Char.ZoneOpen:
		case Char.FlowOpen:
		case Char.LinkOpen:
			{
				const Last:number=Tree.Where_Close_(Text);

				if(Last>0.0)
				{
					this.Size+=Last;
					this.Seal=SealMap[Text[0.0]+Text[Last]];

					Text=Text.slice(1.0,Last);
					this.Parse_(Text);
				}
				else
				{this.Size=-this.Size;}
			}
		}

		return;
	}

	private static Check_Alnum_(Text:string):boolean
	{
		return (Text.match(/\w+/)!==null);
	}
	private static Check_Brace_(Text:string):boolean
	{
		switch(Text)
		{
		case Char.ZoneOpen:
		case Char.FlowOpen:
		case Char.LinkOpen:
			return true;
		default:
			return false;
		}
	}
	private static Where_Close_(Text:string[]):number
	{
		const End:number=Text.length;
		let Stack:string[]=new Array<string>();
	
		for(let Idx:number=0.0;Idx<End;Idx++)
		{
			const Frag:string=Text[Idx];
	
			switch(Frag)
			{
			case Char.LinkClose:
			case Char.FlowClose:
			case Char.ZoneClose:
				if(Pair[Frag]===Stack.pop())
				{
					if(Stack.length>0.0)
					{break;}
					else
					{return Idx;}
				}
				else
				{return -1.0;}
			case Char.ZoneOpen:
			case Char.FlowOpen:
			case Char.LinkOpen:
				Stack.push(Frag);
			default:;
			}
		}
	
		return -1.0;
	}
}
//#endregion

//#region "Refined Syntax Tree"
interface Memo
{
	Flag:boolean;
	Text:string;
}
interface Peek
{
	readonly Show:boolean;
	readonly Name?:string;
	Check_Node_(Level:string):Memo;
	Check_Link_(Prefix:string):string;
}
class Bulb
{
	private readonly Rule:Note;
	private Turn:boolean=false;

	public constructor(Rule:Note){this.Rule=Rule;}
	public Check_Node_():Memo{return {Flag:this.Rule!==Note.None,Text:this.Rule};}
	public Play_(Wave:undefined|boolean):undefined|boolean
	{
		const Temp:boolean=this.Turn;

		if(Wave===undefined)
		{
			switch(this.Rule)
			{
			case Note.Dead:
			case Note.Live:
				return this.Turn;
			default:
				return undefined;
			}
		}
		else
		{
			switch(this.Rule)
			{
			case Note.Just:
				this.Turn=Wave;
				return Temp;
			case Note.Spin:
				this.Turn=!Wave;
				return Temp;
			case Note.Both:
				this.Turn=(Temp===Wave);
				return Temp;
			case Note.Eith:
				this.Turn=(Temp!==Wave);
				return Temp;
			case Note.Jump:
				this.Turn=Wave;
				return ((Temp===Wave)?(Temp):(undefined));
			case Note.Dead:
				this.Turn=Wave;
				return undefined;
			case Note.Live:
				this.Turn=!Wave;
				return undefined;
			default:
				return undefined;
			}
		}
	}
	public Show_():string{return (((this.Turn)?(Cons.Yello):(Cons.Blue))+this.Rule);}
}
class Fake implements Peek
{
	private Flag:boolean=false;
	public readonly Show:boolean=false;
	public readonly Name:string;
	public readonly Root:Zone;

	public constructor(Root:Zone,Name?:string)
	{
		this.Root=Root;
		if(Name)
		{this.Name=Name;}
		else
		{this.Name=Char.Wrong;}

		return;
	}
	public Check_Node_(Level:string):Memo{return {Flag:this.Flag,Text:Level+this.Name};}
	public Check_Link_():string{return this.Name;}
}
class Zone implements Peek
{
	private Flag:boolean=false;
	public readonly Show:boolean=false;
	public readonly Name:string=Char.Wrong;
	public readonly Root?:Zone;
	public readonly Leaf:Map<string,Fake|Zone|Flow|Link>=new Map<string,Fake|Zone|Flow|Link>();

	private Wrong_(Each:Tree):void
	{
		const Leaf:Fake=new Fake(this,Each.Name);

		this.Leaf.set(Leaf.Name,Leaf);

		return;
	}
	public Merge_(Twin:Zone):void
	{
		if(this.Show===Twin.Show)
		{}
		else
		{this.Flag=false;}

		Twin.Leaf.forEach(this.Merge_Each_,this);

		return;
	}
	private Merge_Each_(Value:Fake|Zone|Flow|Link,Key:string):void
	{
		const Leaf:undefined|Fake|Zone|Flow|Link=this.Leaf.get(Key);

		if(Leaf)
		{
			if(Leaf instanceof Fake)
			{}
			else if((Leaf instanceof Zone)&&(Value instanceof Zone))
			{Leaf.Merge_(Value);}
			else
			{this.Leaf.set(Key,new Fake(this,Key));}
		}
		else
		{this.Leaf.set(Key,Value);}

		return;
	}
	public constructor(Arch:Tree,Root?:Zone)
	{
		this.Root=Root;

		if(Arch.Size<0.0)
		{return;}
		else if(Arch.Seal===Seal.Zone)
		{this.Show=Arch.Show;}
		else
		{return;}

		if(Arch.Name)
		{this.Name=Arch.Name;}
		else
		{return;}

		if(Arch.List)
		{
			for(const Each of Arch.List)
			{
				switch(Each.Seal)
				{
				case Seal.Zone:
					{
						const Leaf:Zone=new Zone(Each,this);
						const Same:undefined|Fake|Zone|Flow|Link=this.Leaf.get(Leaf.Name);

						if(Same)
						{
							if(Same instanceof Zone)
							{Same.Merge_(Leaf);}
							else
							{this.Wrong_(Each);}
						}
						else
						{this.Leaf.set(Leaf.Name,Leaf);}
					}
					break;
				case Seal.Flow:
				case Seal.Link:
					{
						const Leaf:Flow|Link=(Each.Seal===Seal.Flow)?(new Flow(Each,this)):(new Link(Each,this));

						if(Leaf.Name)
						{
							if(this.Leaf.has(Leaf.Name))
							{this.Wrong_(Each);}
							else
							{this.Leaf.set(Leaf.Name,Leaf);}
						}
						else
						{this.Wrong_(Each);}
					}
					break;
				default:
					{this.Wrong_(Each);}
				}
			}
		}
		else
		{return;}

		this.Flag=true;
		return;
	}
	public Link_Zone_():boolean
	{
		let Flag:boolean=true;

		for(const Each of this.Leaf.values())
		{
			if((Each instanceof Zone)||(Each instanceof Link))
			{
				const Temp:boolean=Each.Link_Zone_();

				Flag=Flag&&Temp;
			}
			else
			{}
		}

		return Flag;
	}
	public Link_Flow_():boolean
	{
		let Flag:boolean=true;

		for(const Each of this.Leaf.values())
		{
			if((Each instanceof Zone)||(Each instanceof Flow))
			{
				const Temp:boolean=Each.Link_Flow_();

				Flag=Flag&&Temp;
			}
			else
			{}
		}

		return Flag;
	}
	public Check_Node_(Level:string):Memo
	{
		let Msg:Memo={Flag:this.Flag,Text:Char.Empty};

		if(this.Root)
		{
			Msg.Text=Level+((this.Show)?(Word.Zone.toUpperCase()):(Word.Zone.toLowerCase()))+Char.Space+this.Name+Char.NewLine;
			Level+=Char.Tab;
		}
		else
		{}

		for(const Each of this.Leaf.values())
		{
			const Tmp:Memo=Each.Check_Node_(Level);

			Msg.Flag=Msg.Flag&&Tmp.Flag;
			Msg.Text+=Tmp.Text;
		}
		
		return Msg;
	}
	public Check_Link_(Prefix:string):string
	{
		let Text:string=Char.Empty;

		if(this.Root)
		{
			Prefix+=this.Name;
			Prefix+=Move.Into;
		}
		else
		{}

		for(const Each of this.Leaf.values())
		{Text+=Each.Check_Link_(Prefix);}

		return Text;
	}
}
class Flow implements Peek
{
	private Flag:boolean=false;
	public readonly Show:boolean=false;
	public readonly Name?:string;
	public readonly Root:Zone|Flow;
	private List:(Bulb|Flow|Link)[]=[];

	public constructor(Arch:Tree,Root:Zone|Flow)
	{
		this.Root=Root;

		if(Arch.Size<0.0)
		{return;}
		else if((Root instanceof Zone)===(Arch.Name===undefined))
		{return;}
		else if(Arch.Seal===Seal.Flow)
		{
			this.Show=Arch.Show;
			this.Name=Arch.Name;
		}
		else
		{return;}

		if(Arch.List)
		{
			for(const Each of Arch.List)
			{
				switch(Each.Seal)
				{
				case Seal.Flow:
					this.List.push(new Flow(Each,this));
					break;
				case Seal.Link:
					this.List.push(new Link(Each,this));
					break;
				default:
					this.List.push(new Bulb((Each.Note)?(Each.Note):(Note.None)));
				}
			}
		}
		else
		{return;}

		this.Flag=true;

		return;
	}
	public Link_Flow_():boolean
	{
		let Flag:boolean=true;

		for(const Each of this.List)
		{
			if(Each instanceof Bulb)
			{}
			else
			{
				const Temp:boolean=Each.Link_Flow_();

				Flag=Flag&&Temp;
			}
		}

		return Flag;
	}
	public Check_Node_(Level:string):Memo
	{
		let Msg:Memo={Flag:this.Flag,Text:Char.Empty};

		if(this.Name)
		{Msg.Text=Level+((this.Show)?(Word.Flow.toUpperCase()):(Word.Flow.toLowerCase()))+Char.Space+this.Name;}
		else
		{}

		Level+=Char.Tab;
		Msg.Text+=Char.FlowOpen;
		for(const Value of this.List)
		{
			const Tmp:Memo=Value.Check_Node_(Level);

			Msg.Flag=Msg.Flag&&Tmp.Flag;
			Msg.Text+=Tmp.Text;
		}
		Msg.Text+=Char.FlowClose;

		if(this.Root instanceof Zone)
		{Msg.Text+=Char.NewLine}
		else
		{}

		return Msg;
	}
	public Check_Link_(Prefix:string):string
	{
		let Text:string=Char.Empty;

		Prefix+=(this.Name)?(this.Name):(Move.Link);
		Prefix+=Move.Into;

		for(const Each of this.List)
		{
			if(Each instanceof Bulb)
			{}
			else
			{Text+=Each.Check_Link_(Prefix);}
		}

		return Text;
	}
	public Play_(Wave:undefined|boolean,Mode:boolean):undefined|boolean
	{
		if(this.Flag)
		{
			const Iter:IterableIterator<Bulb|Flow|Link>=(Mode)?(this.List.slice().reverse().values()):(this.List.values());

			for(const Each of Iter)
			{
				if(Each instanceof Flow)
				{
					const Temp:undefined|boolean=Each.Play_(Wave,Mode);

					if(Temp===undefined)
					{
					}
					else if(Wave===undefined)
					{Wave=Temp;}
					else
					{Wave=(Wave!==Temp);}
				}
				else
				{Wave=Each.Play_(Wave,Mode);}
			}

			return Wave;
		}
		else
		{return undefined;}
	}
	public Show_():string
	{
		if(this.Flag)
		{
			if(this.Name)
			{
				let Show:string=Char.Empty;
	
				for(const Each of this.List)
				{Show+=Each.Show_();}
	
				return Show;
			}
			else
			{return Cons.Green+Lite.Flow;}
		}
		else
		{return Char.Wrong;}
	}
}
class Link implements Peek
{
	private Flag:boolean=false;
	public readonly Show:boolean=false;
	public readonly Name?:string;
	private readonly Root:Zone|Flow;
	private List:{Rule:Move,Name?:string}[]=[];
	private Port?:Zone|Flow;

	public constructor(Arch:Tree,Root:Zone|Flow)
	{
		this.Root=Root;

		if(Arch.Size<0.0)
		{return;}
		else if((Root instanceof Zone)===(Arch.Name===undefined))
		{return;}
		else if(Arch.Seal===Seal.Link)
		{
			this.Show=Arch.Show;
			this.Name=Arch.Name;
		}
		else
		{return;}

		if(Arch.List)
		{
			let Toggle:boolean=false;

			for(const Each of Arch.List)
			{
				if(Each.Size>0.0)
				{
					if(Each.Move)
					{
						if(Each.Move===Move.Into)
						{
							if(Toggle)
							{Toggle=!Toggle;}
							else
							{this.List.push({Rule:Move.None});}
						}
						else
						{
							if(Toggle)
							{this.List.push({Rule:Move.None});}
							else
							{
								Toggle=!Toggle;
								this.List.push({Rule:Each.Move,Name:Each.Name});
							}
						}
					}
					else
					{this.List.push({Rule:Move.None});}
				}
				else
				{this.List.push({Rule:Move.None});}
			}
		}
		else
		{return;}

		this.Flag=true;

		return;
	}
	public Link_Zone_():boolean
	{
		if((this.Flag)&&(this.Root instanceof Zone))
		{
			let Trip:Zone=this.Root;
			let Able:boolean=true;

			for(const Each of this.List)
			{
				switch(Each.Rule)
				{
				default:
					return false;
				case Move.Link:
					if(Each.Name)
					{
						const Leaf:undefined|Fake|Zone|Flow|Link=Trip.Leaf.get(Each.Name);

						if(Leaf instanceof Zone)
						{
							if(Able||Leaf.Show)
							{
								Able=false;
								Trip=Leaf;
								break;
							}
							else
							{return false;}
						}
						else
						{return false;}
					}
					else
					{return false;}
				case Move.Root:
					Able=false;
					while(Trip.Root)
					{Trip=Trip.Root;}
					break;
				case Move.Up:
					Able=false;
					if(Trip.Root)
					{Trip=Trip.Root;}
					else
					{return false;}
				case Move.C:;
				}
			}

			this.Port=Trip;
			return true;
		}
		else
		{return false;}
	}
	public Link_Flow_():boolean
	{
		if((this.Flag)&&(this.Root instanceof Flow))
		{
			let Temp:Flow=this.Root;
			let Trip:Zone;
			let Count:number=0.0;
			let Able:boolean=true;

			while(Temp.Root instanceof Flow)
			{Temp=Temp.Root;}
			Trip=Temp.Root;

			for(const Each of this.List)
			{
				Count+=1.0;

				switch(Each.Rule)
				{
				default:
					return false;
				case Move.Link:
					if(Each.Name)
					{
						const Leaf:undefined|Fake|Zone|Flow|Link=Trip.Leaf.get(Each.Name);

						if(Leaf instanceof Zone)
						{
							if(Able||Leaf.Show)
							{
								Able=false;
								Trip=Leaf;
								break;
							}
							else
							{return false;}
						}
						else if(Leaf instanceof Flow)
						{
							if(Count<this.List.length)
							{return false;}
							else if(Able||Leaf.Show)
							{
								this.Port=Leaf;
								return true;
							}
							else
							{return false;}
						}
						else if(Leaf instanceof Link)
						{
							if(Leaf.Port instanceof Zone)
							{
								if(Able||Leaf.Show)
								{
									Able=false;
									Trip=Leaf.Port;
									break;
								}
								else
								{return false;}
							}
							else
							{return false;}
						}
						else
						{return false;}
					}
					else
					{return false;}
				case Move.Root:
					Able=false;
					while(Trip.Root)
					{Trip=Trip.Root;}
					break;
				case Move.Up:
					Able=false;
					if(Trip.Root)
					{Trip=Trip.Root;}
					else
					{return false;}
				case Move.C:;
				}
			}
		}
		else
		{}

		return false;
	}
	public Check_Node_(Level:string):Memo
	{
		let Msg:Memo={Flag:this.Flag,Text:Char.Empty};

		if(this.Name)
		{Msg.Text=Level+((this.Show)?(Word.Link.toUpperCase()):(Word.Link.toLowerCase()))+Char.Space+this.Name;}
		else
		{}

		if(this.List.length)
		{
			Msg.Text+=Char.LinkOpen;
			for(const Value of this.List)
			{Msg.Text+=((Value.Name)?(Value.Name):(Value.Rule))+Move.Into;}
			Msg.Text=Msg.Text.slice(0.0,Msg.Text.length-1.0)+Char.LinkClose;
		}
		else
		{Msg.Text+=Seal.Link;}

		if(this.Root instanceof Zone)
		{Msg.Text+=Char.NewLine;}
		else
		{}

		return Msg;
	}
	public Check_Link_(Prefix:string):string
	{
		if(this.Port)
		{
			let Trip:Zone|Flow=this.Port;
			let Name:string=((this.Name)?(this.Name+Char.Redefine):(Char.Hide+Char.Linking));
			let Msg:string=Char.Empty;

			while(Trip.Root)
			{
				Msg=((Trip.Name)?(Trip.Name):(Char.Hide))+Move.Into+Msg;
				Trip=Trip.Root;
			}
			Name+=Msg;

			return (Prefix+Name+Char.NewLine);
		}
		else
		{return (Prefix+((this.Name)?(this.Name):(Char.Wrong)));}
	}
	public Play_(Wave:undefined|boolean,Mode:boolean):undefined|boolean
	{
		if((this.Flag)&&(this.Port instanceof Flow))
		{return this.Port.Play_(Wave,Mode);}
		else
		{return undefined;}
	}
	public Show_():string
	{
		if(this.Flag)
		{return Cons.Green+Lite.Link;}
		else
		{return Char.Wrong;}
	}
}
//#endregion

//#region "Syntax Tree Parsing"
function Filt_(Text:string):string[]
{
	Text=Text.replace(/\([^\)]*\)/gm,"");
	Text=Text.replace(/\s*/gm,"");
	Text=Text.replace(/(\.{4,})|([\%\^]+)/gm,"\?");
	Text=Text.replace(/\.{3}/gm,"%");
	Text=Text.replace(/\.{2}/gm,"^");

	return Text.split(/(?<=\W)|(?=\W)/gm);
}
function Into_Zone_(Text:string):Zone
{
	return new Zone(new Tree(Filt_(Text)));
}
function Fuse_Zone_(List:Zone[],Path:string):undefined|Zone
{
	const Fail:string="zone generation failed";
	let Unit:undefined|Zone=List.pop();
	
	if(Unit)
	{
		const Check1:string="Check 1... ";
		const Check2:string="Check 2... ";
		const Check3:string="Check 3... ";
		const Okay:string="Okay.";
		const Nope:string="Nope.";
		let Msg:Memo;

		while(List.length)
		{
			const Temp:undefined|Zone=List.pop();

			if(Temp)
			{Unit.Merge_(Temp);}
			else
			{console.error(Fail);}
		}

		console.log(Check1);
		Msg=Unit.Check_Node_(Char.Empty);
		Msg.Text+=Char.NewLine;
		if(Msg.Flag)
		{console.log(Cons.Erase+Check1+Okay);}
		else
		{
			console.error(Cons.Erase+Check1+Nope);
			File.writeFileSync(Path,Msg.Text,{encoding:Spec.Encoding});
			return undefined;
		}

		console.log(Cons.Erase+Check2);
		if(Unit.Link_Zone_())
		{console.log(Cons.Erase+Check2+Okay);}
		else
		{
			console.error(Cons.Erase+Check2+Nope);
			Msg.Text+=Unit.Check_Link_(Char.Empty)+Char.NewLine;
			File.writeFileSync(Path,Msg.Text,{encoding:Spec.Encoding});
			return undefined;
		}

		console.log(Cons.Erase+Check3);
		if(Unit.Link_Flow_())
		{console.log(Cons.Erase+Check3+Okay);}
		else
		{
			console.error(Cons.Erase+Check3+Nope);
			Msg.Text+=Unit.Check_Link_(Char.Empty)+Char.NewLine;
			File.writeFileSync(Path,Msg.Text,{encoding:Spec.Encoding});
			return undefined;
		}

		Msg.Text+=Unit.Check_Link_(Char.Empty)+Char.NewLine;
		File.writeFileSync(Path,Msg.Text,{encoding:Spec.Encoding});
	}
	else
	{console.error(Fail);}

	return Unit;
}
function Path_List_(Path:string):Zone[]
{
	if(File.pathExistsSync(Path))
	{
		const Stat:File.Stats=File.lstatSync(Path);
		let ZoneList:Zone[]=[];

		if(Stat.isDirectory())
		{
			for(const Each of File.readdirSync(Path))
			{ZoneList=ZoneList.concat(Path_List_(Dir.resolve(Path,Each)));}
		}
		else if(Stat.isFile()&&Path.endsWith(Spec.Extension))
		{
			console.log(Path);
			ZoneList.push(Into_Zone_(File.readFileSync(Path,{encoding:Spec.Encoding})));
		}
		else
		{}

		return ZoneList;
	}
	else
	{throw new Error("File: cannot find "+Path);}
}
//#endregion

//#region "Console I/O Handling"
let Global:{I:boolean,O:boolean,M:boolean}={I:false,O:false,M:false};
function Global_Listen_(Key:string):void
{
	if((Key>"\u001F")&&(Key<"\u007F"))
	{
		if(Key>"\u0040")
		{Global.M=!(Global.M);}
		else
		{Global.I=!(Global.I);}
	}
	else
	{process.exit();}

	return;
}
function Global_Update_(Main:Flow):void
{
	const Temp:undefined|boolean=Main.Play_(Global.I,Global.M);
	let Msg:string=Cons.Erase;

	if(Temp===undefined)
	{}
	else
	{Global.O=Temp;}

	Msg+=((Global.M)?(Global.O):(Global.I))?(Cons.Yello):(Cons.Blue);
	Msg+=Char.FlowOpen;

	Msg+=Main.Show_();

	Msg+=((Global.M)?(Global.I):(Global.O))?(Cons.Yello):(Cons.Blue);
	Msg+=Char.FlowClose;

	Msg+=Cons.Reset;
	console.log(Msg);

	return;
}
//#endregion

//#region "Main Program"
function Main_(Path:string):void
{
	const ZoneList:Zone[]=Path_List_(Path);
	const LogWhere:string=Dir.resolve(Path,Spec.Log);
	const UnitZone:undefined|Zone=Fuse_Zone_(ZoneList,LogWhere);

	if(UnitZone)
	{
		const Main:undefined|Fake|Zone|Flow|Link=UnitZone.Leaf.get(Word.Main);

		if(Main instanceof Flow)
		{
			if(process.stdin.setRawMode)
			{process.stdin.setRawMode(true);}
			else
			{console.warn("Exec: cannot find process.stdin.setRawMode");}
			process.stdin.resume();
			process.stdin.on("data",Global_Listen_);
			setInterval(Global_Update_,PlayPeriod,Main);
		}
		else
		{console.error("Flow: cannot find "+Word.Main);}
	}
	else
	{console.error("Check the log "+LogWhere);}

	return;
}

if(process.argv.length===3.0)
{Main_(process.argv[2.0]);}
else
{console.error("Usage: node bulb.js WorkspaceFolder");}
//#endregion

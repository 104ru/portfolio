import { useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export default function SkinSwitcher(){
 const [skin,setSkin]=useState(()=>localStorage.getItem('loomik-skin')||'default');
 useEffect(()=>{document.documentElement.dataset.theme=skin;localStorage.setItem('loomik-skin',skin)},[skin]);
 return <DropdownMenu><DropdownMenuTrigger asChild><button title="Switch skin" aria-label="Switch skin" className="p-1.5 text-muted-foreground hover:bg-muted rounded"><Palette size={16}/></button></DropdownMenuTrigger><DropdownMenuContent>{['default','sand','editorial','aurora','midnight','lime','crimson'].map(theme=><DropdownMenuItem key={theme} onClick={()=>setSkin(theme)} className="capitalize justify-between">{theme}{skin===theme&&<Check size={14}/>}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;
}

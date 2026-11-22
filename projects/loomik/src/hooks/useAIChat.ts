import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { richAnswer, type RichAnswer } from '@/lib/richAnswers';
interface Message extends Omit<RichAnswer,'text'> { role:'user'|'assistant'; content:string; }
export function useAIChat() {
  const location=useLocation();
  const dealId=Number(new URLSearchParams(location.search).get('deal'))||undefined;
  const key=`loomik-sidebar-chat-${dealId??'pipeline'}`;
  const [messages,setMessages]=useState<Message[]>(()=>{try{return JSON.parse(sessionStorage.getItem(key)||'[]')}catch{return []}});
  useEffect(()=>{try{setMessages(JSON.parse(sessionStorage.getItem(key)||'[]'))}catch{setMessages([])}},[key]);
  const save=useCallback((next:Message[])=>{setMessages(next);sessionStorage.setItem(key,JSON.stringify(next));},[key]);
  const sendMessage=useCallback((input:string)=>{
    if(!input.trim())return;
    const previous=[...messages].reverse().find(m=>m.dataset)?.dataset;
    const {text,...rich}=richAnswer(input,dealId,previous);
    save([...messages,{role:'user',content:input},{role:'assistant',content:text,...rich}]);
  },[messages,dealId,save]);
  const appendReply=useCallback((content:string)=>save([...messages,{role:'assistant',content}]),[messages,save]);
  return {messages,isLoading:false,error:null,sendMessage,appendReply,cancelRequest:()=>{},clearMessages:()=>save([])};
}

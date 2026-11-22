export const DEFAULT_COLUMNS=[29,44,27];
export const COLUMN_STORAGE_KEY='experimental-loomik-column-widths';
export function validColumns(value:unknown):value is number[] {
 return Array.isArray(value)&&value.length===3&&value.every(n=>typeof n==='number'&&Number.isFinite(n))&&Math.abs(value.reduce((n,v)=>n+v,0)-100)<.1&&value[0]>=19&&value[0]<=55&&value[1]>=25&&(Math.abs(value[2]-4)<.1||value[2]>=19&&value[2]<=50);
}
export function loadColumns():number[]{try{const value=JSON.parse(localStorage.getItem(COLUMN_STORAGE_KEY)||'null');return validColumns(value)?value:[...DEFAULT_COLUMNS]}catch{return [...DEFAULT_COLUMNS]}}
export function saveColumns(value:number[]){if(validColumns(value))try{localStorage.setItem(COLUMN_STORAGE_KEY,JSON.stringify(value))}catch{/* Resizing remains available without storage. */}}

/* New schematic wireframes for the three Dwellers journeys. */
const wfRobot = (x=100,y=157,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-31 27Q-47-25 0-40Q47-25 31 27Z"/><circle cx="-12" cy="-8" r="9"/><circle cx="12" cy="-8" r="9"/><path d="M-4-40v-18m-6 0h12M-31 0h-16m78 0h16M-15 28v19m30-19v19m-38 0h16m14 0h16"/><path d="M-9 12h18"/></g>`;
const wfRect=(x,y,w,h,rx=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const wfNav=`<path d="M20 51h160"/><circle cx="42" cy="30" r="10"/><rect x="90" y="20" width="20" height="20" rx="3"/><circle cx="158" cy="30" r="10"/><path d="m158 30 7-7"/>`;
const wfMap=`<path class="wf-street" d="M12 102h176M12 172h176M12 244h176M55 60v244M145 60v244"/><path d="M80 97h47v173H80Z" class="wf-park"/><circle cx="101" cy="209" r="50" stroke-dasharray="4 4"/><path d="m101 202-7 17 7-4 7 4Z" class="wf-fill"/>`;
const wfScenes={
 cabinet: `${wfNav}${wfRect(14,65,172,231)}<path d="M100 65v231M14 181h172"/>${wfRobot(57,124,.55)}${wfRobot(143,124,.55)}<circle cx="57" cy="240" r="21"/><path d="M57 229v22m-11-11h22"/>${wfRect(110,194,65,89)}<path d="M165 231v18"/>`,
 builder:`<path d="m23 24 12 12m0-12L23 36m129-7 8 8 17-19"/>${wfRobot(100,148,1.12)}<path d="M14 228h172M14 252h172"/><circle cx="100" cy="236" r="5"/>${[30,58,86,114,142,170].map(x=>`<circle cx="${x}" cy="274" r="9"/>`).join('')}${[31,76,121,166].map(x=>wfRect(x-13,300,26,25)).join('')}`,
 release:`<path d="m26 25-8 8 8 8"/>${wfMap}${wfRobot(100,150,.6)}${wfRect(28,118,144,116,8)}<text x="100" y="148">Release here?</text><circle cx="65" cy="190" r="16"/><path d="m58 183 14 14m0-14-14 14"/><circle cx="137" cy="190" r="16"/><path d="m129 190 6 6 12-14"/>`,
 nearby:`${wfNav}${wfMap}${wfRobot(96,151,.48)}${wfRobot(158,88,.32)}${wfRect(12,267,176,78,10)}<path d="M86 278h28M23 314h154"/><text x="80" y="301">Nearby</text>`,
 camera:`<path d="m21 22 12 12m0-12L21 34"/>${wfRect(16,62,168,168,6)}<path d="m16 203 46-49 46 25 37-56 39 49"/>${wfRobot(105,169,.65)}<circle cx="100" cy="287" r="25"/><circle cx="100" cy="287" r="17"/><text x="100" y="252">1.0×</text>`,
 finish:`<path d="m26 25-8 8 8 8"/>${wfRect(20,65,160,160,2)}${wfRect(26,71,148,148,2)}${wfRobot(100,154,.8)}${[40,80,120,160].map(x=>wfRect(x-14,250,28,28)).join('')}<text x="100" y="309">Frame or sticker</text>`,
 publish:`<path d="m26 25-8 8 8 8"/>${wfRect(20,64,160,182,1)}${wfRect(29,73,142,143,1)}${wfRobot(100,155,.72)}<circle cx="100" cy="294" r="23"/><path d="m87 296 28-13-12 27-4-11Z"/>`,
 feed:`${wfNav}${wfRect(21,69,158,183,3)}${wfRect(29,77,142,132,2)}${wfRobot(100,155,.66)}<path d="M33 225h74m-74 12h45M141 231c-17-14-5-24 0-14 5-10 17 0 0 14Z"/>${wfRect(21,269,158,62,3)}`,
 detail:`<path d="m26 25-8 8 8 8"/>${wfRect(16,67,168,168,3)}${wfRobot(100,166,.85)}<path d="M22 254h105m-105 15h70M155 264c-17-14-5-24 0-14 5-10 17 0 0 14Z"/><text x="100" y="311">Photographer · Creator</text>`,
 dwellerfeed:`<path d="m26 25-8 8 8 8"/>${wfRobot(100,108,.55)}<text x="100" y="164">Dweller feed</text>${[21,105].map(x=>[185,263].map(y=>wfRect(x,y,74,67,1)).join('')).join('')}`
};
const wfFlows={
 creator:{title:'Create → save → release',screens:[['Cabinet','cabinet','Choose an empty slot','Start a new creation or return to an existing Dweller.'],['Builder','builder','Assemble and save','Choose parts, fit optional arms, add eyes, switch it on, and save it to the cabinet.'],['Release','release','Confirm the location','A saved Dweller is assigned a place. Cancel returns without releasing it.'],['In the world','nearby','Discoverable on the map','The released Dweller can now be found by hunters. Returning to its place does not release another copy.']]},
 hunter:{title:'Discover → photograph → finish → publish',screens:[['Nearby','nearby','Approach a Dweller','Choose a nearby character. Enter the catch radius before opening an encounter.'],['AR camera','camera','Compose the photograph','Frame the Dweller in its surroundings, adjust its composition, and capture a photograph.'],['Photo effects','finish','Choose a treatment','Apply optional photo effects and a frame or sticker. Keep the draft when going back.'],['Preview','publish','Confirm publication','Review the photograph, then confirm Publish. A published encounter appears in the feed.']]},
 spectator:{title:'Browse → open → appreciate → follow',screens:[['Feed','feed','Browse encounters','See photographs of Dwellers made by different hunters.'],['Photograph','detail','Open a photograph','See the image and its photographer and creator attribution.'],['Appreciation','detail','Like or comment','Respond to the photograph through the social interactions in the original game concept.'],['Dweller feed','dwellerfeed','Follow the same creature','Explore photographs of this Dweller from other hunters.']]}
};
function drawWireflow(key){
 const flow=wfFlows[key];
 document.querySelector('#wireflow-panel').setAttribute('aria-labelledby',`wf-${key}`);
 document.querySelector('#wireflow-panel').innerHTML=`<p class="flow-route">${flow.title}</p><div class="wireflow-screens">${flow.screens.map(([title,scene,action,description],i)=>`<figure class="wireframe-step"><div class="wireframe-number">0${i+1}</div><svg class="wireframe-phone" viewBox="0 0 200 365" role="img" aria-label="${title} wireframe"><rect class="wf-paper" x="1" y="1" width="198" height="363" rx="19"/><path d="M76 10h48"/>${wfScenes[scene]}<path d="M77 352h46"/></svg><figcaption><h4>${title}</h4><span>${action}</span><details><summary>Interaction details</summary><p>${description}</p></details></figcaption></figure>`).join('')}</div>`;
 document.querySelectorAll('[data-flow]').forEach(button=>{const selected=button.dataset.flow===key;button.setAttribute('aria-selected',selected);button.tabIndex=selected?0:-1;});
}
document.querySelectorAll('[data-flow]').forEach(button=>{
 button.addEventListener('click',()=>drawWireflow(button.dataset.flow));
 button.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...document.querySelectorAll('[data-flow]')];let i=tabs.indexOf(button);i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:2))%3;tabs[i].focus();drawWireflow(tabs[i].dataset.flow);});
});
drawWireflow('creator');

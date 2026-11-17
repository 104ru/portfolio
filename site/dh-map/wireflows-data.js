'use strict';
// Journeys from the 2020 Digital Hub UI map. img = screen file in screens/.
const step=(id,title,note,img,children=[],action='')=>({id,title,note,img,children,action});
const chain=(prefix,items)=>{let next=null;for(let i=items.length-1;i>=0;i--){const [title,note,img,action]=items[i];next=step(prefix+i,title,note,img,next?[next]:[],action);}return next;};
const wireflows=[
{id:'overview',title:'App overview',summary:'Home is one long page: best practices, popular widgets, support near you, approvals and insights.',root:step('home','Home','Welcome Peter: knowledge articles, the device refresh banner, popular widgets, nearest digital lockers, office map, self-service tasks, approvals and insights.','home-00',[
 {...step('home-refresh','Device refresh','Peter is due a new laptop.','refresh-00',[],'Device refresh'),jump:'refresh'},
 {...step('home-peripheral','Peripheral request','Order a mouse, a dock or a headset.','peripheral-00',[],'Request hardware'),jump:'peripheral'},
 {...step('home-issue','Raise an issue','Report a problem with a photo attached.','issue-00',[],'Raise an issue'),jump:'issue'},
 {...step('home-password','Reset password','Reset with a one-time code.','password-00',[],'Reset password'),jump:'password'},
 {...step('home-lost','Lost device','Report a lost laptop and get a replacement.','lost-00',[],'Lost device'),jump:'lost'},
 {...step('home-rooms','Meeting rooms','Check in, start the meeting, find another room.','rooms1-00',[],'Rooms'),jump:'rooms'},
 {...step('home-articles','Knowledge articles','Best practices and how-tos.','articles-01',[],'Knowledge articles'),jump:'articles'}
])},
{id:'refresh',title:'Device refresh',summary:'Notification → pick a laptop → address → locker or mail → peripherals → submit.',root:step('r0','You will be getting a new computer','Why, how long it takes, and what happens to the old machine and the data.','refresh-00',[
 step('r1','Step 1: choose a laptop','Two recommended laptops for Peter’s role.','refresh-01',[
  step('r2','Why this is a good choice','Recommended hardware, explained in plain words.','refresh-02',[],'Why this is a good choice?'),
  step('r3','Laptop selected','MacBook Pro chosen.','refresh-03',[
   step('r4','Step 2: address','Where to deliver, so the app can find delivery options.','refresh-04',[
    step('r5','Address filled','Show delivery and pickup options.','refresh-05',[
     step('r6','Step 3: delivery or pickup','Digital locker nearby, ready today; or mail, 7–10 days.','refresh-06',[
      step('r7','Locker selected','Pickup at the digital locker.','refresh-07',[
       step('r8','Step 4: peripherals','A pre-approved bundle and other peripherals by category.','refresh-08',[
        step('r9','Bundle selected','Magic Mouse and USB-C hub, same-day pickup.','refresh-09',[
         step('r10','Ready to order','Check laptop, bundle and locker, then submit.','refresh-10',[],'Submit')],'Select pre-approved bundle')],'Submit')],'Select Digilocker pickup')],'Show delivery / pickup options')],'Enter the address')],'Next')],'I want this hardware')],'Start the refresh')])},
{id:'peripheral',title:'Peripheral request',summary:'Pick a category → recommended devices → add to cart → request sent → locker ready.',root:chain('p',[
 ['Order hardware','Categories for Peter’s device: batteries, adapters, mice, docks, headsets, keyboards.','peripheral-00',''],
 ['Request a mouse','Recommended mice for his Mac, pre-approved ones flagged.','peripheral-01','Mice'],
 ['Same-day pickup','Filter to devices he can collect today.','peripheral-02','Same-day pickup'],
 ['Pre-approved only','Filter to devices that need no approval.','peripheral-03','Pre-approved'],
 ['Mouse details','Specs, then add to cart.','peripheral-04','Open a mouse'],
 ['Cart','One item, complete the request.','peripheral-05','Add to cart'],
 ['Request sent','No approval needed; pickup details follow.','peripheral-06','Complete request'],
 ['My EY: locker ready','The order is waiting in the vending-machine locker.','peripheral-07','Notification']])},
{id:'issue',title:'Raise an issue',summary:'Describe the problem → attach a photo → create the ticket.',root:chain('i',[
 ['Raise an issue','Subject, description, priority.','issue-00',''],
 ['Describe it','“I am unable to connect to VPN.”','issue-01','Type the issue'],
 ['Attach a file','Camera or photo library.','issue-02','Attach file'],
 ['Create a ticket?','Confirm before submitting.','issue-03','Raise a ticket'],
 ['Ticket created','Ticket number and what happens next.','issue-04','Submit ticket'],
 ['Photo attached','The screenshot is on the ticket.','issue-05','OK']])},
{id:'password',title:'Reset password',summary:'New password → one-time code → done, rate the experience.',root:chain('w',[
 ['Password reset','The password expired; set a new one.','password-00',''],
 ['Code sent','A one-time code goes to Peter’s phone.','password-01','Reset password'],
 ['Code arrives','The code shows up on the lock screen.','password-02','Wait for the code'],
 ['Code entered','Valid for 10 minutes.','password-03','Enter the code'],
 ['Confirm','Resend if needed, then reset.','password-04','Reset password'],
 ['Success','Password reset; rate the experience.','password-05','Done']])},
{id:'lost',title:'Lost device',summary:'Search → pick the device → change password → security forms → where and when → police report → replacement.',root:chain('l',[
 ['Search: lost computer','Search finds the widget and the security policies.','lost-00',''],
 ['Step 1: which device','It is mandatory to report a lost device; pick it.','lost-01','Report lost or stolen device'],
 ['Device selected','MacBook Pro, serial number shown.','lost-02','Select the MacBook'],
 ['Step 2: change password','Protect company data first.','lost-03','Go to the next step'],
 ['New password','Existing and new password.','lost-04','Go to password reset'],
 ['Password set','Ready to reset.','lost-05','Type passwords'],
 ['Password reset','Success: the new password is set.','lost-05b','Reset password'],
 ['Step 3: security forms','Three forms to fill in.','lost-06','Done'],
 ['Forms done','All three checked.','lost-07','Fill the forms'],
 ['Step 4: where and when','Last seen location on a map, date and time.','lost-08','Submit security forms'],
 ['Step 5: police report','Nearest police station; file and attach the receipt.','lost-09','Submit location and time'],
 ['Almost there','Checklist; police report still due.','lost-10','Skip, I will do it later'],
 ['Thank you','Two days for the police report; a virtual machine meanwhile.','lost-11','Create the lost laptop issue'],
 ['Virtual machine ready','A temporary desktop he can use from any computer.','notify-00','Notification'],
 ['My EY','Replacement in progress; locker pickup ready.','lost-12','Open Digital Hub'],
 ['Office map','Where the vending-machine locker is.','lost-13','Office map'],
 ['Locker','Locker number and code.','lost-14','View key'],
 ['Open locker','Tap to open; the new laptop is inside.','lost-15','Open locker'],
 ['Done','New laptop collected; rate the experience.','lost-16','Take the laptop']])},
{id:'rooms',title:'Meeting rooms',summary:'Check in, start the meeting, report a broken TV, find another room.',root:step('m0','My meeting rooms','Today’s meetings with their rooms; start, cancel, change or report an issue.','rooms1-00',[
 step('m1','Technical review','Check in, remind invitees, start.','rooms1-01',[
  step('m2','Checked in','Room checked, invitees reminded.','rooms1-02',[
   step('m3','Meeting in progress','Cancel and check out at the end.','rooms1-04',[],'Start meeting')],'Check in')],'Start'),
 step('m4','Cancel','The meeting is cancelled; the room frees up.','rooms1-03',[],'Cancel'),
 step('m5','Report an issue','“TV is not working in the Ormen room.”','rooms2-00',[
  step('m6','Find another room','Nearby rooms with what is available.','rooms2-01',[
   step('m7','Alpha room','Features, time, capacity; book it.','rooms2-02',[
    step('m8a','Alpha room booked','The booking is in the calendar.','rooms2-04',[
     step('m8','Room changed','The meeting moves to Alpha room.','rooms2-03',[],'Back to rooms')],'Book this room')],'Choose Alpha room'),
   step('m9','All rooms','Available and in use, with distance.','rooms3-00',[
    step('m10','Filters','Time, capacity, distance, features.','rooms3-01',[],'Filter')],'Show all')],'Find another room')],'Issue')])},
{id:'articles',title:'Knowledge articles',summary:'Best practices from Home, then one article.',root:chain('k',[
 ['Best practices','Virtual desktops, VPN and more, rated by colleagues.','articles-01',''],
 ['Article','Current state of the secure VPN connection, and when VPN is not the answer.','articles-00','Open VPN']])}
];

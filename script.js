'use strict';
// Only the regular weekly pattern is shown. Never infer real-time opening or stock.
const japanDate = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const initialToday = japanDate();
let [viewYear, viewMonth] = initialToday.split('-').map(Number);
let holidayData = null;
const keyFor = (year,month,day) => `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
function renderCalendar(){
  const today=japanDate();
  document.getElementById('calendar-title').textContent=`${viewYear}年 ${viewMonth}月`;
  const body=document.getElementById('calendar-body');
  body.replaceChildren();
  const offset=new Date(Date.UTC(viewYear,viewMonth-1,1)).getUTCDay();
  const days=new Date(Date.UTC(viewYear,viewMonth,0)).getUTCDate();
  const supported=Boolean(holidayData && holidayData.years.includes(viewYear));
  let row;
  for(let cell=0;cell<Math.ceil((offset+days)/7)*7;cell++){
    if(cell%7===0){row=document.createElement('tr');body.append(row);}
    const td=document.createElement('td');row.append(td);
    const day=cell-offset+1;
    if(day<1||day>days)continue;
    const key=keyFor(viewYear,viewMonth,day), closed=cell%7<2;
    const holiday=holidayData?.dates[key];
    td.textContent=day;
    if(closed)td.classList.add('closed');
    if(key===today){td.classList.add('today');td.setAttribute('aria-current','date');}
    if(holiday){td.classList.add('holiday');const note=document.createElement('small');note.textContent='※';td.append(note);}
    td.setAttribute('aria-label',`${viewMonth}月${day}日${key===today?' 今日':''}、${holiday?holiday+'、営業は要確認':closed?'通常の定休日':'通常営業日の目安'}${!supported?'、祝日情報は未確認':''}`);
  }
  document.getElementById('calendar-note').textContent=supported?'臨時休業・在庫状況は反映されません。※の祝日・休日の営業は【要確認】です。':'臨時休業・在庫状況は反映されません。この年の祝日データは未確認です。【要確認：祝日の営業】';
}
function shiftMonth(delta){viewMonth+=delta;if(viewMonth<1){viewMonth=12;viewYear--;}if(viewMonth>12){viewMonth=1;viewYear++;}renderCalendar();}
document.getElementById('previous-month').addEventListener('click',()=>shiftMonth(-1));
document.getElementById('next-month').addEventListener('click',()=>shiftMonth(1));
document.getElementById('current-month').addEventListener('click',()=>{[viewYear,viewMonth]=japanDate().split('-').map(Number);renderCalendar();});
renderCalendar();
fetch('holidays.json').then(response=>{if(!response.ok)throw new Error('Holiday data unavailable');return response.json();}).then(data=>{holidayData=data;renderCalendar();}).catch(()=>{renderCalendar();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderCalendar();});

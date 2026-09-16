export const SERVICES = [
 {id:'express',name:'Экспресс',subtitle:'Свежесть на каждый день',price:900,duration:60,label:'60 мин',features:['Бесконтактная мойка кузова','Очистка дисков и арок','Бережная сушка микрофиброй']},
 {id:'signature',name:'Комплекс',subtitle:'Чистота снаружи и внутри',price:1900,duration:120,label:'120 мин',features:['Всё из пакета «Экспресс»','Пылесос салона и багажника','Стёкла и пластик салона','Чернение шин']},
 {id:'detail',name:'Детейлинг',subtitle:'Внимание к каждой детали',price:4500,duration:180,label:'180 мин',features:['Всё из пакета «Комплекс»','Глубокая очистка кузова','Защитный состав с гидрофобом','Деликатный уход за интерьером']},
] as const;
export const STATUSES=['booked','accepted','washing','quality','ready','delivered'] as const;
export const STATUS_LABEL:Record<string,string>={booked:'Записан',accepted:'Автомобиль принят',washing:'На мойке',quality:'Контроль качества',ready:'Готов к выдаче',delivered:'Выдан',cancelled:'Отменён'};
export const money=(v:number)=>new Intl.NumberFormat('ru-RU').format(v)+' ₽';
export const dateLabel=(v:string)=>new Date(v).toLocaleString('ru-RU',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'});
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
export type Order={id:string;userId:string;customer:string;phone:string;car:string;plate:string;service:string;slot:string;bay:number;status:string;total:number;proposedTotal:number|null;proposalNote:string|null;paid:number;employee:string|null;intake:string|null;mileage:string|null;createdAt:string;updatedAt:string;version:number;reviewed?:boolean;events?:{id:string;status:string;note:string;createdAt:string}[]};
export type Settings={address:string;city:string;phone:string;whatsapp:string;telegram:string;instagram:string;tiktok:string;latitude:string;longitude:string;legalName:string;legalInfo:string;prices:number[]};
export const DEFAULT_SETTINGS:Settings={address:'',city:'',phone:'',whatsapp:'',telegram:'',instagram:'',tiktok:'',latitude:'',longitude:'',legalName:'',legalInfo:'',prices:[900,1900,4500]};

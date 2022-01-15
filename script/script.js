function aaa(){
let arrBusyTime = [
    '00:00-07:00',
    '08:03-09:17',
    '09:20-10:00',
    '12:00-14:07',
    '21:00-21:59',
];

let form = document.forms.my;

let desiredTime1 = form.elements.one.value;
let desiredTime2 = form.elements.two.value;

let desiredTime = desiredTime1 + '-' + desiredTime2; //Промежуток свободного времени
let desiredTimeLength = +form.elements.three.value; //Желаемая длительность звонка в минутах

let a = getArrFreeTime(arrBusyTime, desiredTime, desiredTimeLength);
alert('Вам доступны следующие временные промежутки:' + a);
};

 function getArrFreeTime(arrInto,desiredTimeInto, desiredTimeLengthInto) {
    try {
        let format = 'HH:mm';
        //Деструктурируем промежуток желаемого времени
        desiredTimeInto = desiredTimeInto.split('-');
        //Проверяем корректность входных данных
                if (moment(desiredTimeInto[0],format) >= moment(desiredTimeInto[1],format)) {
            throw new Error('Введенный промежуток времени неккоректный');
        };
        if (desiredTimeLengthInto <= 0) {
            throw new Error('Введенная продолжительность звонка неккоректная');
        };
        
        //Деструктурируем входной массив
        arrInto = arrInto.map((item) => item.split('-'));

        //объдиняем занятые промежутки
        arrInto.forEach(function(item,index,arr){
            if ((index !== arr.length-1) && (moment(arr[index][1],format).format(format) == moment(arr[index+1][0],format).format(format))) {
                item.splice(1,1,arr[index+1][1]);
                arr.splice(index+1,1);
            }
        });

        //Проверка на корректность
        arrInto.forEach(item => {
            if ((moment(desiredTimeInto[0], format) >= moment(item[0], format)) && (moment(desiredTimeInto[1], format) <= moment(item[1], format))) {
                throw new Error('Нет свободного времени');
            };
        });

        //Достаём свободные промежутки
        let chekStartBusyTime0000 = (moment(arrInto[0][0],format).format(format) == '00:00');
        let chekEndBusyTime2359 = (moment(arrInto[arrInto.length-1][1],format).format(format) == '23:59');
        let arrFreeTime = [];
        if (chekStartBusyTime0000 && chekEndBusyTime2359) {
            arrFreeTime = arrInto.map(function (item,index,arr) {
                if (index !== arr.length-1){
                    return [item[1],arr[index+1][0]];
                };
            });
            arrFreeTime.pop();
        } else if ((!chekStartBusyTime0000 && chekEndBusyTime2359)) {
            let arrFreeTime00 = [['00:00',arrInto[0][0]]];
            let arrFreeTimeAll = arrInto.map(function (item,index,arr) {
                if (index !== arr.length-1){
                    return [item[1],arr[index+1][0]];
                };
            });
            arrFreeTime = arrFreeTime.concat(arrFreeTime00,arrFreeTimeAll);
            arrFreeTime.pop();
        } else if ((chekStartBusyTime0000 && !chekEndBusyTime2359)) {
            let arrFreeTimeAll = arrInto.map(function (item,index,arr) {
                if (index !== arr.length-1){
                    return [item[1],arr[index+1][0]];
                };
            });
            arrFreeTimeAll.pop();
            let arrFreeTime2359 = [[arrInto[arrInto.length-1][1],'23:59']];
            arrFreeTime = arrFreeTime.concat(arrFreeTimeAll,arrFreeTime2359);
        } else if ((!chekStartBusyTime0000 && !chekEndBusyTime2359)) {
            let arrFreeTime00 = [['00:00',arrInto[0][0]]];
            let arrFreeTimeAll = arrInto.map(function (item,index,arr) {
                if (index !== arr.length-1){
                    return [item[1],arr[index+1][0]];
                };
            });
            arrFreeTimeAll.pop();
            let arrFreeTime2359 = [[arrInto[arrInto.length-1][1],'23:59']];
            arrFreeTime = arrFreeTime.concat(arrFreeTime00,arrFreeTimeAll,arrFreeTime2359);

        }

        //Находим пересечения промежутков свободного времени и промежутка желаемого времени       
        //Лежит ли начало промежутка желаемого времени внутри свободного времени?
        let chekDesiredStartTimeInsideFreeTime = arrFreeTime.findIndex(function(item) {
            return (moment(desiredTimeInto[0],format).format(format) >= moment(item[0],format).format(format)) && (moment(desiredTimeInto[0],format).format(format) < moment(item[1],format).format(format));
        });
        //Если нет, то внутри какого занятого промежутка лежит начало желаемого времени?
        if (chekDesiredStartTimeInsideFreeTime == -1) {
            var chekDesiredStartTimeInsideBusyTime = arrInto.findIndex(function(item) {
                return (moment(desiredTimeInto[0],format).format(format) >= moment(item[0],format).format(format)) && (moment(desiredTimeInto[0],format).format(format) <= moment(item[1],format).format(format));
            })
        }

        //Лежит ли конец промежутка желаемого времени внутри свободного времени?
        let chekFinishDesiredTimeInsideFreeTime = arrFreeTime.findIndex(function(item) {
            return (moment(desiredTimeInto[1],format).format(format) > moment(item[0],format).format(format)) && (moment(desiredTimeInto[1],format).format(format) <= moment(item[1],format).format(format));
        });
        //Если нет, то внутри какого занятого промежутка лежит конец желаемого времени?
        if (chekFinishDesiredTimeInsideFreeTime == -1) {
            var chekDesiredFinishTimeInsideBusyTime = arrInto.findIndex(function(item) {
                return (moment(desiredTimeInto[1],format).format(format) >= moment(item[0],format).format(format)) && (moment(desiredTimeInto[1],format).format(format) <= moment(item[1],format).format(format));
            })
        }

        // строим пересечение промежутков свободного и желаемого времени без учета вложенных занятых интервалов
        let arrFreeAndDesiredTimeBeta = [[]];
        if (chekDesiredStartTimeInsideFreeTime !== -1) {
            arrFreeAndDesiredTimeBeta[0][0] = desiredTimeInto[0];
        } else {
            arrFreeAndDesiredTimeBeta[0][0] = arrInto[chekDesiredStartTimeInsideBusyTime][1];
        }
        if (chekFinishDesiredTimeInsideFreeTime !== -1) {
            arrFreeAndDesiredTimeBeta[0][1] = desiredTimeInto[1];
        } else {
            arrFreeAndDesiredTimeBeta[0][1] = arrInto[chekDesiredFinishTimeInsideBusyTime][0];
        }

        //Проверяем есть ли внутри полученного свободного промежутка промежутки занятого времени
        let chekArrBusyTimeInsideArrFree = arrInto.filter(function(item) {
            return (item[0] > arrFreeAndDesiredTimeBeta[0][0]) && (item[1] < arrFreeAndDesiredTimeBeta[0][1]);
        });
        //Если нет, то берем этот массив, если есть, то обрабатываем дальше
        if (!chekArrBusyTimeInsideArrFree.length == 0) {
            //учитываем промежутки занятого времени внутри полученного свободного промежутка
            arrFreeAndDesiredTimeBeta = arrFreeAndDesiredTimeBeta.concat(chekArrBusyTimeInsideArrFree);
            for(let i = 1; i < arrFreeAndDesiredTimeBeta.length; i++) {
                let a = arrFreeAndDesiredTimeBeta[i-1][1];
                let b = arrFreeAndDesiredTimeBeta[i][0];
                let c = arrFreeAndDesiredTimeBeta[i][1];
                arrFreeAndDesiredTimeBeta[i][1] = a;
                arrFreeAndDesiredTimeBeta[i][0] = c;
                arrFreeAndDesiredTimeBeta[i-1][1] = b;
            }
        } 
        
        //Вычисляем длительности свободных промежутков
        let arrFreeAndDesiredTimeBetaLength = arrFreeAndDesiredTimeBeta.map(function (item,index,arr) {
            let momentStart = moment(item[0],format);
            let momentEnd = moment(item[1],format);
            let timeLength = moment.duration(momentEnd.diff(momentStart));
            return timeLength.asMinutes(timeLength);
        })

        //Вычисляем количество промежутков которые поместятся в свободные интервалы
        let arrHowMany = arrFreeAndDesiredTimeBetaLength.map(item => item/desiredTimeLengthInto);
        arrHowMany = arrHowMany.map(item => Math.floor(item));

        //Проверяем есть ли свободные места
        if (Math.max(arrHowMany) == 0) throw new Error('Нет свободного времени');

        //создаем итоговые промежутки
        let arrFreeAndDesiredTime = arrFreeAndDesiredTimeBeta.map(item => item.splice(0,1));
        let arrOut = [];
        arrFreeAndDesiredTime = arrFreeAndDesiredTime.map(function(item,index,){
            let arrOut = item;
            for(let i = 0; i < arrHowMany[index]; i++) {
                arrOut.push(moment(arrOut[i], format).add(desiredTimeLengthInto,'minutes').format(format));
            }
            return arrOut;
        });
        //Убираем короткие промежутки
        arrFreeAndDesiredTime = arrFreeAndDesiredTime.filter(item => item.length !== 1);
        //создаем промежутки из значений
        arrFreeAndDesiredTime = arrFreeAndDesiredTime.map(function(item){
            let arrOut = [];
            for(let i = 0; i < item.length - 1; i++) {
                arrOut.push(item[i] + '-' + moment(item[i+1], format).format(format)); 
            };
            return arrOut;
        });
        //создаем один выходной массив
        let arrFreeAndDesiredTimeOut = [];
        arrFreeAndDesiredTime.forEach(item => {
            item.forEach(item => {
                arrFreeAndDesiredTimeOut.push(item);
            });
        });

        return arrFreeAndDesiredTimeOut;
    } catch(err) {
        return err;
    }
}



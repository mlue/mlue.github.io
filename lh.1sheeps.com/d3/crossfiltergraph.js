//var yearlyBubbleChart = dc.bubbleChart("#yearly-bubble-chart");
var yearlyRowChart = dc.rowChart("#yearly-bubble-chart");
var volumeChart = dc.barChart("#monthly-volume-chart");
var dayOfWeekChart = dc.rowChart("#day-of-week-chart");
var timeOfDayChart = dc.pieChart("#time-of-day-chart");
d3.csv("/d3/cfd.csv", function (data) {
    var dateFormat = d3.time.format("%m/%d/%Y");
    var numberFormat = d3.format(".2f")
    data.forEach(function(e){
	e.dd = dateFormat.parse(e.date);
	e.day = Math.floor(e.dd.getTime()/86400)
    })
    var ndx = crossfilter(data);
    var all = ndx.groupAll();
    var dailyDimension = ndx.dimension(function (d) {
        return d.name;
    });
    var dailyPerformanceGroup = dailyDimension.group().reduce(
	function(p,v){
	    ++p.count;
	    // p.sumMorn += +v.morning
	    // p.avgMorn = p.sumMorn/p.count
	    
	    // p.sumEvening += +v.evening
	    // p.avgEvening = p.sumEvening/p.count
	    
	    // p.sumNoon +=  +v.noon
	    // p.avgNoon = p.sumNoon/p.count
	    
	    // p.sumNight += +v.night
	    // p.avgNight = p.sumNight/p.count
	    p.total +=  +v.val
	    
	    p.avgDay = p.total/p.count //(p.avgNoon+p.avgMorn+p.avgEvening)/3
	    return p},
	function(p,v){ 
	    --p.count;
	    
	    // p.sumMorn -= +v.morning
	    // p.avgMorn = p.sumMorn/p.count
	    
	    // p.sumEvening -= +v.evening
	    // p.avgEvening = p.sumEvening/p.count
	    
	    // p.sumNoon -= +v.noon
	    // p.avgNoon = p.sumNoon/p.count
	    
	    // p.diffTotal -= Math.abs(p.ph - +v.total)

	    // p.sumNight -= +v.night
	    // p.avgNight = p.sumNight/p.count
	    
	    p.total -=  +v.val

	    p.avgDay = p.total/(4*p.count)
	    
	    return p},
	function(){return {total:0,avgDay:0,count:0}})
        
    var dailyPerformanceGroup1 = dailyDimension.group().reduce(
	function(p,v){
	    ++p.count;
	    // p.sumMorn += +v.morning
	    // p.avgMorn = p.sumMorn/p.count
	    
	    // p.sumEvening += +v.evening
	    // p.avgEvening = p.sumEvening/p.count
	    
	    // p.sumNoon +=  +v.noon
	    // p.avgNoon = p.sumNoon/p.count

	    // p.sumNight += +v.night
	    // p.avgNight = p.sumNight/p.count
	    
	    p.total +=  +v.val
	    p.diffTotal += Math.abs(p.ph - +v.val)
	    p.ph = v.val
	    p.avgDay = p.total/(4*p.count) //(p.avgNoon+p.avgMorn+p.avgEvening)/3
	    
	    return p},
	function(p,v){ 
	    --p.count;
	    
	    // p.sumMorn -= +v.morning
	    // p.avgMorn = p.sumMorn/p.count
	    
	    // p.sumEvening -= +v.evening
	    // p.avgEvening = p.sumEvening/p.count
	    
	    // p.sumNight -= +v.night
	    // p.avgNight = p.sumNight/p.count
	    
	    // p.sumNoon -= +v.noon
	    // p.avgNoon = p.sumNoon/p.count
	    
	    p.total -=  +v.val
	    p.diffTotal -= Math.abs(p.ph - +v.val)
	    p.ph = v.val
	    p.avgDay = p.total/p.count
	    
	    return p},
	function(){
	    return {total:0,avgDay:0,count:0,ph:0};
	})
	var moveDays = ndx.dimension(function(d){
		return d.day;
	    })
	var volumeByDayGroup = moveDays.group().reduce(function(p,v) {
	    p.count += 0.25
	    p.total += +v.val
	    return p
	},
	function(p,v) {
	    p.count -= 0.25
	    p.total -= +v.val
	    return p
	},
	function() {
	    return {count:0,total:0}
	}
						      )
    var dailyMoveGroup = moveDays.group().reduceSum(function(d){
	return d.total
    })
    
    var timeOfDay = ndx.dimension(function (d) {
        switch (+d.tod) {
        case 1:
            return "0.Morning";
        case 2:
            return "1.Noon";
        case 3:
            return "2.Evening";
        case 4:
            return "3.Night";
	default:
	    return "4.wtf?";
        }
    });

    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        switch (day) {
        case 0:
            return "0.Sat";
        case 1:
            return "1.Sun";
        case 2:
            return "2.Mon";
        case 3:
            return "3.Tuesday";
        case 4:
            return "4.Wednesday";
        case 5:
            return "5.Thursday";
        case 6:
            return "6.Friday";
        }
    });

    var dayOfWeekGroup = dayOfWeek.group().reduce(function (p,v) {
	    p.days += 0.25;
	    p.total += +v.val;
	    p.avg = p.total/p.days;
	    return p;
	},
	function (p,v) {
	    p.days -= 0.25;
	    p.total -= +v.val;
	    p.avg = p.total/p.days;
	    return p;
	},
	function () {
	    return {days :0, total:0, avg:0}
	})
    
    var timeOfDayGroup = timeOfDay.group().reduce(function (p,v) {
	    p.days += 1;
	    p.total += +v.val;
	    p.avg = p.total/p.days;
	    return p;
	},
	function (p,v) {
	    p.days -= 1;
	    p.total -= +v.val;
	    p.avg = p.total/p.days;
	    return p;
	},
	function () {
	    return {days :0, total:0, avg:0}
	})
    

    var indexAvgByDayGroup = moveDays.group().reduce(
	function (p,v) {
	    ++p.days;
	    p.total += +v.val
	    p.avg += p.total/p.days
	    return p
	},
	function (p,v) {
	    --p.days;
	    p.total -= +v.val
	    p.avg += p.total/p.days
	    return p
	},
	function () {
	    return {days :0, total:0, avg:0}
	});
    
    yearlyRowChart
	.width(2000)
	.height(2000)
	.dimension(dailyDimension)
        .group(dailyPerformanceGroup)
	.valueAccessor(function (p){
	    return p.value.total
		//return (p.value.avgEvening+p.value.avgNight)*(1.01-1/p.value.count)
		    })
        .label(function (p) {
		return p.key;
	    })
	.title(function(p){
		return p.key+"\ntotal: "+p.value.total+"\n"
		    +"days active: "+p.value.count/4;
	    })
/*	.y(d3.scale.pow().exponent(.3).domain([1,1000]))
        
        .y(d3.scale.pow().exponent(.3).domain([2,400]))
	.xAxisPadding(-.001)
	.yAxisPadding(-.001)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true) */
	.elasticX(true)
	.colorDomain(d3.scale.category20b())
        .colorAccessor(function (d) {
		return (d.value.total % 19)+1;
	    })
    	.xAxis()
    ;

    volumeChart.width(1000)
	.height(200)
        .dimension(moveDays)
        .group(volumeByDayGroup)
	.valueAccessor(function(d){
		return d.value.total;
	    })
	.elasticX(true)
	.elasticY(true)
        .x(d3.time.scale().domain([new Date(2011,7,17), new Date()]))
	.xAxis().tickFormat(function(v) {return dateFormat(new Date(Number(v*86400)));})
    dayOfWeekChart.width(300)
	.valueAccessor(function (p){
		return p.value.avg;
	    })
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
    	.elasticX(true)
//        .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .colors(['#FFA7B7'])
        .label(function (d){
            return d.key.split(".")[1];
        })
    
        .xAxis().ticks(4);
    timeOfDayChart.width(300)
	.valueAccessor(function (p){
		return p.value.total;
	    })
        .group(timeOfDayGroup)
        .dimension(timeOfDay)
        .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef'])
        .label(function (d){
	    return d.data.key.split(".")[1]
        })
	.renderLabel(true)
	.title(function(d) {return "Total Lines: "+d.data.value.total+"\n"+
			   "Average Lines: "+d.data.value.avg+"\n"})
	.renderTitle(true);
    dc.renderAll();
})


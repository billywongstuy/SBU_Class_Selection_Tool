/*
  needs the course_list and courses_info variables to be declared earlier
  done by saving json files as js variables
*/

var changeCodes = function(dpt_select,code_select) {
    var dpt = dpt_select.value;
    for (var i = code_select.options.length - 1; i >= 0; i--) {
	code_select.remove(0);
    }
    for (var i = 0; i < course_list[dpt].length; i++) {
	var option = document.createElement("option");
	option.text = course_list[dpt][i];
	option.value = course_list[dpt][i];
	code_select.add(option);
    }
}

var addCourseTrio = function() {

    var courses = document.getElementById("chosen_courses");
    if (courses.children.length < 10) {	
	var row = document.createElement("div");
	row.className = "row";
	
	var dpt_select = document.createElement("select");
	dpt_select.className = "form-control course";
	var option = document.createElement("option");
	option.text = "Select department";
	option.disabled = true;
	option.selected = true;
	dpt_select.add(option);
	for (var dpt in course_list) {
	    option = document.createElement("option");
	    option.text = dpt;
	    option.value = dpt;
	    dpt_select.add(option)
	}

	var code_select = document.createElement("select");
	code_select.className = "form-control code";
	option = document.createElement("option");
	option.text = "No department selected";
	option.disabled = true;
	option.selected = true;
	code_select.add(option);
	
	dpt_select.addEventListener("change",function() {changeCodes(dpt_select,code_select)});
	
	var col1 = document.createElement("div");
	col1.className = "form-group col-xs-5"
	col1.appendChild(dpt_select);

	var col2 = document.createElement("div");
	col2.className = "form-group col-xs-5"
	col2.appendChild(code_select);

	var col3 = document.createElement("div");
	var color = document.createElement("input");
	color.type = "color";
	color.value = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	col3.appendChild(color);
	
	row.appendChild(col1);
	row.appendChild(col2);
	row.appendChild(col3);
	document.getElementById("chosen_courses").append(row);
    }
}


var deleteCourseTrio = function() {
    var courses = document.getElementById("chosen_courses");
    if (courses.children.length > 1) {
	courses.removeChild(courses.lastChild);
    }
}


var getStartHalfHour = function(time) {
    var parts = time.split(":");
    var hour = parseInt(parts[0]);
    var minutes = parseInt(parts[1]);
    var ret = null
    if (minutes == 30) {
	ret = hour+":30";
    }
    else if (minutes >= 30) {
	ret = (hour+1).toString() + ":30";
    }
    else {
	ret = hour+":00";
    }
    if (ret.length < 5) {
	ret = "0" + ret;
    }
    return ret;
}

var getEndHalfHour = function(time) {
    var parts = time.split(":");
    var hour = parseInt(parts[0]);
    var minutes = parseInt(parts[1]);
    var ret = null;
    if (minutes == 0) {
	ret =  hour+":00";
    }
    else if (minutes > 30) {
	ret = (hour+1).toString() + ":00";
    }
    else {
	ret =  hour+":30";
    }
    if (ret.length < 5) {
	ret = "0" + ret;
    }
    return ret;
}

//times have to be in 24 hour format
var getHalfHoursDiff = function(time1,time2) {
    var p1 = time1.split(":");
    var p2 = time2.split(":");
    return Math.abs((parseInt(p2[0])-parseInt(p1[0]))*2 + (parseInt(p2[1])-parseInt(p1[1]))/30);
}


var getNextHalfHour = function(time) {
    var parts = time.split(":");
    if (parts[1] == "00") {
	return parts[0] + ":30";
    }
    return parseInt(parts[0])+1 + ":00";
}

var twelveToTwentyFourHourTime = function(time,ampm) {
    var parts = time.split(":");
    var ret = null;
    if (parseInt(parts[0]) == 12 && ampm == "AM") {
	ret = "0:" + parts[1];
    }
    else if (parseInt(parts[0]) == 12 && ampm == "PM") {
	ret = "12:" + parts[1];
    }
    else if (ampm == "PM") {
	ret = (parseInt(parts[0])+12).toString() + ":" + parts[1];
    }
    else {
	ret = time;
    }
    if (ret.length < 5) {
	ret = "0" + ret;
    }
    return ret;
}


var twentyFourToTwelveHourTime = function(time) {
    var parts = time.split(":");
    var ret = null;
    if (parseInt(parts[0]) == 0) {
	ret = "12:" + parts[1] + "AM";
    }
    else if (parseInt(parts[0]) == 12) {
	ret = "12:" + parts[1] + "PM";
    }
    else if (parseInt(parts[0]) > 12) {
	ret = (parseInt(parts[0])-12).toString() + ":" + parts[1] + "PM";
    }
    else {
	ret =  time + "AM";
    }
    if (ret.length < 7) {
	ret = "0" + ret;
    }
    return ret;
}


var generateGraphic = function() {
    var graphic = document.getElementById("graphic");
    graphic.style.width = "100%";
    
    while (graphic.hasChildNodes()) {
	graphic.removeChild(graphic.lastChild);
    }
    
    var days = ['Monday','Tuesday','Wednesday','Thursday','Friday']
    var times = []
    for (var i = 800; i <= 2300; i+=50) {
	var minutes = (i % 100 / 50) * 3;
	var time = Math.floor(i/100).toString() + ":" + minutes.toString() + "0";
	if (time.length < 5) {
	    time = "0" + time;
	}
	times.push(twentyFourToTwelveHourTime(time));
    }
    
    var table = document.createElement("table");
    table.width = "100%";
    table.className = "table-striped";

    var t_head = document.createElement("thead");
    var day_info_row = document.createElement("tr");
    day_info_row.className = "row-fluid";
    for (var i = -1; i < days.length; i++) {
	var day_info = document.createElement("th");
	day_info.className = "col-md-2";
	if (i >= 0) {
	    day_info.innerHTML = days[i];
	}
	day_info_row.appendChild(day_info);
    }
    t_head.appendChild(day_info_row);
    table.appendChild(t_head);


    var t_body = document.createElement("tbody");
    for (var i = 0; i < times.length; i++) {
	
	var time_slot = document.createElement("tr");
	time_slot.id = times[i];
	time_slot.className = "row-fluid";

	var time_info = document.createElement("th");
	time_info.className = "col-md-2";
	time_info.innerHTML = times[i];
	time_slot.appendChild(time_info);
	
	for (var j = 0; j < days.length; j++) {
	    var day_slot = document.createElement("td");
	    day_slot.id = days[j] + " " + times[i];
	    day_slot.className = "col-md-2 slot";
	    day_slot.style.verticalAlign = "top";
	    //day_slot.innerHTML = "-";
	    time_slot.appendChild(day_slot);
	}
	t_body.appendChild(time_slot);
    }
    table.appendChild(t_body);
    graphic.appendChild(table);

}


var addHoverPopover = function (section,selected_course,section_slot,ampm,end_ampm,h) {

    var text = section_slot["type"];
    text += "<br />Instructor(s): " + section_slot["instructor"];
    text += "<br />Location: " + section_slot["location"] + " " + section_slot["room"];
    text += "<br />Time: " + section_slot["time_start"] + ampm + "-" + section_slot["time_end"] + end_ampm; // + "<br><br>";
    
    section.setAttribute("title",selected_course["dept"] + " " + selected_course["code"] + " - " + selected_course["name"]);
    section.setAttribute("data-toggle","popover");
    section.setAttribute("data-placement","right");
    section.setAttribute("data-content",text);
    section.setAttribute("data-trigger","hover");
    section.setAttribute("data-html","true");
    
    if (h == 0) {
	section.innerHTML = section_slot["type"];
    }
}


var addHoverEvents = function(section) {
    //maybe somehow add borders
    section.addEventListener("mouseover",function() {
	var all_sections = document.getElementsByClassName(this.className);
	for (var s = 0; s < all_sections.length; s++) {
	    all_sections[s].style.width = "24%";
	    all_sections[s].style.paddingTop = "24%";
	}
    });
    section.addEventListener("mouseout",function() {
	var all_sections = document.getElementsByClassName(this.className);
	for (var s = 0; s < all_sections.length; s++) {
	    all_sections[s].style.width = "14%";
	    all_sections[s].style.paddingTop = "14%";
	}
    });
}


var createSection = function(class_num,color,section,selected_course,section_slot,ampm,end_ampm,h) {
    var section = document.createElement("div");
    section.className = class_num;
    section.style.backgroundColor = color;
    section.style.width = "14%";
    section.style.paddingTop = "14%";
    section.style.margin = "2%";
    section.style.display = "inline-block";
    addHoverPopover(section,selected_course,section_slot,ampm,end_ampm,h);
    addHoverEvents(section);
    return section;
}

var addToGraphic = function() {
    var graphic = document.getElementById("graphic");
    generateGraphic();
    
    var chosen_courses_info = [];
    var courses = document.getElementById("chosen_courses");
    var letter = "A";
    var num = 0;
    
    for (var i = 0; i < courses.children.length; i++) {
	//what if dept is not selected
	var dpt = courses.children[i].children[0].getElementsByClassName("course")[0].value;
	var code = courses.children[i].children[1].getElementsByClassName("code")[0].value;
	var color = courses.children[i].children[2].getElementsByTagName("input")[0].value;
	var selected_course = courses_info[dpt][code];	

	//each section in the course
	for (var j = 0; j < selected_course["sections"].length; j++) {
	    var section_slot = selected_course["sections"][j];
	    var class_num = section_slot["class_num"];
	    if (section_slot["class_num"] == "N/A") {
		class_num = letter + num.toString();
		num += 1;
	    }
	    
	    //each day in the section
	    for (var k = 0; k < section_slot["days"].length; k++) {
		
		var ampm = section_slot["am_pm"];
		var end_ampm = ampm;
		if (section_slot["time_end"].split(":")[0] == "12") {
		    end_ampm = "PM";
		}
		var target = document.getElementById(section_slot["days"][k] + " " + getStartHalfHour(section_slot["time_start"]) + ampm);
		var halfHourDiff = getHalfHoursDiff(getEndHalfHour(twelveToTwentyFourHourTime(section_slot["time_end"]+end_ampm)),getStartHalfHour(twelveToTwentyFourHourTime(section_slot["time_start"]+ampm)));
		var curr_time_slot = twelveToTwentyFourHourTime(section_slot["time_start"],ampm);
		
		for (var h = 0; h < halfHourDiff; h++) {

		    var section = createSection(class_num,color,section,selected_course,section_slot,ampm,end_ampm,h);
		    
		    if (target.children.length != 0 && target.children.length % 5 == 0) {
			target.appendChild(document.createElement("div"));
		    }		    
		    target.appendChild(section);
		    curr_time_slot = getNextHalfHour(curr_time_slot);
		    target = document.getElementById(section_slot["days"][k] + " " + twentyFourToTwelveHourTime(curr_time_slot));

		}
		
		//target.appendChild(section);
		
	    }
	    
	}
	
	$('[data-toggle="popover"]').popover();
	
	//chosen_courses_info.push(courses_info[dpt][code]);
    }
    
    //console.log(chosen_courses_info);

}

var init = function() {
    addCourseTrio();
    document.getElementById("add_course").addEventListener("click",function() {addCourseTrio();});
    document.getElementById("delete_course").addEventListener("click",function() {deleteCourseTrio();});
    document.getElementById("find_sections").addEventListener("click",function() {addToGraphic();});
    generateGraphic();
}








init();

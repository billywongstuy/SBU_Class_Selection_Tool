# TO DO
# DUPLICATES
# very prevalent with WRT 102 (leaves only TUTH sections)

# what to do with htba
# what to do with appt day

# filters


types = ['LEC ','REC ','SEM ','LAB ','SUP ']
lines_to_ignore = []
lines_to_ignore.append('Undergraduate Courses #\n')
lines_to_ignore.append('DEPT CRS DC/SK Course Title Cls Nbr Cmp SCT Days Time Bldg Room Instructor\n')


def get_days(day_string):
    day_ls = {'M':'Monday','TU':'Tuesday','W':'Wednesday','TH':'Thursday','F':'Friday'}
    days = []
    if day_string == 'M-F':
        return [day_ls[d] for d in day_ls]
    if day_string == 'APPT': #need to figure out a better method than every day atm
        return [day_ls[d] for d in day_ls]
    while (len(day_string) > 0):
        day = day_string[0]
        day_string = day_string[1:]
        if day not in day_ls:
            day += day_string[0]
            day_string = day_string[1:]
        days.append(day_ls[day])
    return days

def usable(line):
    if line[:len('Undergraduate Courses')] != 'Undergraduate Courses' and line not in lines_to_ignore:
            return True
    return False

# not very good atm what if a section with TUTH and no type pops up
def is_a_section_line(line):
    day_ls = ['M','TU','W','TH','F','MW','TUTH','MWF','MF','WF']
    parts = line.split()
    return (any(x in line for x in types) or any(d in parts for d in day_ls)) and ('AM' in line or 'PM' in line or 'TBA' in line)

def add_dept_to_courses(line,depts,courses):
    parts = line.split(' (')
    parts[1] = parts[1][:parts[1].find(')')]
    depts[parts[1]] = parts[0]
    courses[parts[1]] = {}

def get_end_of_course(lines,x):
    end_of_course = x+1
    while end_of_course < len(lines) and 'Credit(s)' not in lines[end_of_course] and 'Courses' not in lines[end_of_course]:
        end_of_course += 1
    return end_of_course
        
def get_notes(lines,i,notes):
    while not(is_a_section_line(lines[i])):
        notes += lines[i]    
        i += 1
    return (i,notes)


def filter_out_header(data,curr_section,lines,l):
    if '#' in data[0]: #need to work on this
        curr_section['extra'] = ''
        while True:
            try:
                int(data[0])
                data[0][4]
                break
            except:
                curr_section['extra'] += data.pop(0) + " "
        if l != len(lines) -1 and not(is_a_section_line(lines[l+1])):
            parts = lines[l+1].split()
            for p in parts:
                curr_section['extra'] += '%s ' % (p) if p == p.upper() else ''
        curr_section['extra'] = curr_section['extra'][:-1]
        
def get_class_num(data,curr_section):
    if data[0].isdigit():
        curr_section['class_num'] = data[0]
    else:
        curr_section['class_num'] = 'N/A'
        data.insert(0,'N/A')

def get_section_type(data,curr_section):
    if data[1]+' ' in types:
        curr_section['type'] = data[1]
    else:
        curr_section['type'] = 'N/A'
        data.insert(1,'N/A')

def get_section_num(data,curr_section):
    if any(x.isdigit() for x in data[2]):
        curr_section['sect_num'] = data[2]
    else:
        curr_section['sect_num'] = 'N/A'
        data.insert(2,'N/A')

def get_section_time(data,curr_section):
    if data[4] != 'TBA':
        times = data[4].split('-')
        curr_section['time_start'] = times[0]
        curr_section['time_end'] = times[1][:times[1].index('M')-1]
        if curr_section['time_end'].split(':')[0] == '12' and int(curr_section['time_start'].split(':')[0]) < 12:
            curr_section['am_pm'] = 'AM'
        else:
            curr_section['am_pm'] = times[1][times[1].index('M')-1:]
    else:
        curr_section['time_start'] = 'TBA'
        curr_section['time_end'] = 'TBA'
        curr_section['am_pm'] = 'N/A'


def get_location_room_and_instructor(data,curr_section):
    location_ind_end = 5
    while location_ind_end < len(data) and not(any(w.isdigit() for w in data[location_ind_end])):
        location_ind_end += 1

    if location_ind_end != len(data):
        curr_section['location'] = ' '.join(w for w in data[5:location_ind_end])
        curr_section['room'] = data[location_ind_end]
        curr_section['instructor'] = ' '.join(w for w in data[location_ind_end+1:]) + ','
    else:
        curr_section['location'] = 'N/A'
        curr_section['room'] = 'N/A'
        curr_section['instructor'] = ' '.join(w for w in data[5:len(data)]) + ','

    
def section_line_stuff(course,lines,i,end_of_course):
    curr_section = None
    for l in range(i,end_of_course):
        
        if is_a_section_line(lines[l]):
            
            if curr_section != None:                
                curr_section['instructor'] = curr_section['instructor'][:-1]
                course['sections'].append(curr_section)
            
            curr_section = {}
            data = lines[l].split()

            filter_out_header(data,curr_section,lines,l)
            get_class_num(data,curr_section)
            get_section_type(data,curr_section)
            get_section_num(data,curr_section)

            if curr_section['class_num'] == 55076:
                print present
            

            if data[3] != 'HTBA':

                curr_section['days'] = get_days(data[3])
                get_section_time(data,curr_section)
                get_location_room_and_instructor(data,curr_section)

            else:
                
                curr_section['days'] = 'HTBA'
                curr_section['time_start'] = 'TBA'
                curr_section['time_end'] = 'TBA'
                curr_section['location'] = 'TBA' #can't assume this e.g. ext 288
                curr_section['room'] = 'TBA' #can't assume this
                curr_section['instructor'] = 'TBA' #can't assume this
                        
        else:
            #print lines[l]
            parts = lines[l].split()
            for p in parts:
                curr_section['instructor'] += '%s ' % (p) if p != p.upper() else ''
            
        if l == end_of_course - 1:
            curr_section['instructor'] = curr_section['instructor'][:-1]
            course['sections'].append(curr_section)


def get_course_info():

    f = open('Spring2018Courses.txt','r')
    lines = f.readlines()[4:] #skip the begin headers

    depts = {} #not used at the moment, contains full department names
    courses = {}

    x = 0
    while x < len(lines):

        line = lines[x]
        
        if usable(line):
            if 'Courses' in line:
                add_dept_to_courses(line,depts,courses)
            
            elif 'Credit(s)' in line: #course info
            
                course = {'sections':[]}
                end_of_course = get_end_of_course(lines,x)
                    
                course_info = line.split()
                dpt = course_info[0]
                code = course_info[1]


                if len(course_info[2]) == 1:
                    dcsk = course_info[2]
                    name_start = 3
                else:
                    dcsk = ''
                    name_start = 2
                
                if 'SBC:' in course_info:
                    sbc_start = course_info.index('SBC:')
                    sbc = ''.join(c for c in course_info[sbc_start+1:])
                else:
                    sbc_start = len(course_info)
                    sbc = ''

                if course_info[sbc_start-2] != 'to':
                    name = ' '.join(w for w in course_info[name_start:sbc_start-2])
                    credit = course_info[sbc_start-1]
                else:
                    name = ' '.join(w for w in course_info[name_start:sbc_start-4])
                    credit = ' '.join(w for w in course_info[sbc_start-3:sbc_start])

                
                (i,notes) = get_notes(lines,x+1,'')
                
                course['name'] = name
                course['dept'] = dpt
                course['code'] = code
                course['dcsk'] = dcsk
                course['credits'] = credit
                course['sbc'] = sbc
                course['notes'] = notes
            
                #check each line within the course (for sections)
                section_line_stuff(course,lines,i,end_of_course)

                if code not in courses[dpt]:
                    courses[dpt][code] = course
                else:
                    courses[dpt][code]['sections'] += course['sections']
                x = end_of_course-1
                
        x += 1

    return courses



def select_classes():

    info = get_course_info()

    amt = int(raw_input('Enter the amount of classes you plan to take: '))
    full_codes = []
    for i in xrange(amt):
        full_codes.append(raw_input('Enter the class you plan to take in space separated course code, e.g. CSE 101:\n').upper())
    
    courses = []    
    for c in full_codes:
        parts = c.split()
        courses.append(info[parts[0]][parts[1]])


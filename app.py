from flask import Flask, render_template
from utils import selection
from collections import OrderedDict
import json


def write_var_json(filename,var_name,data):
    f = open(filename,'w')
    f.write('var %s = ' % (var_name))
    f.close()
    with open(filename,'a+') as dat:
        json.dump(data,dat)

app = Flask(__name__)

@app.route('/')
def root():
    courses = selection.get_course_info()
    write_var_json('static/Data/courses.json','courses_info',courses)
    course_list = {d:sorted([c for c in courses[d]]) for d in courses}
    course_list = OrderedDict(sorted(course_list.items()))
    write_var_json('static/Data/course_list.json','course_list',course_list)
    
    return render_template('index.html')

app.run(debug=True)

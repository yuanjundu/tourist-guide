from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    line1 = '<h1 style = "text-align: center">Hello, world!</h1>'
    return HttpResponse(line1)

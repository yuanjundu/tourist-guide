import os
import json
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .forms import UserRegisterForm

def map_view(request):
    file_path = os.path.expanduser('~/app/mysite/gmaps/JSON/ny.geojson')
    with open(file_path, 'r') as f:
        data = json.load(f)

    context = {'data': data}
    return render(request, 'map.html', context)

def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('map_view')
        else:
            print("Form is not valid")
            print(form.errors)
    else:
        form = UserRegisterForm()
        print("Not a POST request")

    file_path = os.path.expanduser('~/app/mysite/gmaps/JSON/ny.geojson')
    with open(file_path, 'r') as f:
        data = json.load(f)

    return render(request, 'map.html', {'form': form, 'data': data})


def user_login(request):
    if request.method == 'POST':
        print(request.POST)
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            print('User', username, 'log in')
            return redirect(map_view)
        else:
            messages.info(request, 'Username or password is incorrect')

        file_path = os.path.expanduser('~/app/mysite/gmaps/JSON/ny.geojson')
        with open(file_path, 'r') as f:
            data = json.load(f)
        context = {'data': data}
        return render(request, 'map.html', context)



def logout_user(request):
    logout(request)
    file_path = os.path.expanduser('~/app/mysite/gmaps/JSON/ny.geojson')
    with open(file_path, 'r') as f:
        data = json.load(f)
    context = {'data': data, 'user': request.user}
    return render(request, 'map.html', context)


def my_space(request):
    return render(request, 'myspace.html', {})

def settings(request):
    return render(request, 'settings.html', {})


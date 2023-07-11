import os
import json
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .forms import UserRegisterForm
from django.contrib.auth import get_user_model

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

def default(request):
    return render(request, 'main.html')

def loginPage(request):
    return render(request, 'login.html')

def signup(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect(loginPage)
        else:
            print(form.errors)
#            messages.error(request, 'There was an error with your registration.')
            return render(request, 'signup.html', {'form': form})
    else:
        form = UserRegisterForm()
        print("Not a POST request")

    return render(request, 'signup.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        username_or_email = request.POST.get('username_or_email')
        password = request.POST.get('password')

        User = get_user_model()
        try:
            # Check if a user exists with this email address.
            user = User.objects.get(email=username_or_email)
        except User.DoesNotExist:
            # If not, try to get a user with this username.
            try:
                user = User.objects.get(username=username_or_email)
            except User.DoesNotExist:
                user = None

        if user is not None:
            if user.check_password(password):
                login(request, user)
                return redirect(default)
            else:
                messages.info(request, 'Incorrect password')
        else:
            messages.info(request, 'Username or email address not found')
        return render(request, 'login.html')

def logout_user(request):
    logout(request)
    return render(request, 'index.html')


def my_space(request):
    return render(request, 'myspace.html', {})

def settings(request):
    return render(request, 'settings.html', {})


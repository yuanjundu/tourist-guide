import os
import json
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .forms import UserRegisterForm
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework import serializers, views, status, viewsets
from rest_framework.response import Response
from .models import Attractions
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.core.validators import MaxLengthValidator


class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    # Restrictions on username
    username = serializers.CharField(
        validators=[ASCIIUsernameValidator(), MaxLengthValidator(150)]
    )

    # Restrictions on email
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        username = attrs.get('username')

        if password != password2:
            raise serializers.ValidationError("The two password fields didn't match.")

        # Validate the password and catch the exception
        errors = dict() 
        try:
            validate_password(password=password, user=User(username=username))
        except django_exceptions.ValidationError as e:
            errors['password'] = list(e.messages)

        if errors:
            raise serializers.ValidationError(errors)

        return super(UserSerializer, self).validate(attrs)

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)



class SignupView(views.APIView):
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        print(serializer.errors) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



class AttractionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attractions
        fields = ['id', 'housenumber', 'street', 'postcode', 'name', 'opening_hours', 'phone', 'website', 'geom', 'image', 'zone', 'tag']

class AttractionsViewSet(viewsets.ModelViewSet):
    queryset = Attractions.objects.all()
    serializer_class = AttractionsSerializer

def default(request):
    return redirect('http://localhost:3000/')

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
                refresh = RefreshToken.for_user(user)
                return JsonResponse({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            else:
                messages.info(request, 'Incorrect password')
        else:
            messages.info(request, 'Username or email address not found')
        return render(request, 'login.html')

def logout_user(request):
    logout(request)
    return redirect(default)


def my_space(request):
    return render(request, 'myspace.html', {})

def settings(request):
    return render(request, 'settings.html', {})


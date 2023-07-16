import os
import json
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core import exceptions as django_exceptions
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.core.validators import MaxLengthValidator
from .models import Attractions, Restaurant, AttractionRestaurants, Itinerary
from django.contrib.auth.password_validation import validate_password
from django.shortcuts import get_object_or_404

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers, views, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .algorithm import TSP, greedy_TSP

import logging

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    # Restrictions on username
    username = serializers.CharField(
        validators=[ASCIIUsernameValidator(), MaxLengthValidator(150)]
    )

    # Restrictions on email
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
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
    
    def update(self, instance, validated_data):
        if 'password2' in validated_data:
            validated_data.pop('password2')

        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))

            return super().update(instance, validated_data)
        

class UserUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    # Restrictions on username
    username = serializers.CharField(
        validators=[ASCIIUsernameValidator(), MaxLengthValidator(150)]
    )

    # Restrictions on email
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        extra_kwargs = {}

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return Response({"detail": "Profile updated successfully."}, status=status.HTTP_200_OK)


class UserProfileUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    http_method_names = ['patch', 'head', 'options']

    def get_object(self):
        return self.request.user
    

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        new_password2 = request.data.get("new_password2")

        if not user.check_password(old_password):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != new_password2:
            return Response({"new_password": ["New passwords don't match."]}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the password and catch the exception
        errors = dict() 
        try:
            validate_password(password=new_password, user=user)
        except django_exceptions.ValidationError as e:
            errors['new_password'] = list(e.messages)

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


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

class RestaurantsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'housenumber', 'street', 'postcode', 'name', 'opening_hours', 'phone', 'website', 'geom', 'image', 'zone', 'tag']

class RestaurantsByAttractionView(generics.ListAPIView):
    serializer_class = RestaurantsSerializer

    def get_queryset(self):
        attraction = get_object_or_404(Attractions, pk=self.kwargs['pk'])
        restaurant_ids = AttractionRestaurants.objects.filter(attraction=attraction).values_list('restaurant', flat=True)
        return Restaurant.objects.filter(id__in=restaurant_ids) 
    


class TSPView(APIView):
    """
    View to solve the Traveling Salesman Problem for attractions
    """

    def post(self, request, format=None):
        data = request.data
        try:
            date = data.get('selectedDate')
            lat = data.get('latitude')
            lon = data.get('longitude')
            attractions = data.get('placesAttractions')
            ordered_attractions = greedy_TSP(date, lat, lon, attractions)
            return Response(ordered_attractions, status=status.HTTP_200_OK)
        except KeyError:
            return Response({'error': 'Invalid request, no placeAttractions found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error('Unexpected error: %s', e, exc_info=True) 
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ItineraryView(APIView):
    """
    View to save itinerary history
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        data = request.data
        user = request.user
        morning_attractions_data = data.get('morningAttractions')
        afternoon_attractions_data = data.get('afternoonAttractions')
        restaurant = data.get('selectedRestaurant')
        selected_date = data.get('selectedDate')

        # extract the ids from the morning and afternoon attractions data
        morning_attractions = [attraction['id'] for attraction in morning_attractions_data]
        afternoon_attractions = [attraction['id'] for attraction in afternoon_attractions_data]

        restaurant_instance = Restaurant.objects.get(id=restaurant['id'])
        itinerary = Itinerary.objects.create(user=user, selected_restaurant=restaurant_instance, saved_date=selected_date)
        itinerary.morning_attractions.set(morning_attractions)
        itinerary.afternoon_attractions.set(afternoon_attractions)
        itinerary.save()

        return Response({'message': 'Itinerary saved successfully'}, status=status.HTTP_200_OK)


class ItineraryHistoryView(APIView):
    """
    View to fetch itinerary history
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        itineraries = Itinerary.objects.filter(user=user)
        data = [itinerary.to_dict() for itinerary in itineraries]
        return Response(data, status=status.HTTP_200_OK)
    

class DeleteItineraryView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        itinerary = get_object_or_404(Itinerary, id=id, user=request.user)
        itinerary.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
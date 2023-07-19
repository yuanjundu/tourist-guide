import os
import json
import numpy as np
import pandas as pd
from django.http import JsonResponse, Http404
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
from .models import Attractions, Restaurant, AttractionRestaurants, Itinerary, UserItinerary, CommunityItinerary
from django.contrib.auth.password_validation import validate_password
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers, views, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .algorithm import TSP, greedy_TSP
import joblib

import traceback
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
        fields = ['id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name']
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
        return instance


class UserProfileUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    http_method_names = ['patch', 'head', 'options']

    def get_object(self):
        return self.request.user
    
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"detail": "Profile updated successfully."}, status=status.HTTP_200_OK)
    

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

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


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

        return Response({'message': 'Itinerary saved successfully', 'itineraryId': itinerary.id}, status=status.HTTP_200_OK)


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
    
class ShareItineraryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        itinerary = get_object_or_404(Itinerary, id=id, user=request.user)

        if CommunityItinerary.objects.filter(itinerary=itinerary).exists():
            return Response({"message": "This itinerary is already shared."}, status=status.HTTP_400_BAD_REQUEST)

        shared_itinerary = CommunityItinerary(itinerary=itinerary, shared_on=timezone.now())
        shared_itinerary.save()

        # Add the creator as a joined user
        user_itinerary = UserItinerary(user=request.user, community_itinerary=shared_itinerary, joined_on=timezone.now())
        user_itinerary.save()

        return Response({"message": "Itinerary shared successfully."}, status=status.HTTP_200_OK)

    def delete(self, request, id):
        community_itinerary = get_object_or_404(CommunityItinerary, id=id)

        # Check if the user owns the itinerary
        if community_itinerary.itinerary.user != request.user:
            return Response({"message": "You are not allowed to delete this itinerary."}, status=status.HTTP_403_FORBIDDEN)

        community_itinerary.delete()

        return Response({"message": "Itinerary deleted successfully."}, status=status.HTTP_200_OK)
    
class ItinerarySerializer(serializers.ModelSerializer):
    morning_attractions = AttractionsSerializer(many=True, read_only=True)
    afternoon_attractions = AttractionsSerializer(many=True, read_only=True)
    selected_restaurant = RestaurantsSerializer(read_only=True)
    class Meta:
        model = Itinerary
        fields = ['user', 'morning_attractions', 'afternoon_attractions', 'selected_restaurant', 'saved_date']

class CommunityItinerarySerializer(serializers.ModelSerializer):
    itinerary = ItinerarySerializer()
    user = UserSerializer(read_only=True, source='itinerary.user')
    # user = serializers.PrimaryKeyRelatedField(read_only=True)
    joined_users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = CommunityItinerary
        fields = ['id', 'itinerary', 'shared_on', 'joined_users', 'user']

class JoinItineraryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        logger.info(f"Received request with headers: {request.headers}")
        community_itinerary = get_object_or_404(CommunityItinerary, id=id)

        if UserItinerary.objects.filter(user=request.user, community_itinerary=community_itinerary).exists():
            return Response({"message": "You have already joined this itinerary."}, status=status.HTTP_400_BAD_REQUEST)

        joined_itinerary = UserItinerary(user=request.user, community_itinerary=community_itinerary, joined_on=timezone.now())
        joined_itinerary.save()

        return Response({"message": "Joined the itinerary successfully."}, status=status.HTTP_200_OK)
    
class CommunityItineraryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shared_itineraries = CommunityItinerary.objects.all()
        print(shared_itineraries)
        serializer = CommunityItinerarySerializer(shared_itineraries, many=True)
        return Response(serializer.data)

class ExitItineraryView(APIView):
    """
    View to exit a community itinerary
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, id, format=None):
        community_itinerary = get_object_or_404(CommunityItinerary, id=id)
        user_itinerary = get_object_or_404(UserItinerary, user=request.user, community_itinerary=community_itinerary)

        user_itinerary.delete()
        return Response({"message": "Successfully exited the itinerary."}, status=status.HTTP_200_OK)
    
class BusynessView(APIView):
    """
    Predict the busyness for a given zone and time
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, zone_id, timestamp):
        print(zone_id, timestamp)
        try:
            model_path = f'gmaps/pkl/{zone_id}.pkl'
            if not os.path.exists(model_path):
                raise Http404

            model = joblib.load(model_path)
            timestamp = np.array([int(timestamp)]).reshape(-1, 1)
            busyness = model.predict(timestamp)[0]
            return Response({"busyness": busyness}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}, Type: {type(e)}, Traceback: {traceback.format_exc()}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self, queryset=None):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        return obj


class BusynessDayView(APIView):
    """
    Predict the busyness for a given zone and the next 24 hours
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, zone_id, timestamp):
        print(zone_id, timestamp)
        try:
            model_path = f'gmaps/pkl/{zone_id}.pkl'
            if not os.path.exists(model_path):
                raise Http404

            model = joblib.load(model_path)
            timestamps = np.array([int(timestamp) + i*3600 for i in range(24)]).reshape(-1, 1)
            busyness = model.predict(timestamps).tolist()
            print(busyness)
            response_data = [{"timestamp": ts, "busyness": bs} for ts, bs in zip(timestamps.flatten(), busyness)]
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}, Type: {type(e)}, Traceback: {traceback.format_exc()}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
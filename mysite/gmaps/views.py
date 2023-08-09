import os
import json
from xml.dom import ValidationErr
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
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
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
from .algorithm import genetic_algorithm, get_busyness_locations, get_day_and_closest_quarter_minute
import joblib
import pickle
from datetime import datetime
import traceback
import logging

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    # write_only: this field is used for write operations but not included in serialized output
    password2 = serializers.CharField(write_only=True)

    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    # Username must contain only ASCII characters and have a maximum length of 150
    username = serializers.CharField(
        validators=[ASCIIUsernameValidator(), MaxLengthValidator(150)]
    )

    # Email field is required and will be validated
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
    """
    View to update user profile
    """
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    # Username must contain only ASCII characters and have a maximum length of 150
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
    """
    View to change password
    """
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
    """
    View to return serilized data of users
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SignupView(views.APIView):
    """
    View to sign up
    """
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)
        print(request.data)

        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        print(serializer.errors) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PasswordResetRequestView(APIView):
    '''
    View to request password reset email
    '''
    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        user = User.objects.filter(email=email, username=username).first()
        if not user:
            return Response({"detail": "User with this username and email does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        mail_subject = 'Reset your password.'
        reset_url = f'http://localhost:3000/password/reset/{uid}/{token}/'
        message = f'Hi {user.username},\n\nYou requested a password reset. Please go to the following page and choose a new password:\n\n{reset_url}\n\nIf you didn\'t request this, please ignore this email.\n\nYour password won\'t change until you access the link and create a new one.'
        send_mail(mail_subject, message, 'veritast2223@gmail.com', [email])
        return Response({"detail": "Password reset email has been sent."})


class PasswordResetConfirmView(APIView):
    '''
    View to reset password
    '''
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        if user is not None and default_token_generator.check_token(user, token):
            password = request.data.get("password")
            password2 = request.data.get("password2")
            if password != password2:
                return Response({"password": ["Passwords don't match."]}, status=status.HTTP_400_BAD_REQUEST)
            try:
                validate_password(password)
            except ValidationErr as e:
                return Response({"password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(password)
            # Invalidate the token by changing the last login time
            user.last_login = timezone.now()
            user.save()
            return Response({"detail": "Password has been reset."})
        else:
            return Response({"detail": "The reset password link is no longer valid."}, status=status.HTTP_400_BAD_REQUEST)



class AttractionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attractions
        fields = ['id', 'housenumber', 'street', 'postcode', 'name', 'opening_hours', 'phone', 'website', 'geom', 'image', 'zone', 'tag']

class AttractionsViewSet(viewsets.ModelViewSet):
    queryset = Attractions.objects.all()
    serializer_class = AttractionsSerializer

class RestaurantsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'housenumber', 'street', 'postcode', 'name', 'opening_hours', 'phone', 'website', 'geom', 'image', 'zone', 'tag']

class RestaurantsByAttractionView(generics.ListAPIView):
    """
    View to return restaurants related to an attraction
    """
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
        lunch_restaurant_id = data.get('selectedLunchRestaurant')
        dinner_restaurant_id = data.get('selectedDinnerRestaurant')
        selected_date = data.get('selectedDate')

        # extract the ids from the morning and afternoon attractions data
        morning_attractions = [attraction['id'] for attraction in morning_attractions_data]
        afternoon_attractions = [attraction['id'] for attraction in afternoon_attractions_data]

        lunch_restaurant_instance = Restaurant.objects.get(id=lunch_restaurant_id)
        dinner_restaurant_instance = Restaurant.objects.get(id=dinner_restaurant_id)
        itinerary = Itinerary.objects.create(user=user, lunch_restaurant=lunch_restaurant_instance, dinner_restaurant=dinner_restaurant_instance, saved_date=selected_date)
        itinerary.save()
        itinerary.morning_attractions.set(morning_attractions)
        itinerary.afternoon_attractions.set(afternoon_attractions)
        
        return Response({'message': 'Itinerary saved successfully', 'itineraryId': itinerary.id}, status=status.HTTP_200_OK)




class ItineraryHistoryView(APIView):
    """
    View to fetch itinerary history
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        itineraries = Itinerary.objects.filter(user=user)
        
        # Use ItinerarySerializer to serialize each itinerary
        serializer = ItinerarySerializer(itineraries, many=True)
        data = serializer.data
        
        return Response(data, status=status.HTTP_200_OK)



class DeleteItineraryView(APIView):
    """
    View to delete itinerary in history
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        itinerary = get_object_or_404(Itinerary, id=id, user=request.user)
        itinerary.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ShareItineraryView(APIView):
    """
    View to share and delete itinerary in community
    """
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
    lunch_restaurant = RestaurantsSerializer(read_only=True)
    dinner_restaurant = RestaurantsSerializer(read_only=True)
    
    class Meta:
        model = Itinerary
        fields = ['user', 'morning_attractions', 'afternoon_attractions', 'lunch_restaurant', 'dinner_restaurant', 'saved_date']


class CommunityItinerarySerializer(serializers.ModelSerializer):
    itinerary = ItinerarySerializer()
    user = UserSerializer(read_only=True, source='itinerary.user')
    # user = serializers.PrimaryKeyRelatedField(read_only=True)
    joined_users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = CommunityItinerary
        fields = ['id', 'itinerary', 'shared_on', 'joined_users', 'user']

class JoinItineraryView(APIView):
    """
    View to join itinerary
    """
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
    """
    View to list itinerary in community
    """
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
    # permission_classes = [IsAuthenticated]
    
    def post(self, request):
        zone_id = request.data.get('zone_id')
        date_str = request.data.get('date_str')

        try:
            model_path = 'gmaps/pkl/busyness_model.pkl'
            if not os.path.exists(model_path):
                raise Http404

            model = joblib.load(model_path)

            day_of_year, total_minutes = get_day_and_closest_quarter_minute(date_str)
            
            new_data = pd.DataFrame({
                'LocationID': [zone_id],  
                'day_of_year': [day_of_year], 
                'minute_of_day': [total_minutes]
            })

            busyness =  model.predict(new_data)
            return Response({"busyness": busyness.tolist()}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}, Type: {type(e)}, Traceback: {traceback.format_exc()}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GeneView(APIView):
    """
    Use Genetic algorithm to find optimal path
    """
    # permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        selected_date = data.get('selectedDate')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        places_attractions = data.get('placesAttractions')

        # Extract the ids from the places_attractions list
        places_attractions_ids = [place['id'] for place in places_attractions]

        locations = Attractions.objects.filter(id__in=places_attractions_ids)
        locations_data = AttractionsSerializer(locations, many=True).data

        # get busyness data for the attractions
        busyness_locations = get_busyness_locations(locations_data, selected_date)

        optimal_order = genetic_algorithm(len(places_attractions), busyness_locations)

        # print(optimal_order)

        optimal_order_data = [next(attraction for attraction in locations_data if attraction['id'] == location_id) for location_id in optimal_order.values()]

        return JsonResponse(optimal_order_data, safe=False)

class AllZonesBusynessView(APIView):
    """
    Predict the busyness for all zones for a given date
    """
    
    def post(self, request):
        date_str = request.data.get('date_str')
        response = []

        try:
            model_path = 'gmaps/pkl/busyness_model.pkl'
            if not os.path.exists(model_path):
                raise Http404

            model = joblib.load(model_path)
            day_of_year, total_minutes = get_day_and_closest_quarter_minute(date_str)

            for zone_id in range(1, 264): # zones from 1 to 263
                new_data = pd.DataFrame({
                    'LocationID': [zone_id],  
                    'day_of_year': [day_of_year], 
                    'minute_of_day': [total_minutes]
                })

                busyness =  model.predict(new_data)
                response.append({
                    "zone_id": zone_id,
                    "busyness": busyness.tolist()
                })

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Exception: {str(e)}, Type: {type(e)}, Traceback: {traceback.format_exc()}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

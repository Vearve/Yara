"""
User Profile Serializers
Extends Django User model with profile fields
"""

from rest_framework import serializers
from django.contrib.auth.models import User


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    job_title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    personality_type = serializers.CharField(max_length=300, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'profile_picture', 'job_title', 'bio', 'personality_type'
        ]
        read_only_fields = ['id', 'username']
    
    def to_representation(self, instance):
        """Add profile fields from UserProfile model if it exists"""
        data = super().to_representation(instance)
        
        # Try to get profile from related UserProfile model
        try:
            profile = instance.userprofile
            data['profile_picture'] = profile.profile_picture.url if profile.profile_picture else None
            data['job_title'] = profile.job_title
            data['bio'] = profile.bio
            data['personality_type'] = profile.personality_type
        except:
            # If no profile exists, return None for profile fields
            data['profile_picture'] = None
            data['job_title'] = ''
            data['bio'] = ''
            data['personality_type'] = ''
        
        return data
    
    def update(self, instance, validated_data):
        """Update user and profile fields"""
        # Update basic user fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        # Update or create profile
        from .models import UserProfile
        profile, created = UserProfile.objects.get_or_create(user=instance)
        
        if 'profile_picture' in validated_data:
            profile.profile_picture = validated_data['profile_picture']
        if 'job_title' in validated_data:
            profile.job_title = validated_data['job_title']
        if 'bio' in validated_data:
            profile.bio = validated_data['bio']
        if 'personality_type' in validated_data:
            profile.personality_type = validated_data['personality_type']
        
        profile.save()
        
        return instance

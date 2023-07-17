from django.core.management.base import BaseCommand
from django.utils import timezone
from myapp.models import Itinerary

class Command(BaseCommand):
    help = 'Delete old itineraries'

    def handle(self, *args, **options):
        Itinerary.objects.filter(saved_date__lt=timezone.now().date()).delete()
        self.stdout.write(self.style.SUCCESS('Successfully deleted old itineraries'))

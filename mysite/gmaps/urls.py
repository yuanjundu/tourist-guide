import os
import json
from django.shortcuts import render

def map_view(request):
    file_path = os.path.expanduser('~/app/ny.geojson')
    with open(file_path, 'r') as f:
        data = json.load(f)

    context = {'data': data}
    return render(request, 'templates/map.html', context)


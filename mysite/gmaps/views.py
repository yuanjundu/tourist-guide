import json
from django.shortcuts import render
import os

def map_view(request):
    file_path = os.path.join(os.path.dirname(__file__),'JSON', 'ny.geojson')
    with open(file_path, 'r') as f:
        data = json.load(f)

    context = {'data': data}
    return render(request, 'map.html', context)


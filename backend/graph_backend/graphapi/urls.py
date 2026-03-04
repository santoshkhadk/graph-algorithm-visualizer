from django.urls import path
from .views import run_algorithm

urlpatterns = [
    path('run/', run_algorithm),
]